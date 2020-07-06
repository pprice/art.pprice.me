import { SegmentResult } from "./Segments";
import flatten from "@flatten-js/core";

export type Element2D<T> = { item: T; x: number; y: number; idx: number; edge: boolean; corner: boolean };

type SegmentPosition<T extends flatten.Shape> = Element2D<T>;
type SegmentIterator<T extends flatten.Shape> = Iterable<SegmentPosition<T>>;

export function* enumerate2d<T>(items: T[], w: number): Iterable<Element2D<T>> {
  for (let y = 0; y < items.length; y += w) {
    for (let x = 0; x < w; x++) {
      const idx = x + y;

      yield {
        item: items[idx],
        edge: x === 0 || x === w - 1 || y === 0 || y >= items.length - w,
        corner: (x === 0 || x === w - 1) && (y === 0 || y >= items.length - w),
        x,
        y,
        idx,
      };
    }
  }
}

export function flatTo2d<T>(items: T[], w: number): T[][] {
  const result: T[][] = [];
  let current: T[] | undefined = undefined;

  for (let y = 0; y < items.length; y += w) {
    if (current) {
      result.push(current);
    }
    current = [];
    for (let x = 0; x < w; x++) {
      current.push(items[x + y]);
    }
  }
  return result;
}

export function* enumerateSegments<T extends flatten.Shape>(s: SegmentResult<T>): SegmentIterator<T> {
  return enumerate2d(s.shapes, s.horizontalCount);
}
