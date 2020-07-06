import delaunator from "delaunator";
import { Point, Polygon } from "./types";
import flatten from "@flatten-js/core";

type DelaunayAggregateResult<T, TAgg> = {
  polygon: Polygon;
  items: readonly [T, T, T];
  agg: TAgg;
};

export function delaunay<T extends Record<string, unknown>, TAgg extends Record<string, unknown>>(
  source: ArrayLike<T>,
  pointAccessor: (a: T) => Point,
  aggregator: (a: readonly [T, T, T]) => TAgg,
  closePolygon = true
): DelaunayAggregateResult<T, TAgg>[] {
  const delaunay = delaunator.from(
    source,
    (p) => pointAccessor(p).x,
    (p) => pointAccessor(p).y
  );

  const result: DelaunayAggregateResult<T, TAgg>[] = [];

  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    const items = [
      source[delaunay.triangles[i]],
      source[delaunay.triangles[i + 1]],
      source[delaunay.triangles[i + 2]],
    ] as const;

    const originPoints = items.map(pointAccessor);

    const polygon = new flatten.Polygon([...originPoints, ...(closePolygon ? [originPoints[0]] : [])]);

    result.push({
      polygon,
      items,
      agg: aggregator(items),
    });
  }

  return result;
}
