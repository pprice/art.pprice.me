import React, { useState, useRef } from "react";
import { Button, Divider, Box, TextField } from "@material-ui/core";
import * as d3 from "d3";
import { D3Render, Selection, RenderContext, D3RenderRef } from "../src/D3Render";
import { serializeSvg } from "../src/serializer";
import FileSaver from "file-saver";
import { MicronPigma } from "../src/colors";
import { Micron } from "../src/pens";

function Lines() {
  const render = (selection: Selection, ctx: RenderContext) => {
    // selection.append("circle").attr("cx", 100).attr("cy", 40).attr("r", 50);
    var lineFunction = d3.line<number[]>().curve(d3.curveBundle);

    const vSegment = ctx.segmentDimension(ctx.random.between(50, 100), "vertical");
    const hSegment = ctx.segmentDimension(10, "horizontal");

    let i = 0;
    for (let segment of vSegment) {
      const lineData: number[][] = [
        [0, segment],
        ...ctx.range(1, hSegment.length).map((_x, j) => [hSegment[j], segment + ctx.random.between(-i, i)]),
        [ctx.width, segment],
      ];

      selection
        .append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", MicronPigma.blue)
        .attr("stroke-width", "0.5px")
        .attr("fill", "none");

      i++;
    }
  };

  const [seed, setSeed] = useState("");
  const renderRef = useRef<D3RenderRef>();

  return (
    <>
      <D3Render
        ref={renderRef}
        size="Bristol9x12"
        orientation="landscape"
        onRender={render}
        seed={seed}
        margin={1}
        attribution="Sea / [SEED] / [DATE]"
      />
      <Divider />
      <Box display="flex" marginTop={2}>
        <Button
          variant="contained"
          onClick={() => {
            const blob = renderRef.current.serialize();
            FileSaver.saveAs(blob, "Lines.svg");
          }}
        >
          Download SVG
        </Button>
      </Box>
      <Box display="flex" marginTop={2}>
        <TextField label={"Seed"} variant="outlined" value={seed} onChange={(e) => setSeed(e.target.value)} />
        <Button variant="outlined" onClick={() => setSeed(Math.floor(Math.random() * 100000000).toString())}>
          Random
        </Button>
      </Box>
    </>
  );
}

export default Lines;
