import { PaperSize, Sizes } from "../const/sizes";
import { D3RenderFrameProps } from "./d3/D3RenderFrame";
import { BlendMode } from "@/const";
import { SetupResult } from "@/gallery/types/d3";
import { RuntimeRenderConfiguration } from "@/config";

export type RenderRef = {
  serialize: () => Blob;
};

export type BaseRenderFrameProps = {
  size: keyof typeof Sizes;
  orientation: keyof PaperSize;
  blendMode?: BlendMode;
  containerStroke?: string;
  containerStrokeWidth?: number;
  margin?: number | number[]; // LTRB
  config?: RuntimeRenderConfiguration;
  setupResult?: SetupResult;
  seed: string;
  attribution?: string;
  ref?: React.MutableRefObject<RenderRef>;
  paused?: boolean;
};

export type RenderFrameProps<TDatum = unknown> = D3RenderFrameProps<TDatum>;
