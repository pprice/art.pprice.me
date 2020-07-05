import React, { useState, useCallback } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { PropertyEditorComponent } from "./types";
import { ChoiceProperty } from "..";

export const ChoiceEditor: PropertyEditorComponent<ChoiceProperty> = ({
  propertyKey,
  property,
  initial,
  onUpdated,
}) => {
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
      <Select fullWidth value={value} onChange={(e) => handleUpdate(e.target.value as string)}>
        {property.choices.map((p) => (
          <MenuItem key={p.value} value={p.value}>
            {p.label || p.value}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
