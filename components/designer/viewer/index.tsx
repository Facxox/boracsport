"use client"

// Entry-point del visor 3D para el cliente (ssr:false).
// El `<Canvas>` se importa dinámicamente para no romper el SSR de Next.

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { FpsMonitor } from "@/components/designer/viewer/FpsMonitor"
import type { DesignState } from "@/lib/designer/types"

interface Viewer3DProps {
  state: DesignState
  modelUrl: string | null | undefined
  onLowFps?: (fps: number) => void
}

const SceneLazy = dynamic(
  () => import("@/components/designer/viewer/Scene").then((m) => m.Scene),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-square w-full" />,
  },
)

export function Viewer3D(props: Viewer3DProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
      <SceneLazy {...props} />
      <FpsMonitor onLowFps={props.onLowFps} />
    </div>
  )
}
