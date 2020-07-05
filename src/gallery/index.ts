import { Artwork, SetupResult } from "./types/d3";
import { RenderConfiguration } from "@/config";

// To ensure these are included in a bundle a dynamic require can't be used for static site hosting
// providers
import * as generative from "./generative";
import * as math from "./math";
import * as processing from "./processing";

type ArtworkExport<TConfig extends RenderConfiguration, TSetup extends SetupResult> = {
  default?: Artwork<TConfig, TSetup>;
};

const index: Record<string, Artwork<RenderConfiguration, SetupResult>> = buildLookupFromImports(
  generative,
  math,
  processing
);

export function getArtworkRenderer<TConfig extends RenderConfiguration, TSetup extends SetupResult>(
  path: string[]
): Artwork<TConfig, TSetup> | undefined {
  const knownPath = path.join("/");

  if (index[knownPath]) {
    return index[knownPath] as Artwork<TConfig, TSetup>;
  }

  return loadLocalArtwork<TConfig, TSetup>(path);
}

function loadLocalArtwork<TConfig extends RenderConfiguration, TSetup extends SetupResult>(
  path: string[]
): Artwork<TConfig, TSetup> | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  const normalized = ["."].concat(path.filter((i) => i !== "." && i !== "..")).join("/");

  try {
    console.warn(`Attempting local resolve of ${path.join(`/`)}`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const required = require(`${normalized}`) as ArtworkExport<TConfig, TSetup> | undefined;

    if (!required?.default) {
      console.error(`Found match for ${path.join(`/`)} but it has no default export`);
      return undefined;
    }

    console.warn(`Found match for ${path.join(`/`)}`);
    return required?.default;
  } catch (e) {
    console.warn(`Resolve failed for ${path.join(`/`)}`);
    console.warn(e);
    if (e instanceof Error) {
      if (new RegExp(normalized).test(e.message)) {
        return undefined;
      }
    }
    throw e;
  }
}

export function getGalleryIndex() {
  return Object.keys(index);
}

type Export = Record<string, { default?: unknown }>;

function buildLookupFromImports(...imports: Export[]) {
  return imports
    .map((i) => Object.values(i))
    .reduce((acc, exports) => {
      if (!exports) {
        return acc;
      }

      for (const e of exports.map((e) => e.default).filter(Boolean)) {
        if (typeof e === "object" && e["path"] && typeof e["path"] === "string") {
          acc[e["path"]] = e as Artwork<RenderConfiguration, SetupResult>;
        }
      }

      return acc;
    }, {} as Record<string, Artwork<RenderConfiguration, SetupResult>>);
}
