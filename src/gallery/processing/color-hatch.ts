import { makeRenderConfig } from "@/lib/config";
import { CanvasContext, createCanvas, HUE_RANGE_RGB, channelFromHue } from "@/lib/processing";
import { MicronPigma } from "@/lib/const";
import { D3Artwork } from "@/lib/artwork";
import { Curve, pointFromBox, sizeOf, scale, segmentToPoints, translateLines, hatch } from "@/lib/geom";
import { ALL_CURVE_CHOICES, DEFAULT_PREDEFINED_IMAGES } from "../defaults";

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
    const lineFunction = ctx.getPointLineRenderer(ctx.config.curve as Curve);
    const layers = [
      {
        pen: MicronPigma.red,
        layer: ctx.layer(selection, "red"),
      },
      {
        pen: MicronPigma.green,
        layer: ctx.layer(selection, "green"),
      },
      {
        pen: MicronPigma.blue,
        layer: ctx.layer(selection, "blue"),
      },
    ];

    function pickLayerForHue(h: number): typeof layers[0] {
      const channel = channelFromHue(h, HUE_RANGE_RGB);

      switch (channel) {
        case "red":
          return layers[0];
        case "green":
          return layers[1];
        case "blue":
          return layers[2];
      }
    }

    const o = { pen: "black", layer: ctx.layer(selection, "other") };

    const boxFit = ctx.centerFitRect(ctx.setup.canvas.size);
    const boxOffset = pointFromBox(boxFit, "top-left");
    const boxSize = sizeOf(boxFit);

    const segments = ctx.segmentAspectRatio(ctx.config.detail, "box", Math.round(boxSize.w), Math.round(boxSize.h));
    if (segments.shapes.length != ctx.setup.luminance.length) {
      console.error("Out of sync");
      return;
    }

    const zip = segments.shapes.map((s, i) => ({
      rect: s,
      l: ctx.setup.luminance[i],
      s: ctx.setup.saturation[i],
      h: ctx.setup.hue[i],
    }));

    const { w } = sizeOf(segments.shapes[0]);

    const strength = [w / ctx.config.strength[0], w / ctx.config.strength[1]];

    for (const p of zip) {
      if (Number.isNaN(p.l) || p.l == undefined || p.l > ctx.config.high_threshold) {
        continue;
      }

      const hatchFactor = scale(p.l, 0, 1, strength[1], strength[0]);
      const hatchFactorFloored = Math.floor(hatchFactor);

      const hatchPoints = segmentToPoints(translateLines(hatch(p.rect, hatchFactorFloored), boxOffset));

      const layer = p.s > 0.2 && p.l < 0.8 ? pickLayerForHue(p.h) : o;
      ctx.plotLine(layer.layer, "path", layer.pen).attr("d", lineFunction(hatchPoints));
    }
  },
};

export default Dots;
