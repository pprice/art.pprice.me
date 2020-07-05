import * as d3 from "d3";

import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { MicronPigma } from "@/const";

const config = makeRenderConfig({
  steps: {
    displayName: "# Steps",
    type: "number",
    default: 84,
    min: 20,
    max: 360,
  },
  radius_x: {
    displayName: "Radius X",
    type: "number",
    default: 100,
    min: 5,
    max: 360,
  },
  radius_y: {
    displayName: "Radius Y",
    type: "number",
    default: 300,
    min: 5,
    max: 360,
  },
  groups: {
    displayName: "Groups",
    type: "number",
    default: 3,
    min: 1,
    max: 5,
  },
});

const Pens = [MicronPigma.red, MicronPigma.blue, MicronPigma.green, MicronPigma.brown, MicronPigma.rose];

const Torus: D3Artwork<typeof config> = {
  type: "d3",
  path: "math/ellipse-torus",
  config,
  render: (selection, ctx) => {
    const center = ctx.center;

    const stepSize = 360 / ctx.config.steps;

    const groups = ctx.range(1, ctx.config.groups).map((i) => ({ layer: ctx.layer(selection, `group-${i}`) }));

    for (let i = 0; i < Math.ceil(180 - stepSize); i += stepSize) {
      const groupId = Math.floor(i) % ctx.config.groups;

      const layer = groups[groupId]?.layer;
      const pen = Pens[groupId];

      if (!layer) {
        continue;
      }

      layer
        .append("ellipse")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("rx", ctx.config.radius_x)
        .attr("ry", ctx.config.radius_y)
        .attr("transform", `rotate(${i}, ${ctx.width / 2}, ${ctx.height / 2})`)
        .attr("stroke", pen)
        .attr("stroke-width", "0.75px")
        .attr("fill", "none");
    }
  },
};

export default Torus;
