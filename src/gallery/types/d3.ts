import { RenderConfiguration, RuntimeRenderConfiguration } from "@/config";
import { D3RenderContext, D3Selection } from "@/renderers";

export type D3Artwork<TConfig extends RenderConfiguration, TDatum = any> = {
  type: "d3";
  config: TConfig;
  attribution?: string;
  render: (selection: D3Selection<TDatum>, context: D3RenderContext<RuntimeRenderConfiguration<TConfig>>) => void;
};

export type Artwork<TConfig extends RenderConfiguration> = D3Artwork<TConfig>;
