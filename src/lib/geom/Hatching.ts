import { Segment } from "./types";
import flatten from "@flatten-js/core";
import { maxDimensionLength, toRadians } from "./Util";

const MAX_ITER = 10000;
const MIN_INTERVAL = 1;

export function crossHatch(
  shape: flatten.Circle | flatten.Polygon | flatten.Box,
  interval: number,
  angle = 45,
  alternate = true
) {
  const firstPass = hatch(shape, interval, angle, alternate);
  const secondPass = hatch(shape, interval, Math.max(90 - angle, angle + 90), alternate);

  return [firstPass, secondPass.reverse()];
}

export function hatch(
  shape: flatten.Circle | flatten.Polygon | flatten.Box,
  interval: number,
  angle = 45,
  alternate = true
): Segment[] {
  if (interval == undefined || Number.isNaN(interval)) {
    throw new Error();
  }

  if (shape instanceof flatten.Box) {
    shape = new flatten.Polygon(shape.toSegments());
  } else if (shape instanceof flatten.Circle) {
    shape = new flatten.Polygon(shape);
  }

  // don't allow interval to be less than "1"
  interval = Math.max(interval, MIN_INTERVAL);

  // Generate a circle that contains the entire shape which is larger than the longest dimension
  const containingCircle = flatten.circle(shape.box.center, maxDimensionLength(shape.box) / (Math.PI / 2));

  const containingBounds = containingCircle.box;

  // Walk the bounding box horizontally and generate lines
  const segments: Segment[] = [];
  for (let x = containingBounds.xmin; x < containingBounds.xmax; x += interval) {
    segments.push(flatten.segment(flatten.point(x, containingBounds.ymin), flatten.point(x, containingBounds.ymax)));

    if (segments.length > MAX_ITER) {
      break;
    }
  }

  // Generate a test polygon for intersections
  const testShape = shape.clone();

  // Rotate segments around the center of the test shape
  const rotatedSegments = segments.map((s) => s.rotate(toRadians(angle), testShape.box.center));

  const intersectedPoints = rotatedSegments.map((l) => testShape.intersect(l));

  // Generate segments for point pairs from the intersection
  // NOTE: We may encounter empty segments to i or idx cannot be used
  const intersectedSegments = intersectedPoints
    .map((points) => {
      const result: Segment[] = [];

      for (let i = 0; i < points.length; i += 2) {
        const start = points[i];
        const end = points[i + 1];

        if (!start || !end) {
          break;
        }

        // There is a "bug" in flatten-js when an intersecting point passes through
        // a corner it gets flipped; to ensure we have "neat" hatching, ensure consistent
        // ordering of segment points
        if (start.lessThan(end)) {
          result.push(flatten.segment(end, start));
        } else {
          result.push(flatten.segment(start, end));
        }
      }

      return result;
    })
    .flat()
    .filter(Boolean);

  if (!alternate) {
    return intersectedSegments;
  }

  return intersectedSegments.map((s, idx) => (idx % 2 === 0 ? s.reverse() : s));
}
