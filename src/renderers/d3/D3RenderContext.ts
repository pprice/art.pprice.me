import { RenderContext } from "../context/RenderContext";
import { CanvasSize, BlendMode } from "@/const";
import { Selection, BaseType } from "d3";

export type D3Selection<TBaseType extends BaseType = BaseType, TDatum = any> = Selection<
  TBaseType,
  unknown,
  HTMLElement,
  TDatum
>;

export class D3RenderContext<TConfig> extends RenderContext<TConfig> {
  private layerId: number = 0;

  constructor(pageCanvas: CanvasSize, canvas: CanvasSize, seed: string, blendMode: BlendMode, config: TConfig) {
    super(pageCanvas, canvas, seed, blendMode, config);
  }

  private appendLayer(
    target: D3Selection,
    name: string,
    id: string = name,
    blendMode: BlendMode = undefined
  ): D3Selection {
    const idx = this.layerId++;

    return target
      .append("g")
      .style("mix-blend-mode", blendMode || this.blendMode || "normal")
      .attr("id", id)
      .attr("inkscape-groupmode", "layer")
      .attr("inkscape-label", `${idx}-${name}`);
  }

  public layer(target: D3Selection, name: string, id: string = name): D3Selection {
    target.select(`#${id}`).remove();
    return this.appendLayer(target, name, id);
  }

  public applyPlotLineAttr<TSelection extends BaseType>(
    selection: D3Selection<TSelection>,
    pen: string = "black",
    width: number = 0.75
  ): D3Selection<TSelection> {
    return selection.attr("stroke", pen).attr("stroke-width", `${width}px`).attr("fill", "none");
  }

  public plotLine<K extends keyof SVGElementTagNameMap>(
    selection: D3Selection,
    shape: K,
    pen: string = "black",
    width: number = 0.75
  ) {
    return this.applyPlotLineAttr(selection.append(shape), pen, width);
  }
}
