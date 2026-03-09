import { Color } from "three";

export const COLORS = {
  background: new Color("#0011FF"),
  stone: new Color("#888899"), // Desaturated warm grey
  highlight: new Color("#FFFFFF"),
};

export const CONFIG = {
  gridSize: 6,
  cubeSize: 0.9, // Leaving gaps
  quantizeSteps: 4, // 90 degree snaps (4 steps in 360?? No, likely implies multiplier)
  // Logic: round(noise * steps) / steps * PI2
  animationSpeed: 3.5,
  noiseScale: 0.15,
};
