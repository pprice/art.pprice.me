import React, { useState, useCallback } from "react";
import { Box, Slider, TextField, Select, MenuItem } from "@material-ui/core";
import { PropertyEditorComponent } from "./types";
import { ImageProperty } from "..";

export const ImageEditor: PropertyEditorComponent<ImageProperty> = ({ propertyKey, property, initial, onUpdated }) => {
  const [value, setValue] = useState(initial);

  const handleUpdate = useCallback(
    (newValue: string) => {
      onUpdated(propertyKey, value, newValue);
      setValue(newValue);
    },
    [propertyKey]
  );

  return (
    <>
      <Select fullWidth value={initial} onChange={(e, v) => handleUpdate(e.target.value as string)}>
        {property.predefined?.map((p) => (
          <MenuItem key={p.source} value={p.source}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
