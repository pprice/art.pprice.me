import { NextApiRequest, NextApiResponse } from "next";
import { ImageSearchClient } from "@azure/cognitiveservices-imagesearch";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { ImagesSearchResponse } from "@azure/cognitiveservices-imagesearch/esm/models";

import * as jwt from "jsonwebtoken";

const API_KEY = process.env.COGNITIVE_SEARCH_API_KEY;
const ENDPOINT = process.env.COGNITIVE_SEARCH_ENDPOINT;

const credentials = new CognitiveServicesCredentials(API_KEY || "<NONE>");
const imageSearchClient = new ImageSearchClient(credentials, {
  endpoint: `${ENDPOINT}/bing/v7.0/images/search`,
});

const EXPIRATION_SECONDS = 60 * 60 * 12;

function corsBustEncode(url: string): string {
  const signed = jwt.sign({ resource: url }, process.env.CORS_BUST_SECRET, {
    algorithm: "HS256",
    expiresIn: EXPIRATION_SECONDS,
  });
  return `/api/search/get-image?r=${signed}`;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query["q"] || (req.body?.q as string);

  if (!query) {
    return res.status(400).json({ error: "Bad request" });
  }

  const term = Array.isArray(query) ? query[0] : query;

  let result: ImagesSearchResponse = undefined;

  try {
    result = await imageSearchClient.images.search(term, {
      count: 20,
      safeSearch: "Moderate",
    });
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({ error: e.message || "Unknown", source: "image-search" });
    }

    throw e;
  }

  const response = result.value.map((v) => ({
    thumbnailUrl: v.thumbnailUrl,
    // HACK HACK: As we need to draw these images on to canvas instances we need to make sure CORS
    // is adhered to, which means the client side Image instance seems a cross origin policy set
    // AND the responding image url needs to have valid cors headers. There is no way to filter
    // cognitive api search results for "cors-valid" results, so we setup a small proxy. To ensure
    // this is not open to (too much) abuse, we generated a signed resource for the content url
    // that points back to us and expires quickly. In the `get-image` handler, we validate this token
    // and stream the response back to clients. Not ideal, but a better user experience.
    imageUrl: corsBustEncode(v.contentUrl),
    name: v.name || v.alternateName,
  }));
  return res.json(response);
};
