import { CanvasSize } from "@/const";
import sr from "seedrandom";

type Rounding = undefined | "floor" | "ceil" | "round";
type Point = [number, number];

export class RandomContext {
  private random: sr.prng;
  constructor(seed: string, private size: CanvasSize) {
    this.random = sr(seed);
  }

  next(rounding?: Rounding): number {
    return this.round(this.random(), rounding);
  }

  between(range: [number, number], rounding?: Rounding): number;
  between(min: number, max: number, rounding?: Rounding): number;

  between(minOrRange: number | [number, number], maxOrRounding: number | Rounding | undefined, rounding?: Rounding) {
    let min = 0;
    let max = 0;
    let _rounding: Rounding | undefined = rounding;
    if (Array.isArray(minOrRange)) {
      [min, max] = minOrRange;
      _rounding = typeof maxOrRounding === "string" ? maxOrRounding : undefined;
    } else if (typeof maxOrRounding === "number") {
      min = minOrRange;
      max = maxOrRounding;
    } else {
      throw new Error("Illegal arguments");
    }

    return this.round(min + this.next() * (max - min), _rounding);
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
