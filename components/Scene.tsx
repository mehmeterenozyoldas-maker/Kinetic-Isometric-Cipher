import React, { forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch, Scanline, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Monument } from './Monument';
import { Debris } from './Debris';
import { COLORS } from '../constants';

// Isometric Orthographic Camera calculation
// We want a true isometric angle: atan(1/sqrt(2)) = 35.264 degrees on X
const isoAngle = Math.atan(1 / Math.sqrt(2));

export const Scene = forwardRef<HTMLCanvasElement>((props, ref) => {
  return (
    <div className="w-full h-screen bg-[#0011FF]">
      <Canvas
        ref={ref}
        shadows
        orthographic
        camera={{
          position: [20, 20, 20],
          zoom: 40,
          near: 0.1,
          far: 2000,
        }}
        dpr={[1, 2]} // Handle high DPI
        gl={{ antialias: false, preserveDrawingBuffer: true }} // preserveDrawingBuffer needed for recording sometimes
      >
        <color attach="background" args={[COLORS.background]} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.4} color="#ccccff" />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          color="#ffffff"
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>
        <directionalLight position={[-10, 5, -10]} intensity={0.5} color="#0044ff" />

        {/* Content */}
        <group rotation={[0, Math.PI / 4, 0]}> 
            {/* Rotate Y 45 degrees to align cube corners to camera for Iso view */}
            <Monument />
            <Debris />
        </group>

        {/* Grounding Shadows */}
        <ContactShadows 
          position={[0, -6, 0]} 
          opacity={0.5} 
          scale={40} 
          blur={2.5} 
          far={10} 
          color="#000000"
        />

        {/* Controls (Optional, restricted for 'Monument' feel but good for debug) */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          minZoom={20}
          maxZoom={100}
        />

        {/* Post Processing Stack */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={0.4} 
                radius={0.4}
            />
            <Noise opacity={0.15} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
            <Glitch 
                delay={[1.5, 3.5]} 
                duration={[0.1, 0.3]} 
                strength={[0.1, 0.2]} 
                mode={1} // SPORADIC
                ratio={0.1}
            />
            <Scanline 
              density={2} 
              opacity={0.1} 
            />
            <ChromaticAberration 
              offset={[0.002, 0.002]} // RGB Shift
              radialModulation={true} 
              modulationOffset={0.7} 
            />
        </EffectComposer>
      </Canvas>
    </div>
  );
});

Scene.displayName = 'Scene';