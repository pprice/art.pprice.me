import { makeRenderConfig } from "@/lib/config";
import { DEFAULT_PREDEFINED_IMAGES, ALL_CURVE_CHOICES } from "../defaults";
import { CanvasContext, createCanvas } from "@/lib/processing";
import { D3Artwork } from "@/lib/artwork";
import { Curve, pointFromBox, sizeOf, segmentToPoints, scale, translateLines, hatch } from "@/lib/geom";

const config = makeRenderConfig({
  image: {
    displayName: "Image",
    type: "image",
    predefined: [...DEFAULT_PREDEFINED_IMAGES],
    default: "/images/mr2.jpg",
  },
  curve: {
    displayName: "Curve",
    type: "choice",
    choices: ALL_CURVE_CHOICES,
    default: "bundle",
  },
  detail: {
    displayName: "Detail",
    type: "number",
    min: 20,
    max: 100,
    step: 2,
    default: 60,
  },
  strength: {
    displayName: "Strength",
    type: "number-range",
    min: 0.05,
    max: 20,
    step: 0.05,
    default: [0.25, 6],
  },
  high_threshold: {
    displayName: "Threshold",
    type: "number",
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.95,
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
  path: "processing/mono-hatch",
  description: "Generates a hatched output grid based off of input image median luminance",
  initialProps: {
    orientation: "portrait",
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
        chunks: canvas.aggregateChunksAspectRatioFlat(config.detail, "avg", "luminance"),
        detail: config.detail,
        canvas,
      };
    };
  },
  render: (selection, ctx) => {
    const lineFunction = ctx.getPointLineRenderer(ctx.config.curve as Curve);

    const boxFit = ctx.centerFitRect(ctx.setup.canvas.size);
    const boxOffset = pointFromBox(boxFit, "top-left");
    const boxSize = sizeOf(boxFit);

    const d1 = ctx.layer(selection, "d1");
    const segments = ctx.segmentAspectRatio(ctx.config.detail, "box", Math.round(boxSize.w), Math.round(boxSize.h));
    const zip = segments.shapes.map((s, i) => ({ rect: s, value: ctx.setup.chunks[i] }));

    if (segments.shapes.length != ctx.setup.chunks.length) {
      console.error(`Out of sync ${segments.shapes.length} segments vs ${ctx.setup.chunks.length} chunks`);
      return;
    }

    const { w } = sizeOf(segments.shapes[0]);

    const strength = [w / ctx.config.strength[0], w / ctx.config.strength[1]];

    for (const p of zip) {
      if (p.value == undefined || p.value > ctx.config.high_threshold) {
        continue;
      }

      const hatchFactor = Math.floor(scale(p.value, 0, 1, strength[1], strength[0]));
      const hatchPoints = segmentToPoints(translateLines(hatch(p.rect, hatchFactor), boxOffset));

      ctx.plotLine(d1, "path").attr("d", lineFunction(hatchPoints));
    }
  },
};

export default Dots;
