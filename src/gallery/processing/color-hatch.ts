import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { CanvasContext, createCanvas } from "src/processing/CanvasContext";
import { DEFAULT_PREDEFINED_IMAGES } from "../defaults/ImageDefaults";
import { hatch45 } from "src/geom/hatch";
import { scale } from "src/geom/math";
import { translateLines, flipAlternate, segmentToPoints } from "@/geom/segment";
import { ALL_CURVE_CHOICES } from "../defaults/CurveDefaults";
import { MicronPigma } from "@/const";
import { Curve } from "@/geom/curve";
import { pointFromBox, sizeOf } from "@/geom";

const config = makeRenderConfig({
  image: {
    displayName: "Image",
    type: "image",
    predefined: [...DEFAULT_PREDEFINED_IMAGES],
    default: "/images/mr1.jpg",
  },
  curve: {
    displayName: "Curve",
    type: "choice",
    choices: ALL_CURVE_CHOICES,
    default: "linear",
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
    default: [0.25, 5.5],
  },
  high_threshold: {
    displayName: "Threshold",
    type: "number",
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.55,
  },
});

type SetupContext = {
  canvas: CanvasContext;
  source: string;
  detail: number;
  luminance: number[];
  hue: number[];
  saturation: number[];
};

const HueRanges = [
  {
    name: "red",
    ranges: [
      [0 / 360, 50 / 360],
      [280 / 360, 360 / 360],
    ],
    pen: MicronPigma.red,
  },
  { name: "green", ranges: [[50 / 360, 180 / 360]], pen: MicronPigma.green },
  { name: "blue", ranges: [[180 / 360, 280 / 360]], pen: MicronPigma.blue },
];

const Dots: D3Artwork<typeof config, SetupContext> = {
  type: "d3",
  config,
  path: "processing/color-hatch",
  description: "Generates a hatched output grid based off of input image median luminance, and dominant cell color",
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
        luminance: canvas.aggregateChunksAspectRatioFlat(config.detail, "median", "luminance"),
        hue: canvas.aggregateChunksAspectRatioFlat(config.detail, "avg", "hue"),
        saturation: canvas.aggregateChunksAspectRatioFlat(config.detail, "median", "saturation"),
        detail: config.detail,
        canvas,
      };
    };
  },
  render: (selection, ctx) => {
    var lineFunction = ctx.getLineRenderer(ctx.config.curve as Curve);
    const layers = HueRanges.map((r) => ({ ...r, layer: ctx.layer(selection, r.name) }));

    function pickLayerForHue(h: number): typeof layers[0] {
      return layers.find((layer) => layer.ranges.findIndex((r) => h >= r[0] && h <= r[1]) != -1);
    }

    const o = { pen: "black", layer: ctx.layer(selection, "other") };

    const boxFit = ctx.centerFitRect(ctx.setup.canvas.size);
    const boxOffset = pointFromBox(boxFit, "top-left");
    const boxSize = sizeOf(boxFit);

    const segments = ctx.segmentAspectRatio(ctx.config.detail, "box", Math.round(boxSize.w), Math.round(boxSize.h));
    if (segments.length != ctx.setup.luminance.length) {
      console.error("Out of sync");
      return;
    }

    const zip = segments.map((s, i) => ({
      rect: s,
      l: ctx.setup.luminance[i],
      s: ctx.setup.saturation[i],
      h: ctx.setup.hue[i],
    }));

    const { w, h } = sizeOf(segments[0]);

    const strength = [w / ctx.config.strength[0], w / ctx.config.strength[1]];

    for (let p of zip) {
      if (Number.isNaN(p.l) || p.l == undefined || p.l > ctx.config.high_threshold) {
        continue;
      }

      const hatchFactor = scale(p.l, 0, 1, strength[1], strength[0]);
      const hatchFactorFloored = Math.floor(hatchFactor);

      const hatch = segmentToPoints(
        flipAlternate(translateLines(hatch45(p.rect, hatchFactorFloored), boxOffset)).flat()
      );
      //const hatchR = flipAlternate(translateLines(hatch45(p.rect, hatchFactor, true), boxSize)).flat();

      const layer = p.s > 0.2 && p.l < 0.8 ? pickLayerForHue(p.h) : o;
      ctx.plotLine(layer.layer, "path", layer.pen).attr("d", lineFunction(hatch));
    }
  },
};

export default Dots;
