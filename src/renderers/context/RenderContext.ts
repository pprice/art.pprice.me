import { RandomContext } from "./RandomContext";
import { CanvasSize, BlendMode } from "@/const";
import { array } from "prop-types";

type SegmentStyle = "start" | "end" | "center";

type Point = [number, number];
type Size = [number, number];
type Rect = [number, number, number, number];

export class RenderContext<TConfig, TSetupResult = undefined> {
  public readonly random: RandomContext;

  constructor(
    public readonly pageCanvas: CanvasSize,
    public readonly canvas: CanvasSize,
    public readonly seed: string,
    public readonly blendMode: BlendMode,
    public readonly config: TConfig,
    public readonly setup: TSetupResult
  ) {
    this.random = new RandomContext(seed, canvas);
  }

  public range(start: number, end: number, by: number = 1): number[] {
    let current = start;
    let res: number[] = [];
    while (current <= end) {
      res.push(current);
      current += by;
    }

    return res;
  }

  get width(): number {
    return this.canvas.pixels[0];
  }

  get height(): number {
    return this.canvas.pixels[1];
  }

  get smallestDimension(): number {
    return Math.min(this.width, this.height);
  }

  get center(): Point {
    return [this.width / 2, this.height / 2];
  }

  clampVertical(y: number, padding: number = 0): number {
    return Math.max(padding, Math.min(y, this.height - padding));
  }

  clampHorizontal(x: number, padding: number = 0): number {
    return Math.max(padding, Math.min(x, this.width - padding));
  }

  clamp([x, y]: Point, padding: number = 0) {
    return [this.clampHorizontal(x, padding), this.clampVertical(y, padding)];
  }

  inchesToPixels(inches: number) {
    return inches * 96;
  }

  fitRect(w: number | Size, h?: number): Size {
    let w2 = -1;
    let h2 = -1;

    if (Array.isArray(w)) {
      w2 = w[0];
      h2 = w[1];
    } else if (h !== undefined) {
      w2 = w;
      h2 = h;
    } else {
      return [0, 0];
    }

    if (this.width > this.height) {
      return [this.height * (w2 / h2), this.height];
    } else {
      return [this.width, this.width * (h2 / w2)];
    }
  }

  centerRect(w: number | Size, h?: number): Point {
    let w2: number = -1;
    let h2: number = -1;
    if (Array.isArray(w)) {
      w2 = w[0];
      h2 = w[1];
    } else if (h !== undefined) {
      w2 = w;
      h2 = h;
    }

    return [this.width / 2 - w2 / 2, this.height / 2 - h2 / 2];
  }

  centerFitRect(w: number | Size, h?: number): Rect {
    const wh = this.fitRect(w, h);
    const xy = this.centerRect(wh);

    return [...xy, ...wh];
  }

  segment(
    horizontal: number,
    vertical: number,
    style: SegmentStyle = "center",
    w = this.width,
    h = this.height
  ): number[][] {
    const hSegmentSize = w / horizontal;
    const vSegmentSize = h / vertical;

    const hAdjust = this.getSegmentAdjustment(style, hSegmentSize);
    const yAdjust = this.getSegmentAdjustment(style, vSegmentSize);

    const res = [];

    for (let x = 0; x < horizontal; x++) {
      for (let y = 0; y < vertical; y++) {
        res.push([x * hSegmentSize + hAdjust, y * vSegmentSize + yAdjust]);
      }
    }

    return res;
  }

  segmentAspectRatio(count: number, style: SegmentStyle = "center", w = this.width, h = this.height): number[][] {
    if (w === h) {
      return this.segment(count, count, style);
    } else if (w > h) {
      const horizontal = count;
      const vertical = Math.floor(count * (h / w));
      return this.segment(horizontal, vertical, style, w, h);
    } else {
      const vertical = count;
      const horizontal = Math.floor(count * (w / h));
      return this.segment(horizontal, vertical, style, w, h);
    }
  }

  segmentDimension(
    count: number,
    orientation: "horizontal" | "vertical",
    style: SegmentStyle = "center",
    w = this.width,
    h = this.height
  ): number[] {
    const dimensionLength = orientation === "horizontal" ? w : h;
    const segmentSize = dimensionLength / count;
    const adjust = this.getSegmentAdjustment(style, segmentSize);

    let res = [];
    for (let i = 0; i < count; i++) {
      res.push(segmentSize * i + adjust);
    }

    return res;
  }

  private getSegmentAdjustment(style: string, segmentSize: number) {
    return style === "center" ? segmentSize / 2 : style === "end" ? segmentSize : 0;
  }
}
