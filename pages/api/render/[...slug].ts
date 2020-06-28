import { NextApiRequest, NextApiResponse } from "next";
import { getArtworkRenderer } from "@/gallery";
import { renderArtworkToSvg } from "src/ssr/renderArtwork";

const CACHE_SECONDS = process.env.NODE_ENV === "development" ? 120 : 60 * 60 * 24;
const RESPONSE_CACHE = new Map<string, { svg: string; date: number }>();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const slug: string[] = req.query.slug as string[];

  const notFound = () => res.status(404).json({ error: "Not Found " });

  if (!slug || slug.length === 0) {
    return notFound();
  }

  const key = slug.join("/");
  const now = new Date().valueOf();
  const current = RESPONSE_CACHE.get(key);
  let svg: string = current?.svg;

  if (!svg || (now - current.date) / 1000 > CACHE_SECONDS) {
    const artwork = getArtworkRenderer(slug);
    if (!artwork) {
      return notFound();
    }

    // HACK HACK: Figure out how to load public images
    const baseUrl =
      process.env.NODE_ENV === "production" ? `https://${req.headers.host}` : `http://${req.headers.host}`;

    svg = await renderArtworkToSvg(artwork, baseUrl);

    if (!svg) {
      return notFound();
    }

    RESPONSE_CACHE.set(key, { svg, date: now });
  }

  if (CACHE_SECONDS > 0) {
    res.setHeader("Cache-Control", `s-maxage=${CACHE_SECONDS}, stale-while-revalidate`);
  }
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
};
