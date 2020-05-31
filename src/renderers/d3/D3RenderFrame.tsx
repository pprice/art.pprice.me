import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import * as d3 from "d3";

import { Sizes, CanvasSize, createCanvasSize, inchesToPixels } from "@/const/sizes";
import { svgSerializer } from "@/utils";
import { BaseRenderFrameProps, RenderRef } from "../props";
import { D3RenderContext, Selection } from "./D3RenderContext";

export type { D3RenderContext, Selection };

export type D3RenderFrameProps<TDatum> = BaseRenderFrameProps & {
  type: "d3";
  onRender: (selection: Selection<TDatum>, context: D3RenderContext<any>) => void;
};

export const D3RenderFrame = forwardRef<RenderRef, D3RenderFrameProps<any>>(
  ({ margin, seed, size, orientation, onRender, attribution, config, ...props }, ref) => {
    const svgSize = useMemo(() => {
      const factory = Sizes[size];
      if (!factory) {
        console.warn(`Unknown size ${size}`);
        return undefined;
      }
      return factory()[orientation];
    }, [size, orientation]);
    const svgRef = useRef();

    // Forward ref implementation
    useImperativeHandle(ref, () => ({
      serialize() {
        return svgSerializer(svgRef.current, svgSize);
      },
    }));

    const [margins, marginsPixels] = useMemo(() => {
      const margins: number[] | undefined = Array.isArray(margin)
        ? margin
        : margin
        ? [margin, margin, margin, margin]
        : undefined;

      const marginsPixels: number[] | undefined = margins && margins.map((v) => inchesToPixels(v));

      return [margins, marginsPixels];
    }, [margin]);

    useEffect(() => {
      const root = d3.select(svgRef.current);

      if (!svgSize) {
        return;
      }

      // Calculate drawing area
      let drawingDimensions = [...svgSize.inches];

      if (margins) {
        drawingDimensions[0] = drawingDimensions[0] - margins[0] - margins[2];
        drawingDimensions[1] = drawingDimensions[1] - margins[1] - margins[3];
      }

      const drawingCanvas: CanvasSize = createCanvasSize(drawingDimensions[0], drawingDimensions[1]);

      // TODO: Move to memo
      const context = new D3RenderContext(svgSize, drawingCanvas, seed, config);
      const drawElement = context.recreateLayer(root, "draw");

      // Overlay (bounding argins, etc)
      const overlayElement = context.recreateLayer(root, "overlay");

      if (margins) {
        drawElement.attr("transform", `translate(${marginsPixels[0]}, ${marginsPixels[1]})`);

        if (props.containerStroke && props.containerStrokeWidth) {
          overlayElement
            .append("rect")
            .attr("x", marginsPixels[0])
            .attr("y", marginsPixels[1])
            .attr("width", drawingCanvas.pixels[0])
            .attr("height", drawingCanvas.pixels[1])
            .attr("stroke", props.containerStroke)
            .attr("stroke-width", props.containerStrokeWidth)
            .attr("fill", "none");
        }
      }

      onRender(drawElement, context);

      // Draw attribution
      const attributionElement = context.recreateLayer(root, "attribution");

      if (attribution) {
        const attr = attribution.replace("[SEED]", seed || `Unknown`).replace("[DATE]", "2020-05-01");

        attributionElement
          .append("text")
          .text(attr)
          .attr("x", +marginsPixels[0] + drawingCanvas.pixels[0] / 2)
          .attr("y", +(marginsPixels[3] / 2) + drawingCanvas.pixels[1] + marginsPixels[1] + 5)
          .attr("fill", "black")
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("font-family", "sans-serif");
      }
    }, [svgRef.current, onRender, seed, margins, attribution, svgSize, config]);

    if (!svgSize) {
      return null;
    }

    return (
      <div style={{ background: "#EEE", padding: 20 }}>
        <svg
          viewBox={svgSize.viewBox}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          ref={svgRef}
          style={{ background: "white", margin: 0, padding: 0, border: "1px solid #BBB" }}
        >
          <g id="debug"></g>
        </svg>
      </div>
    );
  }
);

D3RenderFrame.defaultProps = {
  containerStroke: "black",
  containerStrokeWidth: 1,
};
