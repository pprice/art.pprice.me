import React, { useState, FunctionComponent } from "react";
import { Typography, Box, Tooltip, Switch } from "@material-ui/core";

import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/InfoOutlined";

type RenderHeaderProps = {
  title?: string;
  description?: string;
  hasSettings?: boolean;
  onToggleSettings?: (value: boolean) => void;
};

export const RenderHeader: FunctionComponent<RenderHeaderProps> = ({
  title = "Untitled",
  description,
  hasSettings,
  onToggleSettings,
}) => {
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <Box display="flex" marginBottom={2} flexDirection="row" alignItems="center" flexWrap="wrap">
      <Box marginRight={2} alignItems="center" display="flex">
        <Typography variant="h2">{title}</Typography>
        {description && (
          <Box marginLeft={1} alignItems="center" marginBottom={-0.5}>
            <Tooltip title={<Typography>{description}</Typography>}>
              <InfoIcon opacity={0.7} />
            </Tooltip>
          </Box>
        )}
      </Box>

      {hasSettings && (
        <Box marginLeft="auto" alignItems="center" display="flex">
          <SettingsIcon />
          <Switch
            size="small"
            value={toggleValue}
            onChange={(e, checked) => {
              setToggleValue(checked);
              onToggleSettings?.(checked);
            }}
          />
        </Box>
      )}
    </Box>
  );
};
