import React, { useMemo } from "react";
import { getGalleryIndex } from "@/gallery";
import { Box, GridList, GridListTile, useMediaQuery, Link, Typography } from "@material-ui/core";
import theme from "@/components/Theme";

function Home() {
  const items = useMemo(() => getGalleryIndex().map((p) => ({ name: p, img: `/api/render/${p}`, url: `/a/${p}` })), []);
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Box>
      <Typography variant="h2">Gallery</Typography>
      <Box marginTop={2}>
        <GridList cellHeight={300} cols={isDesktop ? 3 : 1} spacing={10}>
          {items.map((p) => (
            <GridListTile key={p.name} color="white">
              <a href={p.url}>
                <Box display="flex" border={1} color="#EEEEEE" height={290} overflow="hidden">
                  <img src={p.img} width="100%" />
                </Box>
              </a>
            </GridListTile>
          ))}
        </GridList>
      </Box>
    </Box>
  );
}

export default Home;
