"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

// Define the custom shader material
const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uMouse: new THREE.Vector2(0, 0),
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Simple wave effect
      float wave = sin(pos.y * 2.0 + uTime) * 0.1;
      float waveX = cos(pos.x * 2.0 + uTime) * 0.1;
      
      // Mouse interaction
      float dist = distance(uv, uMouse);
      float mouseEffect = smoothstep(0.5, 0.0, dist) * 0.2;
      
      pos.z += wave + waveX + mouseEffect;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    uniform float uTime;
    varying float vWave;

    void main() {
      // Color variation based on wave height
      vec3 color = uColor + vWave * 0.5;
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ WaveShaderMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waveShaderMaterial: any;
    }
  }
}

const AnimatedText = ({ text, position, fontSize, color }: { text: string; position: [number, number, number]; fontSize: number; color: string }) => {
  const materialRef = useRef<any>();
  
  useFrame(({ clock, pointer }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      // Map pointer (-1 to 1) to UV space (0 to 1) roughly
      materialRef.current.uMouse = new THREE.Vector2((pointer.x + 1) / 2, (pointer.y + 1) / 2);
    }
  });

  return (
    <Text
      position={position}
      fontSize={fontSize}
      font="/fonts/jamino.ttf"
      anchorX="center"
      anchorY="middle"
    >
      {text}
      <waveShaderMaterial ref={materialRef} uColor={new THREE.Color(color)} transparent />
    </Text>
  );
};

export default function ShaderText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <AnimatedText text={text} position={[0, 0, 0]} fontSize={1.5} color="#000000" />
      </Canvas>
    </div>
  );
}
