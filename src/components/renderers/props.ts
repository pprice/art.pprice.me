import { Sizes, PaperSize, BlendMode } from "@/lib/const";
import { RuntimeRenderConfiguration } from "@/lib/config";
import { SetupResult } from "@/lib/artwork";
import { D3RenderFrameProps } from "./D3RenderFrame";

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
