import { Choice } from "@/config";
import * as d3 from "d3";

function makeChoice<T extends string>(value: T, label?: string): Choice<T> {
  return {
    value,
    label,
  };
}

function sortChoice<T extends string>(a: Choice<T>, b: Choice<T>): number {
  return (a.label || a.value).localeCompare(b.label || b.value);
}

export type CurveBase =
  | "basis"
  | "bundle"
  | "cardinal"
  | "catmullRom"
  | "linear"
  | "monotoneX"
  | "monotoneY"
  | "natural"
  | "step"
  | "stepAfter"
  | "stepBefore";

export type CurveOpen = "basisOpen" | "cardinalOpen" | "catmullRomOpen";

export type CurveClosed = "basisClosed" | "cardinalClosed" | "catmullRomClosed" | "linearClosed";

export type Curve = CurveBase | CurveOpen | CurveClosed;

export const CURVE_BASE_TYPE_CHOICES: Choice<CurveBase>[] = [
  makeChoice("basis", "Basis"),
  makeChoice("bundle", "Bundle"),
  makeChoice("cardinal", "Cardinal"),
  makeChoice("catmullRom", "Catmull-Rom"),
  makeChoice("linear", "Linear"),
  makeChoice("monotoneX", "Monotone (X)"),
  makeChoice("monotoneY", "Monotone (Y)"),
  makeChoice("natural", "Natural"),
  makeChoice("step", "Step"),
  makeChoice("stepAfter", "Step (After)"),
  makeChoice("stepBefore", "Step (Before)"),
].sort(sortChoice);

export const CURVE_OPEN_TYPE_CHOICES: Choice<CurveOpen>[] = [
  makeChoice("basisOpen", "Basis (Open)"),
  makeChoice("cardinalOpen", "Cardinal (Open)"),
  makeChoice("catmullRomOpen", "Catmull-Rom (Open)"),
].sort(sortChoice);

export const CURVE_CLOSED_TYPE_CHOICES: Choice<CurveClosed>[] = [
  makeChoice("basisClosed", "Basis (Closed)"),
  makeChoice("cardinalClosed", "Cardinal (Closed)"),
  makeChoice("catmullRomClosed", "Catmull-Rom (Closed)"),
  makeChoice("linearClosed", "Linear (Closed)"),
].sort(sortChoice);

export const ALL_CURVE_CHOICES: Choice<Curve>[] = [
  ...CURVE_BASE_TYPE_CHOICES,
  ...CURVE_OPEN_TYPE_CHOICES,
  ...CURVE_CLOSED_TYPE_CHOICES,
].sort(sortChoice);

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
