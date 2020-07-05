import { BaseType } from "d3";

import { RenderConfiguration, RuntimeRenderConfiguration } from "@/lib/config";
import { D3RenderContext, D3Selection } from "@/lib/renderers";
import { BaseArtwork, SetupResult } from "./Base";

export type D3Artwork<
  TConfig extends RenderConfiguration,
  TSetupResult extends SetupResult = SetupResult,
  TBaseType extends BaseType = BaseType,
  TDatum = unknown
> = BaseArtwork<TConfig, TSetupResult> & {
  type: "d3";
  render: (
    selection: D3Selection<TBaseType, TDatum>,
    context: D3RenderContext<RuntimeRenderConfiguration<TConfig>, TSetupResult>
  ) => void;
};

export type Artwork<TConfig extends RenderConfiguration, TSetupResult extends SetupResult> = D3Artwork<
  TConfig,
  TSetupResult
>;
