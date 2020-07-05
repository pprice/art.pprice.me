import { OffscreenImageDataCanvas, DomImageDataCanvas, ImageDataCanvas, ServerSideCanvas } from "./Canvas";
import { domLoadImageAsync } from "./Image";
import { rgb2hsl, rgb2Luminance, RGBA } from "./Color";
import { Box, size, box, Size } from "../geom";

export async function createCanvas(source: string, ctx?: { baseUrl: string }): Promise<CanvasContext | undefined> {
  if (process.browser) {
    const image = await domLoadImageAsync(source);

    console.log("HAVE IMAGE");
    let canvas: ImageDataCanvas;

    if (OffscreenImageDataCanvas.supported()) {
      canvas = new OffscreenImageDataCanvas(image);
    } else {
      canvas = new DomImageDataCanvas(image);
    }

    return new CanvasContext(canvas);
  }

  const serverSideLoader = new ServerSideCanvas(source, ctx?.baseUrl);
  await serverSideLoader.init();
  return new CanvasContext(serverSideLoader);
}

type AggregateOperation = "avg" | "median" | "min" | "max";
type AggregateValue = "luminance" | "hue" | "saturation" | "lightness";

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

export class CanvasContext {
  constructor(public canvas: ImageDataCanvas) {
    if (!canvas) {
      throw new Error("Canvas must be specified");
    }
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  get size(): Size {
    return size(this.width, this.height);
  }

  get bounds(): Box {
    return box(0, 0, this.width, this.height);
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

  destroy() {
    this.imageDataCache = undefined;
    this.canvas?.destroy();
    this.canvas = undefined;
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
      const iData = this.canvas.getImageData();

      this.imageDataCache = {
        data: new Uint32Array(iData.buffer),
        width: this.canvas.width,
        height: this.canvas.height,
      };
    }

    const arr = new Uint32Array(w * h); // One 32bit int per pixel
    let i = 0;
    const originalWidth = this.imageDataCache.width;
    const originalHeight = this.imageDataCache.height;
    const data = this.imageDataCache.data;

    for (let row = y; row < h + y; row++) {
      for (let col = x; col < w + x; col++) {
        const offset = row * originalWidth + col;
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
