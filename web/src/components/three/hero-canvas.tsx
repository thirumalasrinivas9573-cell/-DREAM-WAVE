"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { HeroScene } from "@/components/three/hero-scene";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "@/hooks/use-theme";
import { THREE_DEFAULTS } from "@/lib/three";

type HeroCanvasProps = {
  reducedMotion?: boolean;
  className?: string;
};

/**
 * Reusable R3F canvas container for the marketing hero.
 * Uses lightweight primitives only — no models or HDR environments.
 */
export default function HeroCanvas({
  reducedMotion = false,
  className,
}: HeroCanvasProps) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const colors = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      accent: isDark ? "#f4f4f5" : "#18181b",
      secondary: isDark ? "#a1a1aa" : "#71717a",
    };
  }, [resolvedTheme]);

  if (!mounted) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[...THREE_DEFAULTS.dpr]}
        camera={{
          position: [0, 0, 5.5],
          fov: THREE_DEFAULTS.cameraFov,
          near: THREE_DEFAULTS.cameraNear,
          far: THREE_DEFAULTS.cameraFar,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <HeroScene
          reducedMotion={reducedMotion}
          accent={colors.accent}
          secondary={colors.secondary}
        />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
