import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { OffscreenCanvasContext, createOffscreenCanvas } from "src/processing/OffscreenCanvasContext";
import { DEFAULT_PREDEFINED_IMAGES } from "../defaults/ImageDefaults";

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
    default: 2.5,
  },
  low_threshold: {
    type: "number",
    min: 0.5,
    max: 1,
    step: 0.005,
    default: 0.8,
  },
  detail: {
    type: "number",
    min: 50,
    max: 200,
    step: 5,
    default: 120,
  },
});

type SetupContext = {
  canvas: OffscreenCanvasContext;
  source: string;
  detail: number;
  chunks: number[];
};

const Dots: D3Artwork<typeof config, SetupContext> = {
  type: "d3",
  config,
  path: "processing/dots",
  description: "Generates an output grid based off of input image median luminance",
  initialProps: {
    orientation: "portrait",
    containerStrokeWidth: 0,
  },
  setup: (config, prior) => {
    if (prior && config.image === prior.source && config.detail === prior.detail) {
      return undefined;
    }

    return async () => {
      const canvas = await createOffscreenCanvas(config.image);
      return {
        source: config.image,
        chunks: canvas.aggregateChunksAspectRatioFlat(config.detail, "median", "luminance"),
        detail: config.detail,
        canvas,
      };
    };
  },
  render: (selection, ctx) => {
    const boxSize = ctx.centerFitRect(ctx.setup.canvas.size);
    const d1 = ctx.layer(selection, "d1");
    const segments = ctx.segmentAspectRatio(ctx.config.detail, "center", boxSize[2], boxSize[3]);
    const zip = segments.map((s, i) => ({ xy: s, lum: ctx.setup.chunks[i] }));

    ctx.applyPlotLineAttr(
      d1
        .selectAll("circle")
        .data(zip)
        .enter()
        .filter((g) => g.lum < ctx.config.low_threshold)
        .append("circle")
        .attr("cx", (v) => boxSize[0] + v.xy[0])
        .attr("cy", (v) => boxSize[1] + v.xy[1])
        .attr("r", (v) => (1 - v.lum) * ctx.config.radius)
    );
  },
};

export default Dots;
