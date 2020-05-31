import lines from "./lines";
import { Artwork } from "../types/d3";

export function getArtworkRenderer(name: string): Artwork<any> | undefined {
  switch (name) {
    case "lines":
      return lines;
  }

  return undefined;
}
