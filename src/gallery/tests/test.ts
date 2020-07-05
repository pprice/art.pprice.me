import * as d3 from "d3";

import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { MicronPigma } from "@/const";

const config = makeRenderConfig({
  num_h_lines: {
    displayName: "# H Lines",
    type: "number",
    default: 60,
    min: 50,
    max: 100,
  },
  num_v_lines: {
    displayName: "# V Lines",
    type: "number",
    default: 80,
    min: 50,
    max: 100,
  },
});

const TestPrint: D3Artwork<typeof config> = {
  type: "d3",
  config,
  render: (selection, ctx) => {
    // selection.append("circle").attr("cx", 100).attr("cy", 40).attr("r", 50);
    const lineFunction = d3.line<number[]>().curve(d3.curveBundle);
    const vSegment = ctx.segmentDimension(ctx.config.num_v_lines, "vertical");
    const hSegment = ctx.segmentDimension(ctx.config.num_h_lines, "horizontal");

    for (const segment of vSegment) {
      const lineData: number[][] = [
        [0, segment],
        [ctx.width, segment],
      ];

      selection
        .append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", MicronPigma.blue)
        .attr("stroke-width", "0.5px")
        .attr("fill", "none");
    }

    for (const segment of hSegment) {
      const lineData: number[][] = [
        [segment, 0],
        [segment, ctx.height],
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

export default TestPrint;
