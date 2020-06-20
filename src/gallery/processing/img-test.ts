import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { OffscreenCanvasContext, createOffscreenCanvas } from "src/processing/OffscreenCanvasContext";
import { ENETUNREACH } from "constants";

const config = makeRenderConfig({});

type SetupContext = {
  canvas: OffscreenCanvasContext;
};

const Processing: D3Artwork<typeof config, SetupContext> = {
  type: "d3",
  config,
  initialProps: {
    orientation: "portrait",
  },
  setup: (config, prior) => {
    if (prior) {
      return undefined;
    }

    return async () => ({
      canvas: await createOffscreenCanvas(
        "https://upload.wikimedia.org/wikipedia/commons/7/76/Boris_Johnson_official_portrait_%28cropped%29.jpg"
      ),
    });
  },
  render: (selection, ctx) => {
    console.dir("In render");
    const lumChunks = ctx.setup.canvas.aggregateChunksAspectRatioFlat(100, "median", "luminance");
    console.dir("Got chunks");

    const d1 = ctx.layer(selection, "d1");

    const segements = ctx.segmentAspectRatio(100, "center");

    for (let i = 0; i < segements.length; i++) {
      const peer = lumChunks[i];
      const self = segements[i];

      ctx
        .plotLine(d1, "circle")
        .attr("cx", self[0])
        .attr("cy", self[1])
        .attr("r", (1 - lumChunks[i]) * 2);
    }
    console.dir("Completed render");
  },
};

export default Processing;
