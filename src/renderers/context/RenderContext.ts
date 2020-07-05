import { RandomContext } from "./RandomContext";
import { CanvasSize, BlendMode } from "@/const";
import { Point, Box, Size, size, box, point } from "@/geom";
import flatten from "@flatten-js/core";

type SegmentStyle = "start" | "end" | "center";

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

  public range(start: number, end: number, by = 1): number[] {
    let current = start;
    const res: number[] = [];
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
    return flatten.point(this.width / 2, this.height / 2);
  }

  clampVertical(y: number, padding = 0): number {
    return Math.max(padding, Math.min(y, this.height - padding));
  }

  clampHorizontal(x: number, padding = 0): number {
    return Math.max(padding, Math.min(x, this.width - padding));
  }

  clamp(p: Point | [number, number], padding = 0): Point {
    if (Array.isArray(p)) {
      return point(this.clampHorizontal(p[0], padding), this.clampHorizontal(p[1], padding));
    }

    return point(this.clampHorizontal(p.x, padding), this.clampVertical(p.y, padding));
  }

  inchesToPixels(inches: number) {
    return inches * 96;
  }

  fitRect(w: number | Size, h?: number): Size {
    let w2 = -1;
    let h2 = -1;

    if (typeof w === "object") {
      w2 = w.w;
      h2 = w.h;
    } else if (h !== undefined) {
      w2 = w;
      h2 = h;
    } else {
      return size(0, 0);
    }

    if (this.width > this.height) {
      if (h2 > w2) {
        return size(this.height * (w2 / h2), this.height);
      } else {
        return size(this.width, this.width * (h2 / w2));
      }
    } else {
      if (w2 < h2) {
        return size(this.height * (w2 / h2), this.height);
      } else {
        return size(this.width, this.width * (h2 / w2));
      }
    }
  }

  centerRect(w: number | Size, h?: number): Point {
    let w2 = -1;
    let h2 = -1;
    if (typeof w === "object") {
      w2 = w.w;
      h2 = w.h;
    } else if (h !== undefined) {
      w2 = w;
      h2 = h;
    }

    return flatten.point(this.width / 2 - w2 / 2, this.height / 2 - h2 / 2);
  }

  centerFitRect(w: number | Size, h?: number): Box {
    const wh = this.fitRect(w, h);
    const xy = this.centerRect(wh);

    return box(xy.x, xy.y, wh.w, wh.h);
  }

  segmentPoint(
    horizontal: number,
    vertical: number,
    style: SegmentStyle = "center",
    w = this.width,
    h = this.height
  ): Point[] {
    const hSegmentSize = w / horizontal;
    const vSegmentSize = h / vertical;

    const hAdjust = this.getSegmentAdjustment(style, hSegmentSize);
    const yAdjust = this.getSegmentAdjustment(style, vSegmentSize);

    const res: Point[] = [];

    for (let x = 0; x < horizontal; x++) {
      for (let y = 0; y < vertical; y++) {
        res.push(point(x * hSegmentSize + hAdjust, y * vSegmentSize + yAdjust));
      }
    }

    return res;
  }

  segmentBox(horizontal: number, vertical: number, w = this.width, h = this.height): Box[] {
    const hSegmentSize = w / horizontal;
    const vSegmentSize = h / vertical;

    const res: Box[] = [];

    for (let x = 0; x < horizontal; x++) {
      for (let y = 0; y < vertical; y++) {
        res.push(box(x * hSegmentSize, y * vSegmentSize, hSegmentSize, vSegmentSize));
      }
    }

    return res;
  }

  segmentAspectRatio(count: number, style: "box", w?: number, h?: number): Box[];
  segmentAspectRatio(count: number, style: SegmentStyle, w?: number, h?: number): Point[];
  segmentAspectRatio(count: number, style: SegmentStyle | "box" = "center", w = this.width, h = this.height) {
    let vertical = 0;
    let horizontal = 0;

    if (w > h) {
      horizontal = count;
      vertical = Math.floor(count * (h / w));
    } else {
      vertical = count;
      horizontal = Math.floor(count * (w / h));
    }

    return style === "box"
      ? this.segmentBox(horizontal, vertical, w, h)
      : this.segmentPoint(horizontal, vertical, style, w, h);
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

    const res = [];
    for (let i = 0; i < count; i++) {
      res.push(segmentSize * i + adjust);
    }

    return res;
  }

  private getSegmentAdjustment(style: string, segmentSize: number) {
    return style === "center" ? segmentSize / 2 : style === "end" ? segmentSize : 0;
  }
}
