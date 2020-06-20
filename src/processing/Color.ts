export type RGBA = [number, number, number, number];
export type RGB = [number, number, number];
export type HSL = [number, number, number];

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
    var d = max - min;
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

  return hsl as HSL;
}
