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
