import { Box, Segment } from "./types";
import flatten from "@flatten-js/core";
import { maxDimensionLength, toRadians } from "./math";
import { sizeOf, identityMatrix } from "./factory";
import { buffer } from "d3";

export function crossHatch(
  shape: flatten.Circle | flatten.Polygon | flatten.Box,
  interval: number,
  angle: number = 45,
  alternate: boolean = true
) {
  const firstPass = hatch(shape, interval, angle, alternate);
  const secondPass = hatch(shape, interval, Math.max(90 - angle, angle + 90), alternate);

  return [firstPass, secondPass.reverse()];
}

export function hatch(
  shape: flatten.Circle | flatten.Polygon | flatten.Box,
  interval: number,
  angle: number = 45,
  alternate: boolean = true
): Segment[] {
  if (interval == undefined || Number.isNaN(interval)) {
    throw new Error();
  }

  if (shape instanceof flatten.Box) {
    shape = new flatten.Polygon(shape.toSegments());
  } else if (shape instanceof flatten.Circle) {
    shape = new flatten.Polygon(shape);
  }

  // Generate a circle that contains the entire shape which is larger than the longest dimension
  const containingCircle = flatten.circle(shape.box.center, maxDimensionLength(shape.box) / (Math.PI / 2));

  const containingBounds = containingCircle.box;

  // Walk the bounding box horizontally and generate lines
  const segments: Segment[] = [];
  for (let x = containingBounds.xmin; x < containingBounds.xmax; x += interval) {
    segments.push(flatten.segment(flatten.point(x, containingBounds.ymin), flatten.point(x, containingBounds.ymax)));
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

const MAX_ITER = 10000;

export function crossHatch45(r: Box, interval: number) {
  return [...hatch45(r, interval), ...hatch45(r, interval, true)];
}

export function hatch45(
  { xmin = Number.NaN, ymin = Number.NaN, xmax = Number.NaN, ymax = Number.NaN }: Box,
  interval: number,
  reverse: boolean = false
): Segment[] {
  let sx = xmin;
  let sy = ymin;

  if (Number.isNaN(interval) || !Number.isFinite(interval)) {
    throw new Error(`Invalid interval ${interval} specified`);
  } else if (Number.isNaN(xmin) || Number.isNaN(xmax) || Number.isNaN(ymin) || Number.isNaN(ymax)) {
    throw new Error(`Invalid bounding box dimensions, ${xmin},${xmax},${ymin},${ymax}`);
  }

  const result: Segment[] = [];

  // Create diagonal lines within rect
  if (!reverse) {
    let ex = sx; // end x position along start
    sx = sx + interval; // offset by one interval
    let ey = sy + interval; // same for end y

    while (true && result.length < MAX_ITER) {
      result.push(flatten.segment([sx, sy, ex, ey]));

      sx += interval; // start x walks across
      if (sx > xmax) {
        // when it hits the edge...
        sy += sx - xmax; // ...move down by the remainder*
        sx = xmax; // ...and stop x
      }

      // * right triangle math!
      //   if we just add the interval to sy, we'd get
      //   weird gaps, but because we're at 45º, we can
      //   just move down by sx-w (whatever would hang
      //   over the right edge) and our spacing stays
      //   the same

      ey += interval; // same for end y
      if (ey > ymax) {
        ex += ey - ymax;
        ey = ymax;
      }

      if (ex >= sx) {
        break;
      }
    }
  }

  // reversed lines
  else {
    let startX = sx;
    sx = xmax - interval;

    let ex = xmax;
    let ey = sy + interval;

    while (true && result.length < MAX_ITER) {
      result.push(flatten.segment([sx, sy, ex, ey]));

      sx -= interval;
      if (sx < startX) {
        sy += startX - sx;
        sx = startX;
      }

      ey += interval;
      if (ey > ymax) {
        ex -= ey - ymax;
        ey = ymax;
      }

      if (ex <= sx) break;
    }
  }

  return result;
}
