import React, { FunctionComponent, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Box, Grid, Typography } from "@material-ui/core";

import { RenderConfiguration, RuntimeRenderConfiguration, getDefaultConfiguration } from "./Config";
import { PropertyEditor } from "./editors/PropertyEditor";

type ConfigEditorProps = {
  config: RenderConfiguration;
  onConfigUpdated: (runtimeConfig: any) => void;
  activeConfig?: any;
};

export const ConfigEditor: FunctionComponent<ConfigEditorProps> = ({ config, activeConfig, onConfigUpdated }) => {
  const [handleUpdate] = useDebouncedCallback((key: string, _oldValue: any, newValue: any) => {
    const updated = { ...activeConfig, [key]: newValue };
    onConfigUpdated(updated);
  }, 250);

  return (
    <Grid container spacing={1}>
      {Object.entries(config).map(([key, prop]) => {
        return (
          <React.Fragment key={key}>
            <Grid item xs={4}>
              <Box p={1} justifyItems="end" width="100%" height="100%">
                <Typography align="right" noWrap>
                  {prop.displayName || key}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box display="flex" flexDirection="row" width="100%" height="100%" alignItems="center">
                <PropertyEditor
                  initial={activeConfig[key]}
                  propertyKey={key}
                  property={prop}
                  onUpdated={handleUpdate}
                />
              </Box>
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
  );
};
