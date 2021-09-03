import { Box, ImageList, ImageListItem, Typography, useMediaQuery } from "@material-ui/core";
import React, { useMemo } from "react";

import Link from "next/link";
import { getGalleryIndex } from "@/gallery";
import theme from "@/components/Theme";

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
        <ImageList rowHeight={300} cols={isDesktop ? 3 : 1} gap={10}>
          {items.map((p) => (
            <ImageListItem key={p.name} color="white">
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
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    </Box>
  );
}

export default Home;
