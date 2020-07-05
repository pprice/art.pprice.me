import { Size, Box, Circle, Polygon } from "./types";
import flatten from "@flatten-js/core";

export function size(w: number, h: number): Size {
  return { w, h };
}

export function box(x: number, y: number, w: number, h: number) {
  return new flatten.Box(x, y, x + w, y + h);
}

export function point(x: number, y: number) {
  return flatten.point(x, y);
}

export function pointFromBox(box: Box, location: "top-left" | "bottom-right") {
  switch (location) {
    case "top-left":
      return flatten.point(box.xmin, box.ymin);
    case "bottom-right":
      return flatten.point(box.xmax, box.ymax);
  }
}

export function sizeOf(shape: flatten.Shape): Size {
  if (shape instanceof flatten.Box) {
    return { w: shape.xmax - shape.xmin, h: shape.ymax - shape.ymin };
  } else if (shape instanceof flatten.Polygon) {
    return sizeOf(shape.box);
  } else if (shape instanceof flatten.Circle) {
    return sizeOf(shape.box);
  }

  throw new Error("Not supported");
}

export function identityMatrix() {
  return flatten.matrix(1, 0, 0, 1, 0, 0);
}

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
