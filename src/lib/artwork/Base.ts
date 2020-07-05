import { RenderConfiguration, RuntimeRenderConfiguration } from "@/lib/config";
import { BlendMode, PaperSizes } from "@/lib/const";

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

export type BaseArtwork<TConfig extends RenderConfiguration, TSetupResult extends SetupResult = SetupResult> = {
  initialProps?: Partial<InitialProps>;
  config: TConfig;
  presents?: { [key: string]: RuntimeRenderConfiguration<TConfig> }[];
  path?: string;
  description?: string;
  supportsRandom?: boolean;
  attribution?: string;
  setup?: SetupFunc<RuntimeRenderConfiguration<TConfig>, TSetupResult>;
};
