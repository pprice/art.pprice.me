import { Size, Box } from "./types";
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
