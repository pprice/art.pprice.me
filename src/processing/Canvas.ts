import { thresholdScott } from "d3";

/**
 * Abstract canvas implementation; to support server side rendering
 */
export type ImageDataCanvas = {
  readonly width: number;
  readonly height: number;
  getImageData(): Uint8ClampedArray | undefined;
  destroy(): void;
};

export class OffscreenImageDataCanvas implements ImageDataCanvas {
  canvas: OffscreenCanvas | undefined;
  context: OffscreenCanvasRenderingContext2D | undefined;

  public readonly width: number;
  public readonly height: number;

  static supported() {
    return process.browser && typeof OffscreenCanvas !== "undefined";
  }

  constructor(image: HTMLImageElement) {
    this.width = image.width;
    this.height = image.height;
    this.canvas = new OffscreenCanvas(image.width, image.height);
    this.context = this.canvas.getContext("2d");
    this.context.drawImage(image, 0, 0);
  }

  getImageData(): Uint8ClampedArray | undefined {
    return this.context?.getImageData(0, 0, this.width, this.height).data;
  }

  destroy(): void {
    this.canvas = undefined;
    this.context = undefined;
  }
}

export class DomImageDataCanvas implements ImageDataCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  public readonly width: number;
  public readonly height: number;

  static supported() {
    return process.browser;
  }

  constructor(image: HTMLImageElement) {
    this.width = image.width;
    this.height = image.height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.context = this.canvas.getContext("2d");
    this.context.drawImage(image, 0, 0);
  }

  getImageData(): Uint8ClampedArray | undefined {
    return this.context?.getImageData(0, 0, this.width, this.height).data;
  }

  destroy(): void {
    if (this.canvas) {
      document.removeChild(this.canvas);
    }

    this.canvas = undefined;
    this.context = undefined;
  }
}
