import { RenderConfiguration, RuntimeRenderConfiguration } from "@/config";
import { D3RenderContext, D3Selection } from "@/renderers";
import { BaseType } from "d3";
import { BlendMode, PaperSizes } from "@/const";

type InitialProps = {
  seed: string;
  orientation: "landscape" | "portrait";
  blendMode: BlendMode;
  size: PaperSizes;
  margin: number;
};

type BaseArtwork<TConfig extends RenderConfiguration> = {
  initialProps?: Partial<InitialProps>;
  config: TConfig;
  attribution?: string;
};

export type D3Artwork<
  TConfig extends RenderConfiguration,
  TBaseType extends BaseType = BaseType,
  TDatum = any
> = BaseArtwork<TConfig> & {
  type: "d3";
  render: (
    selection: D3Selection<TBaseType, TDatum>,
    context: D3RenderContext<RuntimeRenderConfiguration<TConfig>>
  ) => Promise<void> | void;
};

export type Artwork<TConfig extends RenderConfiguration> = D3Artwork<TConfig>;
