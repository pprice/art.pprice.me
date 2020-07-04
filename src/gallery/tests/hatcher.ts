import * as d3 from "d3";
import flatten from "@flatten-js/core";

import { D3Artwork } from "../types/d3";
import { makeRenderConfig } from "@/config";
import { MicronPigma } from "@/const";
import { toRadians } from "@/geom/math";

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
    var lineFunction = d3
      .line<flatten.Point>()
      .curve(d3.curveLinear)
      .x((p) => p.x)
      .y((p) => p.y);
    const d1 = ctx.layer(selection, "d1");
    const d2 = ctx.layer(selection, "d2");

    const container2 = new flatten.Box(40, 40, 200, 200);
    const container = new flatten.Polygon(container2);

    let lines: flatten.Segment[] = [];

    const wO = (container.box.xmax - container.box.xmin) / 4;
    const hO = (container.box.ymax - container.box.ymin) / 4;

    for (let x = container.box.xmin - wO; x < container.box.xmax + wO; x += 10) {
      lines.push(flatten.segment(flatten.point(x, container.box.ymin - hO), flatten.point(x, container.box.ymax + hO)));
    }

    const a = 45;

    lines = [
      ...lines.map((r) => r.rotate(toRadians(a), container.box.center)),
      ...lines.map((r) => r.rotate(toRadians(180 - a), container.box.center)),
    ];

    const intersected = lines.map((l) => container.intersect(l)).flat();

    ctx.plotLine(d1, "path").attr("d", lineFunction(intersected));
    //ctx.plotLine(d2, "path", "red").attr("d", lineFunction(lines.map((l) => [l.pe, l.ps]).flat()));
    ctx.plotLine(d2, "path", "green").attr("d", lineFunction(container.vertices));
  },
};

export default TestPrint;
