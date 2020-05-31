import React, { FunctionComponent, useRef, useState, useMemo } from "react";
import FileSaver from "file-saver";
import { Divider, Box, Button, TextField, IconButton, Select, MenuItem, Popover } from "@material-ui/core";
import ArrowDownload from "@material-ui/icons/ArrowDownward";
import Refresh from "@material-ui/icons/Refresh";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import CakeIcon from "@material-ui/icons/Cake";
import SettingsIcon from "@material-ui/icons/Settings";

import { RenderFrameProps, RenderRef } from "./props";
import { RenderFrame } from "./RenderFrame";
import { useDebounce } from "../hooks";
import { PaperSizes } from "../const/sizes";
import { RenderConfiguration, getDefaultConfiguration } from "../config/Config";
import { ConfigEditor } from "../config/ConfigEditor";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type PartialRenderFrameProps = "seed" | "orientation" | "size";

type RenderContainerProps = PartialBy<Omit<RenderFrameProps, "ref">, PartialRenderFrameProps> & {
  defaultFileName?: string;
  config?: RenderConfiguration;
};

export const RenderContainer: FunctionComponent<RenderContainerProps> = ({
  defaultFileName,
  seed: initialSeed,
  orientation: initialOrientation,
  size: initialSize,
  config,
  ...props
}) => {
  const renderRef = useRef<RenderRef>();
  const settingsAnchorRef = useRef();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seed, setSeed] = useState(initialSeed || "");
  const [orientation, setOrientation] = useState(initialOrientation || "landscape");
  const [size, setSize] = useState<PaperSizes>(initialSize || "Bristol9x12");

  const debouncedSeed = useDebounce(seed, 250);

  const initialConfig = useMemo(() => getDefaultConfiguration(config), [config]);

  const [activeConfig, setActiveConfig] = useState<any>(initialConfig);

  return (
    <div style={{ width: "100%" }}>
      <Box display="flex" marginBottom={2} flexDirection="row" alignItems="center">
        <CakeIcon />
        <Box marginLeft={1} marginRight={2}>
          <TextField
            size="small"
            label={"Seed"}
            variant="outlined"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() => setSeed(Math.floor(Math.random() * 100000000).toString())}
                >
                  <Refresh />
                </IconButton>
              ),
            }}
          />
        </Box>
        <AspectRatioIcon />
        <Box marginLeft={1} marginRight={2}>
          <Select value={size} onChange={(e) => setSize(e.target.value as PaperSizes)}>
            <MenuItem value="Bristol9x12">Bristol: 9x12</MenuItem>
            <MenuItem value="Bristol11x17">Bristol: 11x17</MenuItem>
            <MenuItem value="A4">A4</MenuItem>
            <MenuItem value="A3">A3</MenuItem>
          </Select>
        </Box>
        <RotateRightIcon />
        <Box marginLeft={1} marginRight={2}>
          <Select value={orientation} onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}>
            <MenuItem value="landscape">Landscape</MenuItem>
            <MenuItem value="portrait">Portrait</MenuItem>
          </Select>
        </Box>
        <Box flexGrow={1}></Box>
        <Box>
          <IconButton
            color={settingsOpen ? "primary" : "default"}
            size="small"
            ref={settingsAnchorRef}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <SettingsIcon />
          </IconButton>
          <Popover
            anchorEl={settingsAnchorRef.current}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          >
            <Box minWidth={500} overflow="hidden">
              <ConfigEditor config={config} initial={initialConfig} onConfigUpdated={() => {}} />
            </Box>
          </Popover>
        </Box>
        <Box marginLeft={2}>
          <Button
            size="medium"
            startIcon={<ArrowDownload />}
            variant="contained"
            color="primary"
            onClick={() => {
              const blob = renderRef.current.serialize();
              FileSaver.saveAs(blob, defaultFileName || "Render.svg");
            }}
          >
            Download SVG
          </Button>
        </Box>
      </Box>
      <Box marginBottom={2}>
        <Divider />
      </Box>
      <RenderFrame
        {...props}
        size={size}
        orientation={orientation}
        ref={renderRef}
        seed={debouncedSeed}
        config={activeConfig}
      />
    </div>
  );
};
