import * as xml from "isomorphic-xml2js";

type HersheyFont =
  | "EMSAllure"
  | "EMSElfin"
  | "EMSFelix"
  | "EMSNixish"
  | "EMSNixishItalic"
  | "EMSOsmotron"
  | "EMSReadability"
  | "EMSReadabilityItalic"
  | "EMSTech"
  | "HersheyGothEnglish"
  | "HersheySans1"
  | "HersheySansMed"
  | "HersheyScript1"
  | "HersheyScriptMed"
  | "HersheySerifBold"
  | "HersheySerifBoldItalic"
  | "HersheySerifMed"
  | "HersheySerifMedItalic";

export type HersheyOptions = {
  font?: HersheyFont;
  svg?: string;
};

export class Hershey {
  private parsedFontPromise: Promise<unknown>;

  constructor(options: HersheyOptions) {
    let svgContent: string = options.svg;

    if (options.font) {
      svgContent = require(`./svg-fonts/${options.font}.svg`);
      if (!svgContent) {
        throw new Error(`Failed to load "${options.font}"`);
      }
    }

    if (svgContent == null) {
      throw new Error(`Must specify either "font" or "svg" options`);
    }

    this.parsedFontPromise = this.parse(svgContent);
  }

  public async drawText(): Promise<string> {
    return "";
  }

  private async parse(svgContent: string): Promise<unknown> {
    const parsed = new xml.Parser().parseStringPromise(svgContent);
    return parsed;
  }
}
