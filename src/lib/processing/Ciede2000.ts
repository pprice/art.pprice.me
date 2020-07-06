import { HSL, hsl2Lab } from "./Color";

export function ciede2000(c1: HSL, c2: HSL): number {
  /**
   * Implemented as in "The CIEDE2000 Color-Difference Formula:
   * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
   * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
   */

  // Get L,a,b values for color 1
  const [L1, a1, b1] = hsl2Lab(c1);
  const [L2, a2, b2] = hsl2Lab(c2);

  // Weight factors
  const kL = 1;
  const kC = 1;
  const kH = 1;

  /**
   * Step 1: Calculate C1p, C2p, h1p, h2p
   */
  const C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2)); //(2)
  const C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2)); //(2)

  const a_C1_C2 = (C1 + C2) / 2.0; //(3)

  const G = 0.5 * (1 - Math.sqrt(Math.pow(a_C1_C2, 7.0) / (Math.pow(a_C1_C2, 7.0) + Math.pow(25.0, 7.0)))); //(4)

  const a1p = (1.0 + G) * a1; //(5)
  const a2p = (1.0 + G) * a2; //(5)

  const C1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2)); //(6)
  const C2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2)); //(6)

  const h1p = hp_f(b1, a1p); //(7)
  const h2p = hp_f(b2, a2p); //(7)

  /**
   * Step 2: Calculate dLp, dCp, dHp
   */
  const dLp = L2 - L1; //(8)
  const dCp = C2p - C1p; //(9)

  const dhp = dhp_f(C1, C2, h1p, h2p); //(10)
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(radians(dhp) / 2.0); //(11)

  /**
   * Step 3: Calculate CIEDE2000 Color-Difference
   */
  const a_L = (L1 + L2) / 2.0; //(12)
  const a_Cp = (C1p + C2p) / 2.0; //(13)

  const a_hp = a_hp_f(C1, C2, h1p, h2p); //(14)
  const T =
    1 -
    0.17 * Math.cos(radians(a_hp - 30)) +
    0.24 * Math.cos(radians(2 * a_hp)) +
    0.32 * Math.cos(radians(3 * a_hp + 6)) -
    0.2 * Math.cos(radians(4 * a_hp - 63)); //(15)
  const d_ro = 30 * Math.exp(-Math.pow((a_hp - 275) / 25, 2)); //(16)
  const RC = Math.sqrt(Math.pow(a_Cp, 7.0) / (Math.pow(a_Cp, 7.0) + Math.pow(25.0, 7.0))); //(17)
  const SL = 1 + (0.015 * Math.pow(a_L - 50, 2)) / Math.sqrt(20 + Math.pow(a_L - 50, 2.0)); //(18)
  const SC = 1 + 0.045 * a_Cp; //(19)
  const SH = 1 + 0.015 * a_Cp * T; //(20)
  const RT = -2 * RC * Math.sin(radians(2 * d_ro)); //(21)

  const dE = Math.sqrt(
    Math.pow(dLp / (SL * kL), 2) +
      Math.pow(dCp / (SC * kC), 2) +
      Math.pow(dHp / (SH * kH), 2) +
      RT * (dCp / (SC * kC)) * (dHp / (SH * kH))
  ); //(22)
  return dE;
}

function degrees(n: number) {
  return n * (180 / Math.PI);
}
function radians(n: number) {
  return n * (Math.PI / 180);
}

function hp_f(x: number, y: number) {
  //(7)
  if (x === 0 && y === 0) return 0;
  else {
    const tmphp = degrees(Math.atan2(x, y));
    if (tmphp >= 0) return tmphp;
    else return tmphp + 360;
  }
}

function dhp_f(C1: number, C2: number, h1p: number, h2p: number) {
  //(10)
  if (C1 * C2 === 0) return 0;
  else if (Math.abs(h2p - h1p) <= 180) return h2p - h1p;
  else if (h2p - h1p > 180) return h2p - h1p - 360;
  else if (h2p - h1p < -180) return h2p - h1p + 360;
  else throw new Error();
}

function a_hp_f(C1, C2, h1p, h2p) {
  //(14)
  if (C1 * C2 === 0) return h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) return (h1p + h2p) / 2.0;
  else if (Math.abs(h1p - h2p) > 180 && h1p + h2p < 360) return (h1p + h2p + 360) / 2.0;
  else if (Math.abs(h1p - h2p) > 180 && h1p + h2p >= 360) return (h1p + h2p - 360) / 2.0;
  else throw new Error();
}
