import { Point, Segment } from "./types";
import flatten from "@flatten-js/core";

export function translatePoints(points: Point[], offset: Point): Point[] {
  return points.map((p) => flatten.point(p.x + offset.x, p.y + offset.y));
}

export function translateLines(segments: Segment[], offset: Point): Segment[] {
  return segments.map((s) =>
    flatten.segment(
      flatten.point(s.start.x + offset.x, s.start.y + offset.y),
      flatten.point(s.end.x + offset.x, s.end.y + offset.y)
    )
  );
}

export function flipSegment(segment: Segment): Segment {
  return flatten.segment(segment.end, segment.start);
}

export function flipAlternate(segments: Segment[]): Segment[] {
  return segments.map((s, i) => (i % 2 === 0 ? flipSegment(s) : s));
}

export function segmentToPoints(segments: Segment[]): Point[] {
  return segments.map((s) => [s.start, s.end]).flat();
}
