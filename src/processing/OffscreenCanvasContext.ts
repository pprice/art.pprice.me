// import * as chroma from "chroma-js";

import { rgb2Luminance, RGBA, rgb2hsl } from "./Color";

export async function createOffscreenCanvas(source: string) {
  const image = await loadImageAsync(source);

  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return new OffscreenCanvasContext(canvas, context);
}

export function loadImageAsync(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.crossOrigin = "Anonymous";
    image.src = source;
  });
}

type AggregateOperation = "avg" | "median" | "min" | "max";
type AggregateValue = "luminance" | "hue" | "saturation" | "lightness";

function chunkArray<T>(arr: T[], w: number): T[][] {
  const result: T[][] = [[]];
  let current = result[0];

  for (let i = 0; i < arr.length; i++) {
    if (current.length == w) {
      current = [];
      result.push(current);
    }

    current.push(arr[i]);
  }

  return result;
}

const Aggregators: { [K in AggregateOperation]: (values: number[]) => number } = {
  avg: (values) => values.reduce((sum, i) => sum + i || 0, 0) / values.length,
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  median: (values) => {
    if (values.length <= 1) {
      return values[0];
    }

    const sorted = values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);

    return sorted.length % 2 === 0 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  },
};

type RGBAToFloat = (c: RGBA) => number;

const ValueAccessors: { [K in AggregateValue]: RGBAToFloat } = {
  hue: (c) => rgb2hsl(c)[0],
  saturation: (c) => rgb2hsl(c)[1],
  lightness: (c) => rgb2hsl(c)[2],
  luminance: (c) => rgb2Luminance(c),
};

export class OffscreenCanvasContext {
  constructor(public canvas: OffscreenCanvas, public context: OffscreenCanvasRenderingContext2D) {}

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  get size(): [number, number] {
    return [this.width, this.height];
  }

  get smallestDimension(): number {
    return Math.min(this.width, this.height);
  }

  get largestDimension(): number {
    return Math.max(this.width, this.height);
  }

  get center(): [number, number] {
    return [this.width / 2, this.height / 2];
  }

  getColor(x: number, y: number): RGBA {
    const raw = this.getImageData(x, y, 1, 1);
    return new Uint8ClampedArray(raw.buffer.slice(0, 4));
  }

  getChunkFlat(x: number, y: number, w: number, h: number): RGBA[] {
    // const raw = this.context.getImageData(x, y, w, h);
    const dv = this.getImageData(x, y, w, h);

    const res: RGBA[] = [];
    for (let i = 0; i < dv.byteLength; i += 4) {
      res.push(new Uint8ClampedArray(dv.buffer, i, 4));
    }

    return res;
  }

  aggregateChunksAspectRatioFlat(count: number, agg: AggregateOperation, val: AggregateValue): number[] {
    if (this.width === this.height) {
      return this.aggregateChunksFlat(count, count, agg, val);
    } else if (this.width > this.height) {
      const horizontal = count;
      const vertical = Math.floor(count * (this.height / this.width));
      return this.aggregateChunksFlat(horizontal, vertical, agg, val);
    }

    const vertical = count;
    const horizontal = Math.floor(count * (this.width / this.height));
    return this.aggregateChunksFlat(horizontal, vertical, agg, val);
  }

  aggregateChunksFlat(horizontal: number, vertical: number, agg: AggregateOperation, val: AggregateValue): number[] {
    const hSegmentSize = Math.floor(this.width / horizontal);
    const vSegmentSize = Math.floor(this.height / vertical);

    const res = [];

    for (let x = 0; x < horizontal; x++) {
      for (let y = 0; y < vertical; y++) {
        res.push([x * hSegmentSize, y * vSegmentSize, hSegmentSize, vSegmentSize]);
      }
    }

    const cacheContext = new Map<number, number>();
    const flat = res.map((chunk) =>
      this.aggregateChunk(chunk[0], chunk[1], chunk[2], chunk[3], agg, val, cacheContext)
    );

    return flat;
  }

  aggregateChunk(
    x: number,
    y: number,
    w: number,
    h: number,
    agg: AggregateOperation,
    val: AggregateValue,
    cacheContext?: Map<number, number>
  ) {
    const chunk = this.getChunkFlat(x, y, w, h);
    const accessor = this.cachedValueAccessor(ValueAccessors[val], cacheContext);
    const mapped = chunk.map((c) => accessor(c));
    return Aggregators[agg](mapped);
  }

  private cachedValueAccessor(func: RGBAToFloat, cache?: Map<number, number>): RGBAToFloat {
    cache = cache || new Map<number, number>();

    return (v: RGBA): number => {
      const k = new Uint32Array(v.buffer)[0];
      let c = cache.get(k);

      if (c !== undefined) {
        return c;
      }

      c = func(v);
      cache.set(k, c);
      return c;
    };
  }

  private imageDataCache:
    | {
        width: number;
        height: number;
        data: Uint32Array;
      }
    | undefined;

  private getImageData(x: number, y: number, w: number, h: number): DataView {
    if (!this.imageDataCache) {
      const iData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

      this.imageDataCache = {
        data: new Uint32Array(iData.data.buffer),
        width: iData.width,
        height: iData.height,
      };
    }

    let arr = new Uint32Array(w * h); // One 32bit int per pixel
    let i = 0;
    const originalWidth = this.imageDataCache.width;
    const originalHeight = this.imageDataCache.height;
    const data = this.imageDataCache.data;

    for (var row = y; row < h + y; row++) {
      for (var col = x; col < w + x; col++) {
        var offset = row * originalWidth + col;
        if (col < 0 || col >= originalWidth || row < 0 || row >= originalHeight) {
          arr[i++] = 0;
        } else {
          arr[i++] = data[offset];
        }
      }
    }

    return new DataView(arr.buffer);
  }
}
