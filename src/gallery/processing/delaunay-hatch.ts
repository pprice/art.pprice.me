import { makeRenderConfig } from "@/lib/config";
import { DEFAULT_PREDEFINED_IMAGES, ALL_CURVE_CHOICES } from "../defaults";
import { CanvasContext, createCanvas, HUE_RANGE_RGB, channelFromHue, ciede2000, HSL } from "@/lib/processing";
import { D3Artwork } from "@/lib/artwork";
import {
  Curve,
  pointFromBox,
  sizeOf,
  segmentToPoints,
  translateLines,
  hatch,
  enumerate2d,
  Element2D,
} from "@/lib/geom";
import { delaunay } from "@/lib/geom/Delaunay";
import { MicronPigma } from "@/lib/const";
import { averageOf, medianOf } from "@/lib/utils/array";

const config = makeRenderConfig({
  image: {
    displayName: "Image",
    type: "image",
    predefined: [...DEFAULT_PREDEFINED_IMAGES],
    default: "/images/nz_mt.jpg",
  },
  curve: {
    displayName: "Curve",
    type: "choice",
    choices: ALL_CURVE_CHOICES,
    default: "cardinalClosed",
  },
  detail: {
    displayName: "Detail",
    type: "number",
    min: 20,
    max: 100,
    step: 2,
    default: 70,
  },
  diff_threshold: {
    displayName: "Merge Threshold",
    type: "number",
    min: 0.1,
    max: 10,
    step: 0.05,
    default: 1.3,
  },
  max_merge: {
    displayName: "Max Merge",
    type: "number",
    min: 1,
    max: 100,
    step: 1,
    default: 18,
  },
  high_threshold: {
    displayName: "L Threshold",
    type: "number",
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.85,
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

const DelaunayHatch: D3Artwork<typeof config, SetupContext> = {
  type: "d3",
  config,
  supportsRandom: true,
  path: "processing/delaunay-hatch",
  description: "Generates a merged set delaunay polygons by merging visually similar grid segments",
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
      {
        pen: "black",
        layer: ctx.layer(selection, "black"),
      },
    ];

    function pickLayerForHsl(hsl: HSL): typeof layers[0] {
      if (hsl[1] < 0.15 || hsl[2] > 0.9) {
        return layers[3];
      }

      const channel = channelFromHue(hsl[0], HUE_RANGE_RGB);

      switch (channel) {
        case "red":
          return layers[0];
        case "green":
          return layers[1];
        case "blue":
          return layers[2];
      }
    }

    const debugLayer = layers[3];

    const boxFit = ctx.centerFitRect(ctx.setup.canvas.size);
    const boxOffset = pointFromBox(boxFit, "top-left");
    const boxSize = sizeOf(boxFit);

    const segments = ctx.segmentAspectRatio(ctx.config.detail, "center", Math.round(boxSize.w), Math.round(boxSize.h));

    let zip = segments.shapes.map((s, i) => ({
      point: s,
      hsl: [ctx.setup.hue[i], ctx.setup.saturation[i], ctx.setup.luminance[i]] as const,
    }));

    if (segments.shapes.length != ctx.setup.luminance.length) {
      console.error(`Out of sync ${segments.shapes.length} segments vs ${ctx.setup.luminance.length} chunks`);
      return;
    }

    let prior: Element2D<typeof zip[0]> = undefined;
    let run = 0;
    for (const i of enumerate2d(zip, segments.horizontalCount)) {
      if (prior && !i.corner && !prior.corner) {
        const diff = ciede2000(i.item.hsl, prior.item.hsl);
        if (diff < ctx.config.diff_threshold && run++ < ctx.config.max_merge) {
          zip[prior.idx] = undefined;
        } else {
          run = 0;
        }
      }

      prior = i;
    }

    zip = zip.filter(Boolean);

    // const [w] = segments[0].distanceTo(segments[1]);

    // const strength = [w / ctx.config.strength[0], w / ctx.config.strength[1]];

    const del = delaunay(
      zip,
      (p) => p.point,
      (agg) => ({
        hsl: [
          medianOf(agg, (a) => a.hsl[0]),
          averageOf(agg, (a) => a.hsl[1]),
          averageOf(agg, (a) => a.hsl[2]),
        ] as const,
      })
    );

    for (const d of del) {
      if (d.agg.hsl[2] > ctx.config.high_threshold) {
        continue;
      }

      const s = 0.5 + d.agg.hsl[2] * segments.horizontalSize;
      const hatchFill = hatch(d.polygon, s, ctx.random.between([45, 200]));
      const hatchPoints = segmentToPoints(translateLines(hatchFill, boxOffset));

      const layer = pickLayerForHsl(d.agg.hsl);

      ctx.plotLine(layer.layer, "path", layer.pen).attr("d", lineFunction(hatchPoints));
    }

    // for (const p of zip) {
    //   ctx.plotLine(debugLayer.layer, "circle", "black").attr("cx", p.point.x).attr("cy", p.point.y).attr("r", 2);
    // }

    // for (const p of segments.shapes) {
    //   ctx.plotLine(debugLayer.layer, "circle", "red").attr("cx", p.x).attr("cy", p.y).attr("r", 2);
    // }
  },
};

export default DelaunayHatch;
