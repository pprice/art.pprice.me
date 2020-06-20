import { useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import * as d3 from "d3";

import { Sizes, CanvasSize, createCanvasSize, inchesToPixels } from "@/const/sizes";
import { svgSerializer } from "@/utils";
import { BaseRenderFrameProps, RenderRef } from "../props";
import { D3RenderContext, D3Selection } from "./D3RenderContext";
import { BaseType } from "d3";

export type D3RenderFrameProps<TDatum> = BaseRenderFrameProps & {
  type: "d3";
  onRender: (selection: D3Selection<BaseType, TDatum>, context: D3RenderContext<any, any>) => Promise<void> | void;
};

export const D3RenderFrame = forwardRef<RenderRef, D3RenderFrameProps<any>>(
  ({ margin = 1, seed, size, orientation, onRender, attribution, config, blendMode, ...props }, ref) => {
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

    const [inRender, setInRender] = useState(false);
    const currentRender = useRef<Promise<void> | undefined>();

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
      setInRender(true);
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
      const context = new D3RenderContext(svgSize, drawingCanvas, seed, blendMode, config, props.setupResult);
      const drawLayer = context.layer(root, "draw");
      const attributionLayer = context.layer(root, "attribution");
      const overlayLayer = context.layer(root, "overlay");

      // Overlay (bounding margins, etc)
      if (margins) {
        drawLayer.attr("transform", `translate(${marginsPixels[0]}, ${marginsPixels[1]})`);
      }

      if (margins && props.containerStroke && props.containerStrokeWidth) {
        drawContainer(overlayLayer, marginsPixels, drawingCanvas, props);
      }

      // Draw attribution
      if (attribution) {
        drawAttribution(attribution, seed, attributionLayer, marginsPixels, drawingCanvas);
      }

      // Draw Actual Render
      const render = async () => {
        await currentRender?.current;
        setInRender(true);
        currentRender.current = onRender(drawLayer, context) || undefined;
        await currentRender.current;
        setInRender(false);
      };

      render();
    }, [svgRef.current, onRender, seed, margins, attribution, svgSize, blendMode, config, props.setupResult]);

    if (!svgSize) {
      return null;
    }

    return (
      <div>
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

function drawContainer(layer: D3Selection<any>, marginsPixels: number[], drawingCanvas: CanvasSize, props) {
  layer
    .append("rect")
    .attr("x", marginsPixels[0])
    .attr("y", marginsPixels[1])
    .attr("width", drawingCanvas.pixels[0])
    .attr("height", drawingCanvas.pixels[1])
    .attr("stroke", props.containerStroke)
    .attr("stroke-width", props.containerStrokeWidth)
    .attr("fill", "none");
}

function drawAttribution(
  attribution: string,
  seed: string,
  attributionLayer: D3Selection<any>,
  marginsPixels: number[],
  drawingCanvas: CanvasSize
) {
  const attr = attribution.replace("[SEED]", seed || `Unknown`).replace("[DATE]", "2020-05-01");
  attributionLayer
    .append("text")
    .text(attr)
    .attr("x", +marginsPixels[0] + drawingCanvas.pixels[0] / 2)
    .attr("y", +(marginsPixels[3] / 2) + drawingCanvas.pixels[1] + marginsPixels[1] + 5)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif");
}
