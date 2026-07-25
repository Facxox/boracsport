"use client"

// Escena del viewport 3D.
// - `preserveDrawingBuffer: true` para poder exportar la escena a PNG vía
//   `gl.domElement.toDataURL()` desde el SaveDesignModal.
// - `alpha: true` permite que el background del html se vea en el viewport
//   (consistente con `next-themes`).
// - `<OrbitControls>` con `enablePan: false` y target a la altura del torso.

import { Canvas } from "@react-three/fiber"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import { useTheme } from "next-themes"
import * as THREE from "three"
import { Lighting } from "@/components/designer/viewer/Lighting"
import { ShirtModel } from "@/components/designer/viewer/ShirtModel"
import type { DesignState } from "@/lib/designer/types"
import type { ZoneImageMap } from "@/components/designer/TextureCompositor"

interface SceneProps {
  state: DesignState
  modelUrl: string | null | undefined
  logos: ZoneImageMap
}

export function Scene({ state, modelUrl, logos }: SceneProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
      camera={{ position: [0, 1, 4.2], fov: 38 }}
      shadows
    >
      <color attach="background" args={[isDark ? "#000000" : "#f4f4f5"]} />
      <fog attach="fog" args={[isDark ? "#000000" : "#f4f4f5", 8, 18]} />
      <Lighting />
      <ShirtModel modelUrl={modelUrl} state={state} logos={logos} />
      <ContactShadows position={[0, -1.6, 0]} opacity={0.45} blur={2.4} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={7}
        target={[0, 1, 0]}
      />
    </Canvas>
  )
}

// Helper para exportar la escena a PNG. Se llama desde SaveDesignModal.
export function captureCanvasPng(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png")
}

// Re-export del THREE para que el caller pueda tipar el render.
export { THREE }
