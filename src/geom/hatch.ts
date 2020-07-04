import { Box, Segment } from "./types";
import flatten from "@flatten-js/core";

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
