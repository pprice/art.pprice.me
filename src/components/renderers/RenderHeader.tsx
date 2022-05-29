import { Box, ClickAwayListener, Collapse, IconButton, Switch, Typography } from "@material-ui/core";
import React, { FunctionComponent, useMemo, useState } from "react";

import InfoIcon from "@material-ui/icons/InfoOutlined";
import SettingsIcon from "@material-ui/icons/Settings";

type RenderHeaderProps = {
  title?: string;
  description?: string | string[];
  hasSettings?: boolean;
  onToggleSettings?: (value: boolean) => void;
};

export const RenderHeader: FunctionComponent<RenderHeaderProps> = ({
  title = "Untitled",
  description,
  hasSettings,
  onToggleSettings,
}) => {
  const [toggleValue, setToggleValue] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const descriptionLines = useMemo(() => {
    if (!description) {
      return [];
    }

    if (!Array.isArray(description)) {
      description = [description];
    }

    return description.map((i) => i.split("\n")).flat();
  }, [description]);

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
                checked={toggleValue}
                onChange={(_e, checked) => {
                  setToggleValue(checked);
                  onToggleSettings?.(checked);
                }}
              />
            </Box>
          )}
        </Box>
        {descriptionLines && descriptionLines.length > 0 && (
          <Collapse in={descriptionOpen}>
            <Box marginBottom={2}>
              {descriptionLines.map((line, i) => (
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
