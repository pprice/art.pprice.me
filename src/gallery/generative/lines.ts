import * as d3 from "d3";

import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { MicronPigma } from "@/const";

const config = makeRenderConfig({
  num_lines: {
    displayName: "# Lines",
    type: "number",
    default: 60,
    min: 50,
    max: 100,
  },
  variance: {
    displayName: "Variance",
    type: "number-range",
    default: [-40, +40],
    min: -100,
    max: +100,
  },
});

const Lines: D3Artwork<typeof config> = {
  type: "d3",
  path: "generative/lines",
  supportsRandom: true,
  config,
  initialProps: {
    containerStrokeWidth: 1,
    containerStroke: "black",
  },
  render: (selection, ctx) => {
    // selection.append("circle").attr("cx", 100).attr("cy", 40).attr("r", 50);
    var lineFunction = d3.line<number[]>().curve(d3.curveBundle);
    const vSegment = ctx.segmentDimension(ctx.config.num_lines, "vertical");
    const hSegment = ctx.segmentDimension(10, "horizontal");

    for (let segment of vSegment) {
      const lineData: number[][] = [
        [0, ctx.height / 4 + segment / 2],
        ...ctx
          .range(1, hSegment.length)
          .map((_x, j) => ctx.clamp([hSegment[j], segment + ctx.random.between(ctx.config.variance)], 5)),
        [ctx.width, ctx.height / 4 + segment / 2],
      ];

      selection
        .append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", MicronPigma.blue)
        .attr("stroke-width", "0.5px")
        .attr("fill", "none");
    }
  },
};

export default Lines;
