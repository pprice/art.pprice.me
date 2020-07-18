import React, { FunctionComponent, useMemo } from "react";
import { useRouter } from "next/router";
import Error from "next/error";

import { getArtworkRenderer, getGalleryIndex } from "@/gallery";
import { RenderContainer } from "@/components/renderers";
import Head from "next/head";
import { ErrorComponent } from "pages/_error";

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
  const isInIndex = useMemo(() => (slug ? getGalleryIndex().includes(typedSlug.join("/")) : undefined), [slug]);

  if (isInIndex === false) {
    return <ErrorComponent statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>art.pprice.me - {typedSlug.join("/")}</title>
      </Head>
      {match && (
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
      )}
    </>
  );
};

export default ArtworkPage;
