import React, { useState, useCallback } from "react";
import { Box, Slider, TextField } from "@material-ui/core";
import { PropertyEditorComponent } from "./types";
import { NumericRangeProperty } from "@/lib/config";

export const NumberRangeEditor: PropertyEditorComponent<NumericRangeProperty> = ({
  propertyKey,
  property,
  initial,
  onUpdated,
}) => {
  const [value, setValue] = useState(initial);

  const handleUpdate = useCallback(
    (newValue: [number, number]) => {
      onUpdated(propertyKey, value, newValue);
      setValue([newValue[0], newValue[1]]);
    },
    [propertyKey]
  );

  return (
    <>
      <Slider
        value={value}
        min={property.min}
        max={property.max}
        step={property.step}
        onChange={(e, value) => handleUpdate(value as [number, number])}
      />
      <Box marginLeft={1} width={150} flexDirection="row" display="flex">
        <Box marginRight={1}>
          <TextField
            variant="standard"
            type="number"
            size="small"
            value={value[0]}
            onChange={(e) => handleUpdate([parseFloat(e.target.value), value[1]])}
          />
        </Box>
        <TextField
          variant="standard"
          type="number"
          size="small"
          value={value[1]}
          onChange={(e) => handleUpdate([value[0], parseFloat(e.target.value)])}
        />
      </Box>
    </>
  );
};
