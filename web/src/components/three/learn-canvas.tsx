"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { LearnScene } from "@/components/three/learn-scene";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "@/hooks/use-theme";
import { THREE_DEFAULTS, THREE_GL_OPTIONS } from "@/lib/three";

type LearnCanvasProps = {
  reducedMotion?: boolean;
  className?: string;
  subject?: string;
};

/**
 * Lazy-friendly educational R3F canvas with adaptive DPR.
 */
export default function LearnCanvas({
  reducedMotion = false,
  className,
  subject = "science",
}: LearnCanvasProps) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const colors = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return {
      accent: isDark ? "#e4e4e7" : "#27272a",
      secondary: isDark ? "#a1a1aa" : "#71717a",
    };
  }, [resolvedTheme]);

  if (!mounted) {
    return (
      <div
        className={className}
        aria-hidden="true"
        style={{ background: "transparent" }}
      />
    );
  }

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[...THREE_DEFAULTS.dpr]}
        camera={{
          position: [0, 0.2, 5.2],
          fov: THREE_DEFAULTS.cameraFov,
          near: THREE_DEFAULTS.cameraNear,
          far: THREE_DEFAULTS.cameraFar,
        }}
        gl={{ ...THREE_GL_OPTIONS }}
        style={{ width: "100%", height: "100%", display: "block" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <LearnScene
          reducedMotion={reducedMotion}
          accent={colors.accent}
          secondary={colors.secondary}
          subject={subject}
        />
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
