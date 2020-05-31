import { PaperSize, Sizes } from "../const/sizes";
import { D3RenderFrameProps } from "./d3/D3RenderFrame";

export type RenderRef = {
  serialize: () => Blob;
};

export type BaseRenderFrameProps = {
  size: keyof typeof Sizes;
  orientation: keyof PaperSize;
  containerStroke?: string;
  containerStrokeWidth?: number;
  margin?: number | number[]; // LTRB
  config?: any;
  seed: string;
  attribution?: string;
  ref?: React.MutableRefObject<RenderRef>;
};

export type RenderFrameProps<TDatum = any> = D3RenderFrameProps<TDatum>;
