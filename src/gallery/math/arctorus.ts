import * as d3 from "d3";
import { makeRenderConfig } from "@/lib/config";
import { MicronPigma } from "@/lib/const";
import { D3Artwork } from "@/lib/artwork";

const config = makeRenderConfig({
  steps: {
    displayName: "# Steps",
    type: "number",
    default: 180,
    min: 1,
    max: 360,
  },
  groups: {
    displayName: "# Groups",
    type: "number",
    default: 3,
    min: 1,
    max: 5,
  },
  interior: {
    displayName: "Interior",
    type: "number",
    default: 30,
    min: 1,
    max: 100,
  },
  pad: {
    displayName: "Padding",
    type: "number",
    default: 20,
    min: 0,
    max: 50,
  },
  arc_length: {
    displayName: "Arc Length",
    type: "number",
    default: Math.PI,
    min: Math.PI,
    max: Math.PI * 2,
    step: 0.01,
  },
});

const Pens = [MicronPigma.red, MicronPigma.blue, MicronPigma.green, MicronPigma.brown, MicronPigma.rose];

const Torus: D3Artwork<typeof config> = {
  type: "d3",
  path: "math/arc-torus",
  config,
  render: async (selection, ctx) => {
    const groups = ctx.range(1, ctx.config.groups).map((i) => {
      const layer = ctx.layer(selection, `group-${i}`);
      return { layer };
    });

    const stepSize = 360 / ctx.config.steps;
    const minimumDimension = ctx.smallestDimension / 2;
    const steps = 360 - stepSize / 2;
    const halfMin = (minimumDimension - ctx.config.pad) / 2;
    const interiorRatio = Math.abs(ctx.config.interior - 100) / 100;
    const offset = halfMin * interiorRatio;
    const radius = minimumDimension - ctx.config.pad - offset;

    for (let i = 0, groupIdx = 0; i < steps; i += stepSize, groupIdx++) {
      const groupId = groupIdx % ctx.config.groups;
      const layer = groups[groupId]?.layer;
      const pen = Pens[groupId];

      const path = d3.path();
      path.arc(ctx.center.x - offset, ctx.center.y, radius, 0, ctx.config.arc_length);

      ctx
        .plotLine(layer, "path", pen)
        .attr("d", path.toString())
        .attr("transform", `rotate(${i}, ${ctx.width / 2}, ${ctx.height / 2})`);
    }

    for (let i = 0; i < ctx.config.groups; i++) {
      const layer = groups[i]?.layer;
      const pen = Pens[i];

      const exteriorRadius = radius + offset;
      const interiorRadius = exteriorRadius * (ctx.config.interior / 100);

      // Exterior
      ctx.plotLine(layer, "circle", pen).attr("cx", ctx.center.x).attr("cy", ctx.center.y).attr("r", exteriorRadius);

      // Interior
      ctx.plotLine(layer, "circle", pen).attr("cx", ctx.center.x).attr("cy", ctx.center.y).attr("r", interiorRadius);
    }
  },
};

export default Torus;
