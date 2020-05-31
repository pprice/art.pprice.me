import React, { useState, useCallback } from "react";
import { Box, Slider, TextField } from "@material-ui/core";
import { PropertyEditorComponent } from "./types";
import { NumericProperty } from "..";

export const MinMaxNumberEditor: PropertyEditorComponent<NumericProperty> = ({
  propertyKey,
  property,
  initial,
  onUpdated,
}) => {
  const [value, setValue] = useState(initial);

  const handleUpdate = useCallback(
    (newValue: number) => {
      onUpdated(propertyKey, value, newValue);
      setValue(newValue);
    },
    [propertyKey]
  );

  return (
    <>
      <Slider
        value={value}
        min={property.min}
        max={property.max}
        onChange={(e, value) => handleUpdate(value as number)}
      />
      <Box marginLeft={1} width={125}>
        <TextField
          variant="outlined"
          type="number"
          size="small"
          value={value}
          onChange={(e) => handleUpdate(parseFloat(e.target.value))}
        />
      </Box>
    </>
  );
};
