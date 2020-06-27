import { Rect, Point, Line } from "./types";

export function crossHatch45(r: Rect, interval: number) {
  return [...hatch45(r, interval), ...hatch45(r, interval, true)];
}

export function hatch45([x, y, w, h]: Rect, interval: number, reverse: boolean = false): Line[] {
  let sx = x;
  let sy = y;
  w += x;
  h += y;

  if (Number.isNaN(interval) || !Number.isFinite(interval)) {
    throw new Error(`Invalid interval ${interval} specified`);
  }

  const result: Line[] = [];

  // Create diagonal lines within rect
  if (!reverse) {
    let ex = sx; // end x position along start
    sx = sx + interval; // offset by one interval
    let ey = sy + interval; // same for end y

    while (true) {
      result.push([
        [sx, sy],
        [ex, ey],
      ]);

      sx += interval; // start x walks across
      if (sx > w) {
        // when it hits the edge...
        sy += sx - w; // ...move down by the remainder*
        sx = w; // ...and stop x
      }

      // * right triangle math!
      //   if we just add the interval to sy, we'd get
      //   weird gaps, but because we're at 45º, we can
      //   just move down by sx-w (whatever would hang
      //   over the right edge) and our spacing stays
      //   the same

      ey += interval; // same for end y
      if (ey > h) {
        ex += ey - h;
        ey = h;
      }

      if (ex >= sx) {
        break;
      }
    }
  }

  // reversed lines
  else {
    let startX = sx;
    sx = w - interval;

    let ex = w;
    let ey = sy + interval;

    while (true) {
      result.push([
        [sx, sy],
        [ex, ey],
      ]);

      sx -= interval;
      if (sx < startX) {
        sy += startX - sx;
        sx = startX;
      }

      ey += interval;
      if (ey > h) {
        ex -= ey - h;
        ey = h;
      }

      if (ex <= sx) break;
    }
  }

  return result;
}
