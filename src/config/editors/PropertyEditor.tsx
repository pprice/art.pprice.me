import React, { FunctionComponent } from "react";
import { PropertyEditorProps } from "./types";
import { MinMaxNumberEditor } from "./MinMaxNumberEditor";
import { NumberRangeEditor } from "./NumberRangeEditor";
import { ImageEditor } from "./ImageEditor";
import { ChoiceEditor } from "./ChoiceEditor";

export const PropertyEditor: FunctionComponent<PropertyEditorProps> = ({ property, initial, ...props }) => {
  switch (property.type) {
    case "number":
      if (property.min != undefined && property.max != undefined) {
        return <MinMaxNumberEditor property={property} initial={initial as number} {...props} />;
      }

      break;
    case "number-range":
      return <NumberRangeEditor property={property} initial={initial as [number, number]} {...props} />;
    case "image":
      return <ImageEditor property={property} initial={initial as string} {...props} />;
    case "choice":
      return <ChoiceEditor property={property} initial={initial as string} {...props} />;
    default:
      return null;
  }

  return null;
};
