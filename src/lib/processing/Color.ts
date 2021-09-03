export type RGBA = ArrayLike<number>;
export type RGB = ArrayLike<number>;
export type HSL = readonly [number, number, number];
export type LAB = readonly [number, number, number];

export function rgb2Luminance(c: RGB | RGBA): number {
  const r = luminanceX(c[0]);
  const g = luminanceX(c[1]);
  const b = luminanceX(c[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function luminanceX(x: number): number {
  x /= 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function rgb2hsl(c: RGB | RGBA): HSL {
  const r = c[0] / 255;
  const g = c[1] / 255;
  const b = c[2] / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const hsl = [(max + min) / 2, (max + min) / 2, (max + min) / 2];

  if (max == min) {
    hsl[0] = hsl[1] = 0; // achromatic
  } else {
    const d = max - min;
    hsl[1] = hsl[2] > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hsl[0] = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hsl[0] = (b - r) / d + 2;
        break;
      case b:
        hsl[0] = (r - g) / d + 4;
        break;
    }
    hsl[0] /= 6;
  }

  return hsl as unknown as HSL;
}

export function hslToRgb([h, s, l]: HSL): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function rgb2lab(rgb: RGB): LAB {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

export function hsl2Lab(hsl: HSL): LAB {
  return rgb2lab(hslToRgb(hsl));
}

type HueToChannel<TKey extends string> = { channel: TKey; ranges: readonly [number, number][] };

export const HUE_RANGE_RGB: HueToChannel<"red" | "green" | "blue">[] = [
  {
    channel: "red" as const,
    ranges: [
      [0 / 360, 50 / 360],
      [280 / 360, 360 / 360],
    ],
  },
  { channel: "green" as const, ranges: [[50 / 360, 180 / 360]] },
  { channel: "blue" as const, ranges: [[180 / 360, 280 / 360]] },
];

export function channelFromHue<TKey extends string>(value: number, ranges: HueToChannel<TKey>[]): TKey | undefined {
  const match = ranges.find((r) => r.ranges.some((i) => value >= i[0] && value <= i[1]));

  if (match) {
    return match.channel;
  }

  return undefined;
}
