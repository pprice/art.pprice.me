import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Popover,
  CircularProgress,
  GridList,
  GridListTile,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core";

import SearchIcon from "@material-ui/icons/Search";
import UploadIcon from "@material-ui/icons/Folder";

import { PropertyEditorComponent } from "./types";
import { ImageProperty } from "..";

import { useLazyAxios } from "use-axios-client";

type ImageSearchResponse = {
  thumbnailUrl: string;
  imageUrl: string;
  name: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchItem: {
      cursor: "pointer",
    },
  })
);

export const ImageEditor: PropertyEditorComponent<ImageProperty> = ({ propertyKey, property, initial, onUpdated }) => {
  type ImageSource = { disabled: boolean } & typeof property["predefined"][0];

  const classes = useStyles();

  const [value, setValue] = useState(initial);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [emptySearch, setEmptySearch] = useState(false);
  const [remoteSource, setRemoteSource] = useState<ImageSource | undefined>();

  const [searchValue, setSearchValue] = useState<string>("");
  const containerRef = useRef<any>();
  const textFieldRef = useRef<any>();

  const handleUpdate = useCallback(
    (newValue: string, remote: ImageSource = undefined) => {
      onUpdated(propertyKey, value, newValue);
      setValue(newValue);
      setRemoteSource(remote);
    },
    [propertyKey]
  );

  const setRemoteImageValue = (value: ImageSearchResponse) => {
    setImageSearchOpen(false);
    handleUpdate(value.imageUrl, { disabled: true, name: `Search: "${searchValue}"`, source: value.imageUrl });
  };

  const [getImageSearch, { data, error, loading }] = useLazyAxios<ImageSearchResponse[]>({
    url: "/api/search/images",
    method: "POST",
  });

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (searchValue) {
        setEmptySearch(false);
        getImageSearch({ q: searchValue });
      } else {
        setEmptySearch(true);
      }
    },
    [searchValue, getImageSearch]
  );

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Box display="flex" flexDirection="row">
        <Box flexGrow={1}>
          <Select
            fullWidth
            disabled={imageSearchOpen}
            value={initial}
            onChange={(e, v) => handleUpdate(e.target.value as string)}
          >
            {[...property.predefined, remoteSource].filter(Boolean).map((p: ImageSource) => (
              <MenuItem key={p.source} value={p.source} disabled={p.disabled}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <IconButton size="small" onClick={() => setImageSearchOpen((c) => !c)}>
          <SearchIcon />
        </IconButton>
        <IconButton size="small" disabled>
          <UploadIcon />
        </IconButton>
      </Box>
      <Popover
        id="search"
        open={imageSearchOpen}
        anchorEl={containerRef.current}
        onClose={() => setImageSearchOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box width={300} p={2}>
          <form onSubmit={handleSearchSubmit}>
            <Box display="flex" flexDirection="row">
              <TextField
                autoFocus
                fullWidth
                ref={textFieldRef}
                disabled={loading}
                placeholder="Enter search term, e.g. fjord..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <IconButton size="small" type="submit" formAction="submit" disabled={loading}>
                <SearchIcon />
              </IconButton>
            </Box>
          </form>
          <Box
            marginTop={!emptySearch && (data || error || loading) ? 2 : 0}
            display="flex"
            overflow="scroll-y"
            maxHeight={400}
          >
            {!loading && !emptySearch && data && data.length > 0 && (
              <GridList>
                {data.map((result) => (
                  <GridListTile
                    key={result.imageUrl}
                    className={classes.searchItem}
                    onClick={() => setRemoteImageValue(result)}
                  >
                    <img src={result.thumbnailUrl} />
                  </GridListTile>
                ))}
              </GridList>
            )}
            {!loading && data && data.length === 0 && <>No results found</>}
            {!loading && error && <>{error.message || "Error"}</>}
            {loading && (!error || !data) && <CircularProgress />}
          </Box>
        </Box>
      </Popover>
    </div>
  );
};
