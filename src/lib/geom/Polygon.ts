import { Polygon, Point } from "./types";
import flatten from "@flatten-js/core";

export function polygonFromStream(stream: ArrayLike<number>, origin: Point[]): Polygon[] {
  const result: Polygon[] = [];

  for (let i = 0; i < stream.length; i += 3) {
    const coords = [origin[stream[i]], origin[stream[i + 1]], origin[stream[i + 2]], origin[stream[i]]];

    result.push(new flatten.Polygon(coords));
  }

  return result;
}
