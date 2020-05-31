import React, { FunctionComponent } from "react";
import { PropertyEditorProps } from "./types";
import { MinMaxNumberEditor } from "./MinMaxNumberEditor";

export const PropertyEditor: FunctionComponent<PropertyEditorProps> = ({ property, ...props }) => {
  switch (property.type) {
    case "number":
      if (property.min != undefined && property.max != undefined) {
        return <MinMaxNumberEditor property={property} {...props} />;
      }

      break;
    default:
      return null;
  }

  return null;
};
