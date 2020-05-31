import React, { FunctionComponent, useState } from "react";
import { RenderConfiguration, RuntimeRenderConfiguration, getDefaultConfiguration } from "./Config";
import { Box, Grid, Typography, Slider, TextField } from "@material-ui/core";

type ConfigEditorProps = {
  config: RenderConfiguration;
  onConfigUpdated: (runtimeConfig: any) => void;
  initial?: any;
};

export const ConfigEditor: FunctionComponent<ConfigEditorProps> = ({ config, initial }) => {
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeRenderConfiguration<any>>(
    getDefaultConfiguration(config, initial)
  );

  return (
    <Grid container spacing={1}>
      {Object.entries(config).map(([key, config]) => {
        return (
          <React.Fragment key={key}>
            <Grid item xs={4}>
              <Box p={1} justifyItems="end" width="100%" height="100%" alignItems="center" bgcolor="red">
                <Typography variant="caption">{config.displayName || key}</Typography>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box display="flex" flexDirection="row" width="100%" height="100%" alignItems="center">
                <Slider />
                <TextField variant="outlined" type="number" size="small" />
              </Box>
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
  );
};
