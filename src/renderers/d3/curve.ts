import { Curve } from "@/geom/curve";
import * as d3 from "d3";

export function getCurveFactory(curve: Omit<Curve, "bundle">): d3.CurveFactory;
export function getCurveFactory(curve: "bundle"): d3.CurveFactoryLineOnly;
export function getCurveFactory(curve: Curve): d3.CurveFactory | d3.CurveFactoryLineOnly {
  switch (curve) {
    case "basis":
      return d3.curveBasis;
    case "bundle":
      return d3.curveBundle;
    case "cardinal":
      return d3.curveCardinal;
    case "catmullRom":
      return d3.curveCatmullRom;
    case "linear":
      return d3.curveLinear;
    case "monotoneX":
      return d3.curveMonotoneX;
    case "monotoneY":
      return d3.curveMonotoneY;
    case "natural":
      return d3.curveNatural;
    case "step":
      return d3.curveStep;
    case "stepAfter":
      return d3.curveStepAfter;
    case "stepBefore":
      return d3.curveStepBefore;
    case "basisOpen":
      return d3.curveBasisOpen;
    case "cardinalOpen":
      return d3.curveBasisClosed;
    case "catmullRomClosed":
      return d3.curveCatmullRomClosed;
    case "basisClosed":
      return d3.curveBasisClosed;
    case "cardinalClosed":
      return d3.curveCardinalClosed;
    case "catmullRomClosed":
      return d3.curveCatmullRomClosed;
    case "linearClosed":
      return d3.curveLinearClosed;
  }
}
