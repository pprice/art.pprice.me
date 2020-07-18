import React, { useState, FunctionComponent } from "react";
import { Typography, Box, Tooltip, Switch, IconButton, ClickAwayListener, Collapse } from "@material-ui/core";

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
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setDescriptionOpen(false)}>
      <Box>
        <Box display="flex" marginBottom={2} flexDirection="row" alignItems="center" flexWrap="wrap">
          <Box marginRight={2} alignItems="center" display="flex">
            <Typography variant="h2">{title}</Typography>
            {description && (
              <Box marginLeft={1} alignItems="center" marginBottom={-0.5}>
                <IconButton size="small">
                  <InfoIcon onClick={() => setDescriptionOpen((v) => !v)} />
                </IconButton>
              </Box>
            )}
          </Box>

          {hasSettings && (
            <Box marginLeft="auto" alignItems="center" display="flex">
              <SettingsIcon />
              <Switch
                size="small"
                value={toggleValue}
                onChange={(_e, checked) => {
                  setToggleValue(checked);
                  onToggleSettings?.(checked);
                }}
              />
            </Box>
          )}
        </Box>
        {description && (
          <Collapse in={descriptionOpen}>
            <Box marginBottom={2}>
              {description.split("\n").map((line, i) => (
                <Typography key={i} variant="subtitle1">
                  {line}
                </Typography>
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    </ClickAwayListener>
  );
};
