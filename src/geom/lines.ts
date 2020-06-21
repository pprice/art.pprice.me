import { Point, Rect, Line } from "./types";

export function translatePoints(points: Point[], offset: Point | Rect): Point[] {
  return points.map((p) => [offset[0] + p[0], offset[1] + p[1]]);
}

export function translateLines(lines: Line[], offset: Point | Rect): Line[] {
  return lines.map((line) => [
    [offset[0] + line[0][0], offset[1] + line[0][1]],
    [offset[0] + line[1][0], offset[1] + line[1][1]],
  ]);
}

export function flipLine(line: Line): Line {
  return [line[1], line[0]];
}

export function flipAlternate(lines: Line[]): Line[] {
  return lines.map((line, i) => (i % 2 === 0 ? flipLine(line) : line));
}
