export function toRadians(degrees: number) {
  return (Math.PI / 180) * degrees;
}

export function scale(value: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
  return minOut + (maxOut - maxIn) * ((value - minIn) / (minOut - minIn));
}
