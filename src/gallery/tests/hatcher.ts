import * as d3 from "d3";
import flatten from "@flatten-js/core";

import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { MicronPigma } from "@/const";
import { toRadians } from "@/geom/math";
import { identityMatrix } from "@/geom";
import { hatch, crossHatch } from "@/geom/hatch";

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
    const lineFunction = ctx.getPointLineRenderer("linear");
    const d1 = ctx.layer(selection, "d1");
    const d2 = ctx.layer(selection, "d2");

    const b1 = new flatten.Box(40, 40, 200, 400);
    const b2 = new flatten.Box(40 + 300, 40, 200 + 300, 400);

    const container1 = new flatten.Polygon(b1.toSegments());
    const container2 = new flatten.Polygon(b2.toSegments());

    const hatch1 = hatch(container1, 10, 145);
    const hatch2 = crossHatch(container2, 10, 12);

    for (const h of hatch1) {
      ctx.plotLine(d2, "path", "blue").attr("d", lineFunction([h.ps, h.pe]));
    }

    for (const hh of hatch2) {
      ctx.plotLine(d1, "path", "red").attr("d", lineFunction(hh.map((l) => [l.pe, l.ps]).flat()));
    }

    ctx.plotLine(d2, "path", "green").attr("d", lineFunction(container1.vertices));
  },
};

export default TestPrint;
