import { CanvasSize } from "./sizes";
import sr from "seedrandom";

type Rounding = undefined | "floor" | "ceil" | "round";
type Point = [number, number];
export type Selection<TDatum = any> = d3.Selection<d3.BaseType, unknown, HTMLElement, TDatum>;

export class RandomDrawContext {
  private random: sr.prng;
  constructor(seed: string, private size: CanvasSize) {
    this.random = sr(seed);
  }

  next(rounding?: Rounding): number {
    return this.round(this.random(), rounding);
  }

  between(min: number, max: number, rounding?: Rounding): number {
    return this.round(min + this.next() * (max - min), rounding);
  }

  upto(max: number, rounding?: Rounding) {
    return this.between(0, max, rounding);
  }

  pointBetween(min: Point, max: Point, rounding?: Rounding): Point {
    const x = this.between(min[0], max[0], rounding);
    const y = this.between(min[1], max[1], rounding);

    return [x, y];
  }

  pointUpto(maxWidth: number, maxHeight: number, rounding?: Rounding): Point {
    const x = this.upto(maxWidth, rounding);
    const y = this.upto(maxHeight, rounding);

    return [x, y];
  }

  private round(number: number, rounding: Rounding): number {
    if (!number || !rounding) {
      return number;
    } else if (rounding === "floor") {
      return Math.floor(number);
    } else if (rounding === "ceil") {
      return Math.ceil(number);
    }

    return Math.round(number);
  }
}

type SegmentStyle = "start" | "end" | "center";
type RangeType = "inclusive" | "exclusive";

export class RenderContext {
  public readonly random: RandomDrawContext;
  private layerId: number = 0;

  constructor(
    public readonly pageCanvas: CanvasSize,
    public readonly canvas: CanvasSize,
    public readonly seed: string
  ) {
    this.random = new RandomDrawContext(seed, canvas);
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

  inchesToPixels(inches: number) {
    return inches * 96;
  }

  appendLayer(target: Selection, name: string, id: string = name): Selection {
    const idx = this.layerId++;

    return target
      .append("g")
      .attr("id", id)
      .attr("inkscape-groupmode", "layer")
      .attr("inkscape-label", `${idx}-${name}`);
  }

  recreateLayer(target: Selection, name: string, id: string = name): Selection {
    target.select(`#${id}`).remove();
    return this.appendLayer(target, name, id);
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
