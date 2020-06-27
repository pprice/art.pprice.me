import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { CanvasContext, createCanvas } from "src/processing/CanvasContext";
import { DEFAULT_PREDEFINED_IMAGES } from "../defaults/ImageDefaults";
import { hatch45 } from "src/geom/hatch";
import { scale } from "src/geom/math";
import * as d3 from "d3";
import { translateLines, flipAlternate } from "@/geom/lines";
import { ALL_CURVE_CHOICES, getCurveFactory } from "../defaults/CurveDefaults";

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
  setup: (config, prior) => {
    if (prior && config.image === prior.source && config.detail === prior.detail) {
      return undefined;
    }

    return async () => {
      const canvas = await createCanvas(config.image);
      return {
        source: config.image,
        chunks: canvas.aggregateChunksAspectRatioFlat(config.detail, "avg", "luminance"),
        detail: config.detail,
        canvas,
      };
    };
  },
  render: (selection, ctx) => {
    var lineFunction = d3.line<number[]>().curve(getCurveFactory(ctx.config.curve));

    const boxSize = ctx.centerFitRect(ctx.setup.canvas.size);
    const d1 = ctx.layer(selection, "d1");
    const segments = ctx.segmentAspectRatio(ctx.config.detail, "box", boxSize[2], boxSize[3]);
    const zip = segments.map((s, i) => ({ rect: s, value: ctx.setup.chunks[i] }));

    const [, , w, h] = segments[0];

    const strength = [w / ctx.config.strength[0], w / ctx.config.strength[1]];

    for (let p of zip) {
      if (p.value > ctx.config.high_threshold) {
        continue;
      }

      const hatchFactor = Math.floor(scale(p.value, 0, 1, strength[1], strength[0]));

      const hatch = flipAlternate(translateLines(hatch45(p.rect, hatchFactor), boxSize)).flat();
      //const hatchR = flipAlternate(translateLines(hatch45(p.rect, hatchFactor, true), boxSize)).flat();

      ctx.plotLine(d1, "path").attr("d", lineFunction(hatch));
    }
  },
};

export default Dots;
