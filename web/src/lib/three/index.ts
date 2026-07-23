/**
 * Dream Wave — Three.js helpers.
 *
 * Packages: three, @react-three/fiber, @react-three/drei.
 * Hero uses procedural primitives only (no external models/HDR).
 */

export const THREE_DEFAULTS = {
  dpr: [1, 1.75] as const,
  cameraFov: 42,
  cameraNear: 0.1,
  cameraFar: 100,
} as const;

/**
 * Recommended GL flags for marketing canvases.
 */
export const THREE_GL_OPTIONS = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as const,
  stencil: false,
  depth: true,
} as const;
