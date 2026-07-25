"use client"

// Iluminación del viewport 3D.
// En dark mode sumamos un `<Environment preset="city">` (PMREMGenerator
// precomputa la env map por instancia).

import { useTheme } from "next-themes"
import { Environment } from "@react-three/drei"

export function Lighting() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  return (
    <>
      <ambientLight intensity={isDark ? 0.4 : 0.7} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={isDark ? 1.1 : 0.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 2, -3]} intensity={isDark ? 0.5 : 0.3} />
      {isDark ? <Environment preset="city" /> : null}
    </>
  )
}
