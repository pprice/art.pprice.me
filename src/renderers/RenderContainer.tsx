import React, { FunctionComponent, useRef, useState, useMemo, useEffect } from "react";
import FileSaver from "file-saver";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Switch,
  Zoom,
  Tooltip,
  useMediaQuery,
  Typography,
  Divider,
  CircularProgress,
} from "@material-ui/core";

import ArrowDownloadIcon from "@material-ui/icons/ArrowDownward";
import RefreshIcon from "@material-ui/icons/Refresh";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import SettingsIcon from "@material-ui/icons/Settings";
import ColorizeIcon from "@material-ui/icons/Colorize";
import InfoIcon from "@material-ui/icons/InfoOutlined";

import { RenderFrameProps, RenderRef } from "./props";
import { PaperSizes, BLEND_MODES, BlendMode } from "../const";

import { RenderFrame } from "./RenderFrame";
import { RenderConfiguration, getDefaultConfiguration, ConfigEditor } from "../config";
import { useDebounce } from "../hooks/UseDebounce";
import { PartialBy } from "@/utils";
import theme from "@/components/Theme";
import { SetupFunc } from "@/gallery/types/d3";

type PartialRenderFrameProps = "seed" | "orientation" | "size" | "blendMode" | "margin";

type RenderContainerProps = PartialBy<Omit<RenderFrameProps, "ref">, PartialRenderFrameProps> & {
  defaultFileName?: string;
  config?: RenderConfiguration;
  onSetup?: SetupFunc<any, any>;
  title?: string;
  description?: string;
  supportsRandom?: boolean;
};

