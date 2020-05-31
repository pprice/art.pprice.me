import React from "react";
import * as d3 from "d3";
import { MicronPigma } from "@/const";
import { D3RenderContext, Selection, RenderContainer } from "@/renderers";
import { RuntimeRenderConfiguration, makeRenderConfig } from "@/config";

const Config = makeRenderConfig({
  num_lines: {
    displayName: "Number of lines",
    type: "number",
    default: 60,
    min: 50,
    max: 100,
  },
});

function Lines() {
  const render = (selection: Selection, ctx: D3RenderContext<RuntimeRenderConfiguration<typeof Config>>) => {
    // selection.append("circle").attr("cx", 100).attr("cy", 40).attr("r", 50);
    var lineFunction = d3.line<number[]>().curve(d3.curveBundle);
    const vSegment = ctx.segmentDimension(ctx.config.num_lines, "vertical");
    const hSegment = ctx.segmentDimension(10, "horizontal");

    for (let segment of vSegment) {
      const lineData: number[][] = [
        [0, ctx.height / 4 + segment / 2],
        ...ctx
          .range(1, hSegment.length)
          .map((_x, j) => ctx.clamp([hSegment[j], segment + ctx.random.between(-40, +40)], 5)),
        [ctx.width, ctx.height / 4 + segment / 2],
      ];

      selection
        .append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", MicronPigma.blue)
        .attr("stroke-width", "0.5px")
        .attr("fill", "none");
    }
  };

  return <RenderContainer type="d3" config={Config} onRender={render} margin={1} attribution="Sea / [SEED] / [DATE]" />;
}

export default Lines;
