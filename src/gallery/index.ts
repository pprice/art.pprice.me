import { Artwork } from "./types/d3";
import { RenderConfiguration } from "@/config";

type ArtworkExport<TConfig extends RenderConfiguration> = {
  default?: Artwork<TConfig>;
};

export function getArtworkRenderer<TConfig extends RenderConfiguration>(path: string[]): Artwork<TConfig> | undefined {
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

export function buildGalleryIndex() {
  return ["./math/arctorus", "./math/ellipsetorus", "./generative/lines"];
}
