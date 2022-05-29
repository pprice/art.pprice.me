import { BLEND_MODES, BlendMode, PaperSizes, Sizes } from "@/lib/const";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  useMediaQuery,
} from "@material-ui/core";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { RenderConfiguration, RuntimeRenderConfiguration, getDefaultConfiguration } from "@/lib/config";
import { RenderFrameProps, RenderRef } from "./props";
import { SetupFunc, SetupResult } from "@/lib/artwork";

import ArrowDownloadIcon from "@material-ui/icons/ArrowDownward";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import ColorizeIcon from "@material-ui/icons/Colorize";
import { ConfigEditor } from "../ConfigEditor";
import FileSaver from "file-saver";
import { PartialBy } from "@/lib/utils";
import RefreshIcon from "@material-ui/icons/Refresh";
import { RenderFrame } from "./RenderFrame";
import { RenderHeader } from "./RenderHeader";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import { Skeleton } from "@material-ui/lab";
import theme from "../Theme";
import { useDebounce } from "@/hooks/UseDebounce";

type PartialRenderFrameProps = "seed" | "orientation" | "size" | "blendMode" | "margin";

type RenderContainerProps = PartialBy<Omit<RenderFrameProps, "ref" | "config">, PartialRenderFrameProps> & {
  defaultFileName?: string;
  config?: RenderConfiguration;
  onSetup?: SetupFunc;
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
  const skeletonContainerRef = useRef<HTMLDivElement>();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  const [configPanelOpen, setConfigPanelOpen] = useState(true);
  const [seed, setSeed] = useState(initialSeed || "");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    () => initialOrientation || (isDesktop ? "landscape" : "portrait")
  );
  const [blendMode, setBlendMode] = useState<BlendMode>(initialBlendMode || "multiply");

  const [size, setSize] = useState<PaperSizes>(initialSize || "Bristol9x12");

  const debouncedSeed = useDebounce(seed, 250);

  const initialConfig = useMemo(() => getDefaultConfiguration(config), [config]);
  const [activeSetupAndConfig, setActiveSetupAndConfig] = useState<
    { config: RuntimeRenderConfiguration; setup?: SetupResult } | undefined
  >(undefined);

  const [pendingConfig, setPendingConfig] = useState<RuntimeRenderConfiguration>(initialConfig);
  const [setupError, setSetupError] = useState<Error | undefined>(undefined);

  const onConfigUpdated = (updated) => {
    setPendingConfig(updated);
  };

  useEffect(() => {
    if (!pendingConfig) {
      return;
    } else if (!onSetup) {
      setActiveSetupAndConfig({ config: pendingConfig });
      return;
    }

    const setupProducer = onSetup(pendingConfig, activeSetupAndConfig?.setup);

    if (!setupProducer) {
      setActiveSetupAndConfig({ config: pendingConfig, setup: activeSetupAndConfig?.setup });
      return;
    }

    // NOTE: It is important that the update to setup and config is atomic as there
    // is a dependency between the two in most cases
    const handle = setTimeout(() => {
      setupProducer(() => {
        /* TODO*/
      })
        .then((res) => {
          setActiveSetupAndConfig({ config: pendingConfig, setup: res });
        })
        .catch((e) => {
          console.error(e);
          setSetupError(e);
          setActiveSetupAndConfig({ config: pendingConfig });
        });
    }, 200);

    return () => clearTimeout(handle);
  }, [onSetup, pendingConfig]);

  const configPanelVisible = useMemo(
    () => activeSetupAndConfig != undefined && configPanelOpen,
    [activeSetupAndConfig, configPanelOpen]
  );

  const generateSeed = () =>
    setSeed(
      Math.floor(Math.random() * 100000000000)
        .toString(16)
        .toUpperCase()
    );

  const skeletonWidthHeight = useMemo(() => {
    if (!skeletonContainerRef.current || !skeletonContainerRef.current.offsetWidth) {
      return { width: "100%", height: 200 };
    }

    const ratio = Sizes[size]()[orientation].widthToHeightRatio;

    console.dir(ratio);

    return {
      width: skeletonContainerRef.current.offsetWidth,
      height: skeletonContainerRef.current.offsetWidth * ratio,
    };
  }, [size, orientation, skeletonContainerRef.current]);

  if (!activeSetupAndConfig || (onSetup && !activeSetupAndConfig?.setup)) {
    return (
      <div ref={skeletonContainerRef} style={{ width: "100%" }}>
        <RenderHeader title={title} description={description} hasSettings={false} />
        <Box display="flex" alignItems="center" flexDirection="column">
          {!setupError && (
            <>
              <Box display="flex" alignItems="center" flexDirection="column" marginTop={6}>
                <Typography variant="h2">Setting up...</Typography>
                <Box marginTop={4}>
                  <CircularProgress color="secondary" />
                </Box>
              </Box>
              <Box display="flex" position="absolute">
                <Skeleton variant="rect" width={skeletonWidthHeight.width} height={skeletonWidthHeight.height} />
              </Box>
            </>
          )}
          {setupError && (
            <>
              <Typography variant="h5">Oops!</Typography>
              <Typography>{setupError.message || setupError.message || "Something went wrong"}</Typography>
              <Box marginTop={2}>
                <Button variant="contained" onClick={() => window.location.reload()}>
                  Reload
                </Button>
              </Box>
            </>
          )}
        </Box>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <RenderHeader
        title={title}
        description={description}
        hasSettings={!!activeSetupAndConfig?.config}
        onToggleSettings={(v) => setConfigPanelOpen(v)}
      />
      <Box display="flex" flexDirection={isDesktop ? "row" : "column"}>
        <Box flexGrow={1} border={1} borderColor="#EEEEEE" bgcolor="white">
          <RenderFrame
            {...props}
            size={size}
            orientation={orientation}
            ref={renderRef}
            seed={debouncedSeed}
            blendMode={blendMode}
            setupResult={activeSetupAndConfig?.setup}
            config={activeSetupAndConfig?.config}
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
                  <ConfigEditor
                    config={config}
                    activeConfig={activeSetupAndConfig?.config}
                    onConfigUpdated={onConfigUpdated}
                  />
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
