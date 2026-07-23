"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type HeroSceneProps = {
  reducedMotion?: boolean;
  accent: string;
  secondary: string;
};

/**
 * Interactive procedural hero scene — smooth camera + clickable objects.
 */
export function HeroScene({
  reducedMotion = false,
  accent,
  secondary,
}: HeroSceneProps) {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const [focus, setFocus] = useState(0);
  const target = useRef({ x: 0, y: 0.1, z: 5.5 });

  const materials = useMemo(
    () => ({
      accent,
      secondary,
    }),
    [accent, secondary],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (!reducedMotion) {
      groupRef.current.rotation.y = t * 0.12 + focus * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;

      if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.35;
        const scale = 1.15 + (focus === 1 ? 0.08 : 0);
        coreRef.current.scale.setScalar(scale);
      }

      if (ringRef.current) {
        ringRef.current.rotation.z = t * 0.25;
        ringRef.current.rotation.x = Math.PI / 2.4;
      }

      target.current.x = Math.sin(t * 0.18 + focus) * 0.45;
      target.current.y = 0.12 + Math.sin(t * 0.22) * 0.1;
    }

    state.camera.position.x += (target.current.x - state.camera.position.x) * 0.04;
    state.camera.position.y += (target.current.y - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} position={[0.2, 0.1, 0]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <directionalLight position={[-3, -2, -4]} intensity={0.35} />

      <mesh
        ref={coreRef}
        scale={1.15}
        onClick={(event) => {
          event.stopPropagation();
          setFocus(1);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={materials.accent}
          metalness={0.35}
          roughness={0.35}
          flatShading
        />
      </mesh>

      <mesh
        ref={ringRef}
        scale={1.85}
        onClick={(event) => {
          event.stopPropagation();
          setFocus(2);
        }}
      >
        <torusGeometry args={[1, 0.045, 12, 64]} />
        <meshStandardMaterial
          color={materials.secondary}
          metalness={0.2}
          roughness={0.45}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh
        position={[1.6, 0.9, 0.4]}
        scale={0.18}
        onClick={(event) => {
          event.stopPropagation();
          setFocus(3);
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={materials.secondary}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>

      <mesh
        position={[-1.4, -0.8, 0.6]}
        scale={0.12}
        onClick={(event) => {
          event.stopPropagation();
          setFocus(0);
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={materials.accent}
          metalness={0.15}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}
