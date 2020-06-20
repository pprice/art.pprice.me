import React, { FunctionComponent, useMemo } from "react";
import { useRouter } from "next/router";
import Error from "next/error";

import { getArtworkRenderer } from "@/gallery";
import { RenderContainer } from "@/renderers";
import Head from "next/head";

// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: getGalleryIndex().map((p) => ({ params: { slug: p.split("/") } })),
//     fallback: true,
//   };
// };

const ArtworkPage: FunctionComponent = () => {
  const router = useRouter();
  const { slug } = router.query;
  const typedSlug: string[] = Array.isArray(slug) ? slug : [slug];

  const match = useMemo(() => slug && getArtworkRenderer(typedSlug), [slug]);

  if (!match) {
    return (
      <Error statusCode={404}>
        <h1>{slug}</h1>
      </Error>
    );
  }

  return (
    <>
      <Head>
        <title>art.pprice.me - {typedSlug.join("/")}</title>
      </Head>
      <RenderContainer
        title={typedSlug.join(" / ")}
        type={match.type}
        config={match.config}
        onRender={match.render}
        onSetup={match.setup}
        description={match.description}
        supportsRandom={match.supportsRandom}
        attribution={match.attribution || `${typedSlug.join(" / ")} / [SEED] / [DATE]`}
        {...match.initialProps}
      />
    </>
  );
};

export default ArtworkPage;
