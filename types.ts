export interface CubeData {
  id: number;
  x: number;
  y: number;
  z: number;
  atlasIndex: number;
  rotationPhase: number;
}

export interface NoiseGenerator {
  noise3D: (x: number, y: number, z: number) => number;
  noise4D: (x: number, y: number, z: number, w: number) => number;
}
