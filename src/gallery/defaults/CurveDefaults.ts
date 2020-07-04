import { Choice } from "@/config";
import { CurveBase, CurveOpen, CurveClosed, Curve } from "@/geom/curve";

function makeChoice<T extends string>(value: T, label?: string): Choice<T> {
  return {
    value,
    label,
  };
}

function sortChoice<T extends string>(a: Choice<T>, b: Choice<T>): number {
  return (a.label || a.value).localeCompare(b.label || b.value);
}

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
