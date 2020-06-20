import * as chroma from "chroma-js";
import { values } from "d3";

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

const ValueAccessors: { [K in AggregateValue]: (c: chroma.Color) => number } = {
  hue: (c) => c.hsl[0],
  lightness: (c) => c.hsl[2],
  saturation: (c) => c.hsl[1],
  luminance: (c) => c.luminance(),
};

export class OffscreenCanvasContext {
  constructor(public canvas: OffscreenCanvas, public context: OffscreenCanvasRenderingContext2D) {}

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  get smallestDimension(): number {
    return Math.min(this.width, this.height);
  }

  get center(): [number, number] {
    return [this.width / 2, this.height / 2];
  }

  getColor(x: number, y: number): chroma.Color {
    const raw = this.context.getImageData(x, y, 1, 1);
    return chroma.rgb(raw.data[0], raw.data[1], raw.data[2]);
  }

  getChunkFlat(x: number, y: number, w: number, h: number): chroma.Color[] {
    const raw = this.context.getImageData(x, y, w, h);

    const res: chroma.Color[] = [];
    for (let i = 0; i < raw.data.length; i += 4) {
      res.push(chroma.rgb(raw.data[i], raw.data[i + 1], raw.data[i + 2]));
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

    const flat = res.map((chunk) => this.aggregateChunk(chunk[0], chunk[1], chunk[2], chunk[3], agg, val));

    return flat;
  }

  aggregateChunk(x: number, y: number, w: number, h: number, agg: AggregateOperation, val: AggregateValue) {
    const chunk = this.getChunkFlat(x, y, w, h);
    const accessor = ValueAccessors[val];
    const mapped = chunk.map((c) => accessor(c));
    return Aggregators[agg](mapped);
  }

  getChunk(x: number, y: number, w: number, h: number): chroma.Color[][] {
    const raw = this.context.getImageData(x, y, w, h);
    const res: chroma.Color[][] = [[]];
    let current = res[0];

    for (let i = 0; i < raw.data.length; i += 4) {
      current.push(chroma.rgb(raw.data[i], raw.data[i + 1], raw.data[i + 2]));

      if (current.length === raw.width) {
        current = [];
        res.push(current);
      }
    }

    return res;
  }
}
