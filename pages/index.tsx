import React, { useMemo } from "react";
import { getGalleryIndex } from "@/gallery";
import { Box, GridList, GridListTile, useMediaQuery, Typography } from "@material-ui/core";
import theme from "@/components/Theme";
import Link from "next/link";

function Home() {
  const items = useMemo(
    () =>
      getGalleryIndex()
        .map((p) => ({ name: p, img: `/generated/${p}.png`, url: `/a/${p}` }))
        .reverse(),
    []
  );
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Box>
      <Typography variant="h2">Gallery</Typography>
      <Box marginTop={2}>
        <GridList cellHeight={300} cols={isDesktop ? 3 : 1} spacing={10}>
          {items.map((p) => (
            <GridListTile key={p.name} color="white">
              <Link href={p.url} prefetch={false}>
                <Box
                  display="flex"
                  border={1}
                  color="#EEEEEE"
                  height={290}
                  overflow="hidden"
                  style={{
                    cursor: "pointer",
                    backgroundImage: `url(${p.img})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                ></Box>
              </Link>
            </GridListTile>
          ))}
        </GridList>
      </Box>
    </Box>
  );
}

export default Home;
