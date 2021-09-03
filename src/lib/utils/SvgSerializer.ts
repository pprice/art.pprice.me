import { CanvasSize } from "../const/PaperSizes";

export function svgSerializer(chart: HTMLElement, pageCanvas: CanvasSize) {
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  const inkscapeNs = "http://www.inkscape.org/namespaces/inkscape";

  // TODO: Hack
  const inkscapeAttributes = new Set(["inkscape-label", "inkscape-groupmode"]);

  const svg = chart.cloneNode(true) as HTMLElement;

  // XML name-spacing, note the inkscape namespace used for layer support
  svg.setAttributeNS(xmlns, "xmlns", svgns);
  svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
  svg.setAttributeNS(xmlns, "xmlns:inkscape", inkscapeNs);

  // At draw time we treat this as "100% of container", to export we need to serialize back into software understandable coordinates.
  svg.setAttribute("width", `${pageCanvas.millimeters[0]}mm`);
  svg.setAttribute("height", `${pageCanvas.millimeters[1]}mm`);

  const fragment = window.location.href + "#";
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null);
  while (walker.nextNode()) {
    const currentNode = walker.currentNode as HTMLElement;

    const callbacks: (() => void)[] = [];

    for (const attr of currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, "#");
      }

      // NOTE: React doesn't support namespaced attributes on svgs, we workaround this by using
      // namespace-attrib properties that are decoded and set correctly during serialization
      if (inkscapeAttributes.has(attr.name)) {
        const [, name] = attr.name.split("-");

        // We can't modify inplace or enumeration stops, save modifications in array and process after
        // we are done with all attributes
        callbacks.push(() => {
          currentNode.setAttributeNS(inkscapeNs, name, attr.value);
          currentNode.removeAttribute(attr.name);
        });
      }
    }

    callbacks.forEach((c) => c());
  }

  const serializer = new window.XMLSerializer();
  const string = serializer.serializeToString(svg);
  return new Blob([string], { type: "image/svg+xml" });
}
