import { RandomContext } from "./RandomContext";
import { CanvasSize, BlendMode } from "@/const";

type SegmentStyle = "start" | "end" | "center";

export class RenderContext<TConfig> {
  public readonly random: RandomContext;

  constructor(
    public readonly pageCanvas: CanvasSize,
    public readonly canvas: CanvasSize,
    public readonly seed: string,
    public readonly blendMode: BlendMode,
    public readonly config: TConfig
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

  get center(): [number, number] {
    return [this.width / 2, this.height / 2];
  }

  clampVertical(y: number, padding: number = 0): number {
    return Math.max(padding, Math.min(y, this.height - padding));
  }

  clampHorizontal(x: number, padding: number = 0): number {
    return Math.max(padding, Math.min(x, this.width - padding));
  }

  clamp([x, y]: [number, number], padding: number = 0) {
    return [this.clampHorizontal(x, padding), this.clampVertical(y, padding)];
  }

  inchesToPixels(inches: number) {
    return inches * 96;
  }

  segment(horizontal: number, vertical: number, style: SegmentStyle = "center"): number[][] {
    const hSegmentSize = this.canvas.pixels[0] / horizontal;
    const vSegmentSize = this.canvas.pixels[1] / horizontal;

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

  segmentAspectRatio(count: number, style: SegmentStyle = "center"): number[][] {
    if (this.canvas.pixels[0] === this.canvas.pixels[1]) {
      return this.segment(count, count, style);
    } else if (this.canvas.pixels[0] > this.canvas.pixels[1]) {
      const horizontal = count;
      const vertical = Math.floor(count * (this.canvas.pixels[1] / this.canvas.pixels[0]));
      return this.segment(horizontal, vertical, style);
    } else {
      const vertical = count;
      const horizontal = Math.floor(count * (this.canvas.pixels[0] / this.canvas.pixels[1]));
      return this.segment(horizontal, vertical, style);
    }
  }

  segmentDimension(count: number, orientation: "horizontal" | "vertical", style: SegmentStyle = "center"): number[] {
    const dimensionLength = orientation === "horizontal" ? this.canvas.pixels[0] : this.canvas.pixels[1];
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
