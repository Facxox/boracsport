"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Center, OrbitControls, useGLTF } from "@react-three/drei"
import { Suspense, useMemo, useRef, useState } from "react"
import type { Group, Mesh, MeshStandardMaterial } from "three"
import type { ThreeDTemplateConfig, TemplateZone } from "@/lib/designer/design-types"
import { Loader2, RotateCcw } from "lucide-react"

function TemplateModel({ config, baseColor }: { config: ThreeDTemplateConfig; baseColor: string }) {
  const { scene } = useGLTF(config.modelUrl)
  const cloned = useMemo(() => scene.clone(true), [scene])
  cloned.traverse((object) => {
    const mesh = object as Mesh
    if (mesh.isMesh) {
      const material = mesh.material as MeshStandardMaterial
      if (material?.color) material.color.set(baseColor)
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
  return <Center><primitive object={cloned} /></Center>
}

function LockedZoneMarkers({ zones }: { zones: TemplateZone[] }) {
  return <group>{zones.map((zone) => <mesh key={zone.id} position={zone.position} rotation={zone.rotation} scale={zone.scale}><planeGeometry args={[0.35, 0.18]} /><meshBasicMaterial transparent opacity={0} /></mesh>)}</group>
}

function Scene({ config, baseColor }: { config: ThreeDTemplateConfig; baseColor: string }) {
  const group = useRef<Group>(null)
  useFrame(() => { if (group.current) group.current.rotation.y += 0.001 })
  return <group ref={group}><TemplateModel config={config} baseColor={baseColor} /><LockedZoneMarkers zones={config.zones} /></group>
}

export function ThreeDViewport({ config, baseColor }: { config: ThreeDTemplateConfig; baseColor: string }) {
  const [resetKey, setResetKey] = useState(0)
  return <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[#09090b]"><Canvas key={resetKey} shadows camera={{ position: config.scene?.cameraPosition ?? [0, 0.6, 4.5], fov: 35 }}><color attach="background" args={[config.scene?.background ?? "#09090b"]} /><ambientLight intensity={1.4} /><directionalLight position={[3, 4, 4]} intensity={2.2} castShadow /><Suspense fallback={null}><Scene config={config} baseColor={baseColor} /></Suspense><OrbitControls enablePan={false} minDistance={2.5} maxDistance={7} /></Canvas><button type="button" onClick={() => setResetKey((value) => value + 1)} className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs font-semibold text-white/80 hover:border-brand-red" aria-label="Restablecer vista 3D"><RotateCcw className="h-3.5 w-3.5" />Restablecer vista</button><div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs text-white/60"><Loader2 className="h-3.5 w-3.5 animate-spin" />Vista 3D interactiva · arrastrá para rotar</div></div>
}

export function TemplateModelPreload({ config }: { config: ThreeDTemplateConfig }) { useGLTF.preload(config.modelUrl); return null }
