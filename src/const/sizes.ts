export type CanvasSize = {
  inches: [number, number];
  millimeters: [number, number];
  pixels: [number, number];
  viewBox: string;
  widthToHeightRatio: number;
};

export type PaperSize = {
  landscape: CanvasSize;
  portrait: CanvasSize;
};

export function createPageSize(width: number, height: number): PaperSize {
  return {
    portrait: createCanvasSize(width, height),
    landscape: createCanvasSize(height, width),
  };
}

export function inchesToPixels(inches: number, dpi: number = 96) {
  return Math.floor(inches * dpi);
}

export function millimetersToPixels(millimeters: number, dpi: number = 96) {
  return inchesToPixels(millimeters / 25.4, dpi);
}

export function inchesToMillimeters(inches: number) {
  return inches * 25.4;
}

export function createCanvasSize(width: number, height: number): CanvasSize {
  const pixels = [inchesToPixels(width), inchesToPixels(height)];

  return {
    inches: [width, height],
    millimeters: [inchesToMillimeters(width), inchesToMillimeters(height)],
    viewBox: `0 0 ${pixels[0]} ${pixels[1]}`,
    pixels: [pixels[0], pixels[1]],
    widthToHeightRatio: width / height,
  };
}

export const Sizes = {
  A4: () => createPageSize(8.3, 11.7),
  A3: () => createPageSize(11.7, 16.5),
  Bristol9x12: () => createPageSize(9.0157, 12.0078),
  Bristol11x17: () => createPageSize(11, 17),
};

export type PaperSizes = keyof typeof Sizes;
