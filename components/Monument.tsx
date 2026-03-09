import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SimplexNoise } from '../utils/noise';
import { CONFIG } from '../constants';
import { generateAtlasTexture, generateNormalMap } from './TextureGen';
import { CubeData } from '../types';

const tempObject = new THREE.Object3D();

// Custom Shader Injection for Texture Atlas
const injectAtlasShader = (shader: THREE.Shader) => {
  shader.vertexShader = `
    attribute float aAtlasIndex;
    varying float vAtlasIndex;
    ${shader.vertexShader}
  `.replace(
    '#include <uv_vertex>',
    `
    #include <uv_vertex>
    vAtlasIndex = aAtlasIndex;
    `
  );

  shader.fragmentShader = `
    varying float vAtlasIndex;
    ${shader.fragmentShader}
  `.replace(
    '#include <map_fragment>',
    `
    #ifdef USE_MAP
      // Calculate atlas offset
      // Assuming 10 columns, 1 row
      float cols = 10.0;
      float uvX = (vMapUv.x / cols) + (vAtlasIndex / cols);
      vec2 atlasUv = vec2(uvX, vMapUv.y);
      vec4 sampledDiffuseColor = texture2D( map, atlasUv );
      diffuseColor *= sampledDiffuseColor;
    #endif
    `
  );
};

export const Monument: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const noise = useMemo(() => new SimplexNoise(42), []);

  // Generate Data Structure
  const { data, count } = useMemo(() => {
    const cubes: CubeData[] = [];
    let id = 0;
    
    // Create a "Totem" / "Floating Monolith" structure
    for (let x = -2; x <= 2; x++) {
      for (let y = -4; y <= 4; y++) {
        for (let z = -2; z <= 2; z++) {
          // Shape logic: Perlin noise cutoff to make it look carved
          const shapeNoise = noise.noise3D(x * 0.3, y * 0.1, z * 0.3);
          if (shapeNoise > 0.1) {
             cubes.push({
               id: id++,
               x: x * CONFIG.cubeSize,
               y: y * CONFIG.cubeSize,
               z: z * CONFIG.cubeSize,
               atlasIndex: Math.floor(Math.random() * 10),
               rotationPhase: Math.random() * 100, // Random phase for animation
             });
          }
        }
      }
    }
    return { data: cubes, count: cubes.length };
  }, [noise]);

  // Current animation states (stored outside React state for perf)
  const animationState = useMemo(() => {
    return data.map(() => ({
      currentRotationY: 0,
    }));
  }, [data]);

  // Textures
  const atlasTexture = useMemo(() => generateAtlasTexture(), []);
  const normalMap = useMemo(() => generateNormalMap(), []);

  // Setup Instance Attributes
  useEffect(() => {
    if (!meshRef.current) return;
    
    const atlasIndices = new Float32Array(count);
    
    // Set initial positions
    data.forEach((d, i) => {
      tempObject.position.set(d.x, d.y, d.z);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      atlasIndices[i] = d.atlasIndex;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Add custom attribute for shader
    meshRef.current.geometry.setAttribute(
      'aAtlasIndex',
      new THREE.InstancedBufferAttribute(atlasIndices, 1)
    );

  }, [data, count]);

  // The "Clockwork" Animation Loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const noiseScale = CONFIG.noiseScale;
    
    data.forEach((cube, i) => {
      // 1. Get Noise Value (4D simulation using Time)
      const n = noise.noise3D(
        cube.x * noiseScale, 
        cube.y * noiseScale + time * 0.1, // Flow upwards 
        cube.z * noiseScale
      );

      // 2. Quantization Logic (The "Snap")
      // We want rotations of 0, 90, 180, 270 (-PI to PI)
      // Map noise (-1 to 1) to a wider range first
      const rawAngle = n * Math.PI * 2; 
      
      // Snap to nearest 90 degrees (PI/2)
      const snapStep = Math.PI / 2;
      const targetRotation = Math.round(rawAngle / snapStep) * snapStep;

      // 3. Interpolation (The "Lag")
      // Lerp current to target
      const animState = animationState[i];
      
      // Damper for smooth but mechanical movement
      // Using MathUtils.lerp for strict control
      animState.currentRotationY = THREE.MathUtils.lerp(
        animState.currentRotationY,
        targetRotation,
        0.1 // Stiffness
      );

      // Apply
      tempObject.position.set(cube.x, cube.y, cube.z);
      tempObject.rotation.set(0, animState.currentRotationY, 0); // Only rotate Y axis for "Totem" feel
      tempObject.scale.setScalar(0.85); // Make them slightly smaller than grid to see gaps
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={atlasTexture}
        normalMap={normalMap}
        color="#AAAAAA"
        roughness={0.8}
        metalness={0.1}
        onBeforeCompile={injectAtlasShader}
      />
    </instancedMesh>
  );
};
