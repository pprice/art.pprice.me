import React, { forwardRef, memo } from "react";
import { D3RenderFrame } from "./D3RenderFrame";
import { RenderFrameProps, RenderRef } from "./props";

export const RenderFrame = memo(
  forwardRef<RenderRef, RenderFrameProps>((props, ref) => {
    if (props.type === "d3") {
      return <D3RenderFrame {...props} ref={ref} />;
    }

    return <div>Unsupported</div>;
  })
);

RenderFrame.displayName = "RenderFrame";
