import { makeRenderConfig } from "@/lib/config";
import { CanvasContext, createCanvas } from "@/lib/processing";
import { D3Artwork } from "@/lib/artwork";
import { sizeOf, pointFromBox } from "@/lib/geom";
import { DEFAULT_PREDEFINED_IMAGES } from "../defaults";

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
  canvas: CanvasContext;
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
    containerStrokeWidth: 0,
  },
  setup: (config, prior, ctx) => {
    if (prior && config.image === prior.source && config.detail === prior.detail) {
      return undefined;
    }

    prior?.canvas?.destroy();

    return async () => {
      const canvas = await createCanvas(config.image, ctx);
      return {
        source: config.image,
        chunks: canvas.aggregateChunksAspectRatioFlat(config.detail, "median", "luminance"),
        detail: config.detail,
        canvas,
      };
    };
  },
  render: (selection, ctx) => {
    const boxFit = ctx.centerFitRect(ctx.setup.canvas.size);
    const boxSize = sizeOf(boxFit);
    const boxOffset = pointFromBox(boxFit, "top-left");

    const d1 = ctx.layer(selection, "d1");
    const segments = ctx.segmentAspectRatio(ctx.config.detail, "center", Math.round(boxSize.w), Math.round(boxSize.h));
    const zip = segments.shapes.map((s, i) => ({ xy: s, lum: ctx.setup.chunks[i] }));

    ctx.applyPlotLineAttr(
      d1
        .selectAll("circle")
        .data(zip)
        .enter()
        .filter((g) => g.lum < ctx.config.low_threshold)
        .append("circle")
        .attr("cx", (v) => boxOffset.x + v.xy.x)
        .attr("cy", (v) => boxOffset.y + v.xy.y)
        .attr("r", (v) => (1 - v.lum) * ctx.config.radius)
    );
  },
};

export default Dots;
