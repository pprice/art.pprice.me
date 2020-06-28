import { Artwork } from "@/gallery/types/d3";
import { RenderConfiguration, getDefaultConfiguration } from "@/config";
import React from "react";
import { D3RenderFrame } from "@/renderers";
import { JSDOM } from "jsdom";
import ReactDOMServer from "react-dom/server";
import { NextApiRequest } from "next";

export async function renderArtworkToSvg<TConfig extends RenderConfiguration, TSetup extends object>(
  artwork: Artwork<TConfig, TSetup>,
  baseUrl?: string
): Promise<string | undefined> {
  if (artwork.type !== "d3") {
    return undefined;
  }

  const config = getDefaultConfiguration(artwork.config);
  let setupContext: unknown = undefined;

  if (artwork.setup) {
    const context = baseUrl ? { baseUrl } : undefined;
    const setupFunc = artwork.setup(config, undefined, context);
    if (setupFunc) {
      setupContext = await setupFunc(() => {});
    }
  }

  const renderProps = {
    onRender: artwork.render,
    config,
    setupResult: setupContext,
    seed: "",
    blendMode: "multiply",
    size: "Bristol9x12" as const,
    type: "d3" as const,
    ...artwork.initialProps,
    orientation: "landscape" as const,
    svgDom: undefined,
  };

  const createElement = (props) => React.createElement(D3RenderFrame, props, null);

  const firstPassContent = ReactDOMServer.renderToStaticMarkup(createElement({ ...renderProps }));
  const dom = new JSDOM(firstPassContent);
  const svg = dom.window.document.querySelector("svg");

  ReactDOMServer.renderToStaticMarkup(createElement({ ...renderProps, svgDom: svg }));

  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  return svg.outerHTML;
}