export const RenderContainer: FunctionComponent<RenderContainerProps> = ({
  defaultFileName,
  seed: initialSeed,
  supportsRandom,
  orientation: initialOrientation,
  blendMode: initialBlendMode,
  size: initialSize,
  title,
  description,
  config,
  onSetup,
  ...props
}) => {
  const renderRef = useRef<RenderRef>();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [seed, setSeed] = useState(initialSeed || "");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    () => initialOrientation || (isDesktop ? "landscape" : "portrait")
  );
  const [blendMode, setBlendMode] = useState<BlendMode>(initialBlendMode || "multiply");

  const [size, setSize] = useState<PaperSizes>(initialSize || "Bristol9x12");

  const debouncedSeed = useDebounce(seed, 250);

  const initialConfig = useMemo(() => getDefaultConfiguration(config), [config]);
  const [activeConfig, setActiveConfig] = useState<any>();
  const [pendingConfig, setPendingConfig] = useState<any>(initialConfig);
  const [activeSetup, setActiveSetup] = useState<any>(undefined);
  const [inSetup, setInSetup] = useState(true);

  const onConfigUpdated = (updated) => {
    setPendingConfig(updated);
  };

  useEffect(() => {
    if (!pendingConfig) {
      return;
    } else if (!onSetup) {
      setInSetup(false);
      setActiveConfig(pendingConfig);
      return;
    }

    const setupProducer = onSetup(pendingConfig, activeSetup);

    if (!setupProducer) {
      setActiveConfig(pendingConfig);
      return;
    }

    setInSetup(true);

    setTimeout(() => {
      setupProducer(() => {})
        .then((res) => setActiveSetup(res))
        .finally(() => {
          setInSetup(false);

          if (pendingConfig !== activeConfig) {
            setActiveConfig(pendingConfig);
          }
        });
    }, 200);
  }, [onSetup, pendingConfig]);

  const configPanelVisible = useMemo(() => activeConfig != undefined && configPanelOpen, [
    activeConfig,
    configPanelOpen,
  ]);

  const generateSeed = () =>
    setSeed(
      Math.floor(Math.random() * 100000000000)
        .toString(16)
        .toUpperCase()
    );

  if (!activeConfig || (onSetup && !activeSetup)) {
    return (
      <Box display="flex" alignItems="center" flexDirection="column">
        <CircularProgress />
        <Typography variant="h5">Setting up...</Typography>
      </Box>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <Box display="flex" marginBottom={2} flexDirection="row" alignItems="center" flexWrap="wrap">
        <Box marginRight={2} alignItems="center" display="flex">
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Box marginLeft={1} alignItems="center" marginBottom={-0.5}>
              <Tooltip title={<Typography>{description}</Typography>}>
                <InfoIcon opacity={0.7} />
              </Tooltip>
            </Box>
          )}
        </Box>

        {activeConfig && (
          <Box marginLeft="auto" alignItems="center" display="flex">
            <SettingsIcon />
            <Switch size="small" value={configPanelOpen} onChange={(e, checked) => setConfigPanelOpen(checked)} />
          </Box>
        )}
      </Box>
      <Box display="flex" flexDirection={isDesktop ? "row" : "column"}>
        <Box flexGrow={1}>
          <RenderFrame
            {...props}
            size={size}
            orientation={orientation}
            ref={renderRef}
            seed={debouncedSeed}
            blendMode={blendMode}
            setupResult={activeSetup}
            config={activeConfig}
          />
        </Box>

        <Box>
          <Zoom in={configPanelOpen}>
            <Box marginTop={!isDesktop ? 2 : 0}>
              {configPanelVisible && (
                <Box width={isDesktop ? 350 : "100%"}>
                  {supportsRandom && (
                    <Box marginLeft={isDesktop ? 2 : 0} marginBottom={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label={"Seed"}
                        variant="outlined"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <IconButton size="small" edge="end" onClick={generateSeed}>
                              <RefreshIcon />
                            </IconButton>
                          ),
                        }}
                      />
                    </Box>
                  )}
                  <Box marginLeft={isDesktop ? 2 : 0} alignItems="center" display="flex" marginBottom={1}>
                    <Box marginRight={1} alignItems="center" display="flex">
                      <Tooltip title="Dimensions">
                        <AspectRatioIcon />
                      </Tooltip>
                    </Box>
                    <Select fullWidth value={size} onChange={(e) => setSize(e.target.value as PaperSizes)}>
                      <MenuItem value="Bristol9x12">Bristol: 9x12</MenuItem>
                      <MenuItem value="Bristol11x17">Bristol: 11x17</MenuItem>
                      <MenuItem value="A4">A4</MenuItem>
                      <MenuItem value="A3">A3</MenuItem>
                    </Select>
                  </Box>

                  <Box marginLeft={isDesktop && 2} alignItems="center" display="flex" marginBottom={1}>
                    <Box marginRight={1} alignItems="center" display="flex">
                      <Tooltip title="Orientation">
                        <RotateRightIcon />
                      </Tooltip>
                    </Box>
                    <Select
                      fullWidth
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}
                    >
                      <MenuItem value="landscape">Landscape</MenuItem>
                      <MenuItem value="portrait">Portrait</MenuItem>
                    </Select>
                  </Box>

                  <Box marginLeft={isDesktop ? 2 : 0} alignItems="center" display="flex" marginBottom={1}>
                    <Box marginRight={1} alignItems="center" display="flex">
                      <Tooltip title="Blend Mode">
                        <ColorizeIcon />
                      </Tooltip>
                    </Box>
                    <Select fullWidth value={blendMode} onChange={(e) => setBlendMode(e.target.value as BlendMode)}>
                      {BLEND_MODES.map((mode) => (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Box marginBottom={2} />
                  <Box marginLeft={isDesktop ? 2 : 0}>
                    <Divider />
                  </Box>
                  <ConfigEditor config={config} activeConfig={activeConfig} onConfigUpdated={onConfigUpdated} />
                  <Box marginLeft={isDesktop ? 2 : 0} marginTop={1}>
                    <Divider />
                  </Box>
                  <Box display="flex" flexDirection="row" justifyContent="flex-end" marginTop={2} alignItems="center">
                    <Box marginRight={1}>
                      <Typography>Download</Typography>
                    </Box>
                    <Box marginRight={1}>
                      <Button
                        size="medium"
                        startIcon={<ArrowDownloadIcon />}
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          const blob = renderRef.current.serialize();
                          FileSaver.saveAs(blob, defaultFileName || "Render.svg");
                        }}
                      >
                        SVG
                      </Button>
                    </Box>
                    <Button size="medium" startIcon={<ArrowDownloadIcon />} variant="outlined" color="primary" disabled>
                      PNG
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Zoom>
        </Box>
      </Box>
    </div>
  );
};
