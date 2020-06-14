import { Artwork } from "./types/d3";
import { RenderConfiguration } from "@/config";

// To ensure these are included in a bundle a dynamic require can't be used for static site hosting
// providers
import * as generative from "./generative";
import * as math from "./math";

type ArtworkExport<TConfig extends RenderConfiguration> = {
  default?: Artwork<TConfig>;
};

const index: Record<string, Artwork<any>> = buildLookupFromImports(generative, math);

export function getArtworkRenderer<TConfig extends RenderConfiguration>(path: string[]): Artwork<TConfig> | undefined {
  const knownPath = path.join("/");

  if (index[knownPath]) {
    return index[knownPath];
  }

  return loadLocalArtwork(path);
}

function loadLocalArtwork<TConfig extends RenderConfiguration>(path: string[]): Artwork<TConfig> | undefined {
  const normalized = ["."].concat(path.filter((i) => i !== "." && i !== "..")).join("/");

  try {
    const required = require(`${normalized}`) as ArtworkExport<TConfig> | undefined;
    return required?.default;
  } catch (e) {
    if (e instanceof Error) {
      if (new RegExp(normalized).test(e.message)) {
        return null;
      }
    }
    throw e;
  }
}

export function getGalleryIndex() {
  return Object.keys(index);
}

function buildLookupFromImports(...imports: any[]) {
  return imports
    .map((i) => Object.values(i))
    .reduce((acc, exports) => {
      if (!exports) {
        return acc;
      }

      for (let e of exports.map((e: any) => e.default).filter(Boolean)) {
        if (typeof e === "object" && e["path"] && typeof e["path"] === "string") {
          acc[e["path"]] = e as Artwork<any>;
        }
      }

      return acc;
    }, {} as Record<string, Artwork<any>>);
}
