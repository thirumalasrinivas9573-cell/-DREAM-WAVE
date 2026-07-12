"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

type LearnSceneProps = {
  reducedMotion?: boolean;
  accent: string;
  secondary: string;
  subject?: string;
};

/**
 * Educational 3D primitives — subject-tinted objects with smooth camera orbit.
 */
export function LearnScene({
  reducedMotion = false,
  accent,
  secondary,
  subject = "science",
}: LearnSceneProps) {
  const groupRef = useRef<Group>(null);
  const primaryRef = useRef<Mesh>(null);
  const orbitRef = useRef<Group>(null);

  const palette = useMemo(
    () => ({
      accent,
      secondary,
      subject,
    }),
    [accent, secondary, subject],
  );

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.08;
      const pulse = 1 + Math.sin(t * 1.4) * 0.03;
      groupRef.current.scale.setScalar(pulse);
    }

    if (primaryRef.current) {
      primaryRef.current.rotation.x = t * 0.25;
      primaryRef.current.rotation.z = t * 0.12;
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y = -t * 0.4;
    }

    state.camera.position.x = Math.sin(t * 0.15) * 0.35;
    state.camera.position.y = 0.15 + Math.sin(t * 0.2) * 0.1;
    state.camera.lookAt(0, 0, 0);
  });

  const primaryGeometry =
    palette.subject === "math" ? (
      <octahedronGeometry args={[1, 0]} />
    ) : palette.subject === "programming" ? (
      <boxGeometry args={[1.4, 1.4, 1.4]} />
    ) : palette.subject === "design" ? (
      <torusKnotGeometry args={[0.7, 0.22, 96, 16]} />
    ) : palette.subject === "business" ? (
      <coneGeometry args={[0.9, 1.5, 5]} />
    ) : (
      <icosahedronGeometry args={[1, 1]} />
    );

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={1.15} />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} />

      <mesh ref={primaryRef} scale={1.05}>
        {primaryGeometry}
        <meshStandardMaterial
          color={palette.accent}
          metalness={0.3}
          roughness={0.35}
          flatShading
        />
      </mesh>

      <group ref={orbitRef}>
        <mesh position={[1.8, 0.2, 0]} scale={0.18}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={palette.secondary} roughness={0.45} />
        </mesh>
        <mesh position={[-1.5, -0.5, 0.6]} scale={0.12}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={palette.accent} roughness={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.7}>
          <torusGeometry args={[1, 0.035, 10, 64]} />
          <meshStandardMaterial
            color={palette.secondary}
            transparent
            opacity={0.75}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
