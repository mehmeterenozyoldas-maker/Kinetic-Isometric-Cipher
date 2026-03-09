import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const Debris: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 300;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Random data
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 15,
      y: (Math.random() - 0.5) * 20, // Initial Y spread -10 to 10
      z: (Math.random() - 0.5) * 15,
      speed: Math.random() * 0.2 + 0.1,
      offset: Math.random() * 100,
      rotationSpeed: (Math.random() - 0.5) * 2,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const range = 20;
    const halfRange = range / 2;

    particles.forEach((p, i) => {
      // Calculate vertical position with robust wrap-around
      const rawY = p.y + time * p.speed;
      // ((x % n) + n) % n handles negative numbers correctly if they occur
      const y = ((rawY + halfRange) % range + range) % range - halfRange;

      // Jitter
      const jitter = Math.sin(time * 2 + p.offset) * 0.05;

      dummy.position.set(p.x + jitter, y, p.z);
      
      // Dynamic rotation coupled with vertical drift
      // y * scalar adds a twist that correlates with height
      dummy.rotation.set(
        time * p.rotationSpeed, 
        time * p.rotationSpeed + y * 0.3, 
        y * 0.15 
      );
      
      dummy.scale.setScalar(0.05 + Math.sin(time + p.offset) * 0.02); // Pulse size
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        color="#FFFFFF" 
        transparent 
        opacity={0.4} 
        side={THREE.DoubleSide} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};