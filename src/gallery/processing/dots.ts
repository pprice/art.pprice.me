import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { OffscreenCanvasContext, createOffscreenCanvas } from "src/processing/OffscreenCanvasContext";
import { DEFAULT_PREDEFINED_IMAGES } from "../ImageDefaults";

const config = makeRenderConfig({
  image: {
    type: "image",
    predefined: [...DEFAULT_PREDEFINED_IMAGES],
  },
  radius: {
    type: "number",
    min: 1,
    max: 5,
    step: 0.2,
    default: 3,
  },
  low_threshold: {
    type: "number",
    min: 0,
    max: 0.9,
    step: 0.05,
    default: 0.5,
  },
  detail: {
    type: "number",
    min: 50,
    max: 200,
    step: 5,
    default: 150,
  },
});

type SetupContext = {
  canvas: OffscreenCanvasContext;
  source: string;
};

const Processing: D3Artwork<typeof config, SetupContext> = {
  type: "d3",
  config,
  description: "Generates an output grid based off of input image median luminance",
  initialProps: {
    orientation: "portrait",
    containerStrokeWidth: 0,
  },
  setup: (config, prior) => {
    if (prior && config.image === prior.source) {
      return undefined;
    }

    return async () => ({
      source: config.image,
      canvas: await createOffscreenCanvas(config.image),
    });
  },
  render: (selection, ctx) => {
    const boxSize = ctx.centerFitRect(ctx.setup.canvas.size);

    const lumChunks = ctx.setup.canvas.aggregateChunksAspectRatioFlat(ctx.config.detail, "median", "luminance");

    const d1 = ctx.layer(selection, "d1");

    const segments = ctx.segmentAspectRatio(ctx.config.detail, "center", boxSize[2], boxSize[3]);

    for (let i = 0; i < segments.length; i++) {
      const self = segments[i];

      const r = (1 - lumChunks[i]) * ctx.config.radius;

      if (r < ctx.config.low_threshold) {
        continue;
      }

      ctx
        .plotLine(d1, "circle")
        .attr("cx", boxSize[0] + self[0])
        .attr("cy", boxSize[1] + self[1])
        .attr("r", r);
    }
  },
};

export default Processing;
