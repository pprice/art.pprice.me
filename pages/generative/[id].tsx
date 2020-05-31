import React, { FunctionComponent } from "react";
import { useRouter } from "next/router";
import Error from "next/error";

import { getArtworkRenderer } from "@/gallery/generative";
import { RenderContainer } from "@/renderers";

const GenerativePage: FunctionComponent = () => {
  const router = useRouter();
  const { id } = router.query;

  const match = getArtworkRenderer(id as string);

  if (!match) {
    return <Error statusCode={404} />;
  }

  const attribution = match.attribution || `${id} / [SEED] / [DATE]`;
  const margin = 1;

  return (
    <RenderContainer
      type="d3"
      config={match.config}
      onRender={match.render}
      margin={margin}
      attribution={attribution}
    />
  );
};

export default GenerativePage;
