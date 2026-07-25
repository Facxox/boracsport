"use client"

import { useEffect, useRef, useState } from "react"

// Hook de FPS que promedia los últimos `sampleMs` milisegundos.
// Devuelve `null` mientras no haya muestra suficiente.

export function useFpsMonitor(sampleMs = 3000): number | null {
  const [fps, setFps] = useState<number | null>(null)
  const framesRef = useRef(0)
  const lastRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    function tick(t: number) {
      if (!mounted) return
      if (lastRef.current === 0) lastRef.current = t
      framesRef.current += 1
      const elapsed = t - lastRef.current
      if (elapsed >= sampleMs) {
        const current = Math.round((framesRef.current * 1000) / elapsed)
        setFps(current)
        framesRef.current = 0
        lastRef.current = t
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      mounted = false
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [sampleMs])

  return fps
}
