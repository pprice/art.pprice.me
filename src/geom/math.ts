import { Box, Polygon, Circle } from "./types";
import { sizeOf } from "./factory";

export function toRadians(degrees: number) {
  return (Math.PI / 180) * degrees;
}

export function scale(value: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
  return minOut + (maxOut - maxIn) * ((value - minIn) / (minOut - minIn));
}

export function maxDimensionLength(box: Box | Circle | Polygon): number {
  const size = sizeOf(box);
  return Math.max(size.w, size.h);
}
