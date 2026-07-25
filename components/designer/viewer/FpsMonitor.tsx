"use client"

// Monitor de FPS. Mide en cliente y avisa si está por debajo del umbral.
// La métrica se expone sólo como valor (no UI) — el banner se renderiza
// por separado en `panel/FpsWarningBanner.tsx` (Fase 6).

import { useFpsMonitor } from "@/lib/utils/canvas-fps"

interface FpsMonitorProps {
  onLowFps?: (fps: number) => void
  threshold?: number
}

export function FpsMonitor({ onLowFps, threshold = 30 }: FpsMonitorProps) {
  const fps = useFpsMonitor(3000)
  if (fps != null && onLowFps && fps < threshold) onLowFps(fps)
  return null
}
