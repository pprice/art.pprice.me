import React, { useMemo } from "react";
import { getGalleryIndex } from "@/gallery";
import { Box, GridList, GridListTile, useMediaQuery } from "@material-ui/core";
import theme from "@/components/Theme";

function Home() {
  const items = useMemo(() => getGalleryIndex().map((p) => ({ name: p, img: `/api/render/${p}`, url: `/a/${p}` })), []);
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Box>
      <GridList cellHeight={300} cols={isDesktop ? 2 : 1}>
        {items.map((p) => (
          <GridListTile key={p.name} color="white">
            <a href={p.url}>
              <img src={p.img} />
            </a>
          </GridListTile>
        ))}
      </GridList>
    </Box>
  );
}

export default Home;
