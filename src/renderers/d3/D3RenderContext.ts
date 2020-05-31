import { RenderContext } from "../context/RenderContext";
import { CanvasSize } from "@/const";

export type D3Selection<TDatum = any> = d3.Selection<d3.BaseType, unknown, HTMLElement, TDatum>;

export class D3RenderContext<TConfig> extends RenderContext<TConfig> {
  private layerId: number = 0;

  constructor(pageCanvas: CanvasSize, canvas: CanvasSize, seed: string, config: TConfig) {
    super(pageCanvas, canvas, seed, config);
  }

  appendLayer(target: D3Selection, name: string, id: string = name): D3Selection {
    const idx = this.layerId++;

    return target
      .append("g")
      .attr("id", id)
      .attr("inkscape-groupmode", "layer")
      .attr("inkscape-label", `${idx}-${name}`);
  }

  recreateLayer(target: D3Selection, name: string, id: string = name): D3Selection {
    target.select(`#${id}`).remove();
    return this.appendLayer(target, name, id);
  }
}
