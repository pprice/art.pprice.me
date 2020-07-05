import { RenderConfiguration, RuntimeRenderConfiguration } from "@/config";
import { D3RenderContext, D3Selection } from "@/renderers";
import { BaseType } from "d3";
import { BlendMode, PaperSizes } from "@/const";

type InitialProps = {
  seed: string;
  orientation: "landscape" | "portrait";
  blendMode: BlendMode;
  size: PaperSizes;
  margin: number | number[];
  containerStroke: string;
  containerStrokeWidth: number;
};

export type SetupResult = { [key: string]: unknown };

type SetupProducer<TSetupResult> = (statusCallback?: (message: string) => void) => Promise<TSetupResult>;

export type SetupFunc<
  TConfig extends RuntimeRenderConfiguration = RuntimeRenderConfiguration,
  TSetupResult extends SetupResult = SetupResult
> = (
  config: TConfig,
  prior: TSetupResult | undefined,
  context?: { baseUrl: string }
) => SetupProducer<TSetupResult> | undefined;

type BaseArtwork<TConfig extends RenderConfiguration, TSetupResult extends SetupResult = SetupResult> = {
  initialProps?: Partial<InitialProps>;
  config: TConfig;
  presents?: { [key: string]: RuntimeRenderConfiguration<TConfig> }[];
  path?: string;
  description?: string;
  supportsRandom?: boolean;
  attribution?: string;
  setup?: SetupFunc<RuntimeRenderConfiguration<TConfig>, TSetupResult>;
};

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
