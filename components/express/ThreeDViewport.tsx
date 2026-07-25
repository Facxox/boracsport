"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Center, OrbitControls, Text, useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import type { Group, Mesh, MeshStandardMaterial, Texture } from "three"
import { Box3, Color, TextureLoader, Vector3 } from "three"
import type { ThreeDTemplateConfig, ThreeDLayerValue, TemplateZone } from "@/lib/designer/design-types"
import { Loader2, RotateCcw } from "lucide-react"

type Bounds = { center: Vector3; size: Vector3; maxDim: number }

type ViewportProps = {
  config: ThreeDTemplateConfig
  baseColor: string
  layers?: ThreeDLayerValue[]
  selectedPatternId?: string
  patternColor?: string
  patternSecondaryColor?: string
  selectedFontUrl?: string
}

function computeBounds(root: object): Bounds {
  const box = new Box3().setFromObject(root as never)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  return { center, size, maxDim: Math.max(size.x, size.y, size.z) || 1 }
}

function TemplateModel({ config, baseColor, patternUrl, patternColor, onBounds }: { config: ThreeDTemplateConfig; baseColor: string; patternUrl?: string; patternColor: string; onBounds: (bounds: Bounds) => void }) {
  const { scene } = useGLTF(config.modelUrl)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const pattern = useDataUrlTexture(patternUrl)

  useEffect(() => {
    onBounds(computeBounds(cloned))
  }, [cloned, onBounds])

  useEffect(() => {
    const base = new Color(baseColor)
    const accent = new Color(patternColor)
    cloned.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const material = mesh.material as MeshStandardMaterial
      if (!material?.color) return
      material.color.copy(base)
      if (pattern) {
        material.map = pattern
        material.color.copy(accent)
        material.needsUpdate = true
      }
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    return () => {
      cloned.traverse((object) => {
        const mesh = object as Mesh
        const material = mesh.material as MeshStandardMaterial
        if (mesh.isMesh && material?.map === pattern) {
          material.map = null
          material.needsUpdate = true
        }
      })
    }
  }, [baseColor, cloned, pattern, patternColor])

  return <Center><primitive object={cloned} /></Center>
}

function DecalText({ zone, text, color, font, outlineColor, outlineWidth }: { zone: TemplateZone; text: string; color: string; font?: string; outlineColor: string; outlineWidth: number }) {
  const fontSize = Math.max(0.12, Math.max(zone.scale[0], zone.scale[1]) * 0.32)
  return <Text position={zone.position} rotation={zone.rotation} scale={zone.scale} fontSize={fontSize} color={color} font={font} anchorX="center" anchorY="middle" maxWidth={Math.max(0.5, zone.scale[0] * 2)} outlineWidth={outlineWidth} outlineColor={outlineColor}>{text}</Text>
}

function useDataUrlTexture(url: string | undefined) {
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    if (!url) return
    let cancelled = false
    const loader = new TextureLoader()
    loader.load(url, (loaded) => {
      if (cancelled) return
      loaded.flipY = false
      loaded.needsUpdate = true
      setTexture(loaded)
    }, undefined, () => {
      if (!cancelled) setTexture(null)
    })
    return () => { cancelled = true }
  }, [url])
  return texture
}

function DecalImage({ zone, url }: { zone: TemplateZone; url: string }) {
  const texture = useDataUrlTexture(url)
  if (!texture) return null
  return <mesh position={zone.position} rotation={zone.rotation} renderOrder={2}><planeGeometry args={[Math.max(0.05, zone.scale[0]), Math.max(0.05, zone.scale[1])]} /><meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} /></mesh>
}

function ZoneDecals({ zones, layers, fontUrl }: { zones: TemplateZone[]; layers: ThreeDLayerValue[]; fontUrl?: string }) {
  return <group>
    {zones.map((zone) => {
      if (zone.kind === "color" || zone.kind === "pattern") return null
      const layer = layers.find((item) => item.zoneId === zone.id)
      if (zone.kind === "logo" || zone.kind === "sponsor") {
        return layer?.assetUrl ? <DecalImage key={zone.id} zone={zone} url={layer.assetUrl} /> : null
      }
      const value = layer?.value?.trim()
      if (!value || layer?.enabled === false) return null
      return <DecalText key={zone.id} zone={zone} text={value} color={layer?.color ?? "#ffffff"} font={fontUrl} outlineColor={zone.kind === "number" ? "#111111" : "#000000"} outlineWidth={zone.kind === "number" ? 0.02 : 0.005} />
    })}
  </group>
}

function Scene({ config, baseColor, layers, patternUrl, patternColor, fontUrl, onBounds, target }: { config: ThreeDTemplateConfig; baseColor: string; layers: ThreeDLayerValue[]; patternUrl?: string; patternColor: string; fontUrl?: string; onBounds: (bounds: Bounds) => void; target: [number, number, number] }) {
  const group = useRef<Group>(null)
  useFrame(() => { if (group.current) group.current.rotation.y += 0.001 })
  return <group ref={group}><TemplateModel config={config} baseColor={baseColor} patternUrl={patternUrl} patternColor={patternColor} onBounds={onBounds} /><group position={[-target[0], -target[1], -target[2]]}><ZoneDecals zones={config.zones} layers={layers} fontUrl={fontUrl} /></group></group>
}

function CameraSync({ target }: { target: [number, number, number] }) {
  const { camera } = useThree()
  useEffect(() => { camera.lookAt(...target) }, [camera, target])
  return null
}

export function ThreeDViewport({ config, baseColor, layers = [], selectedPatternId, patternColor = "#5b0000", patternSecondaryColor = "#7a3200", selectedFontUrl }: ViewportProps) {
  const [resetKey, setResetKey] = useState(0)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const onBounds = useMemo(() => (value: Bounds) => setBounds(value), [])
  const target = (config.scene?.cameraTarget ?? [0, 0, 0]) as [number, number, number]
  const distance = config.scene?.cameraDistance ?? (bounds ? bounds.maxDim * 1.9 : 4.5)
  const position: [number, number, number] = config.scene?.cameraPosition ?? [target[0] + distance * 0.85, target[1] + distance * 0.35, target[2] + distance * 0.9]
  const pattern = config.patterns?.find((item) => item.id === selectedPatternId)
  const patternUrl = pattern?.url
  const accent = patternSecondaryColor || patternColor

  return <div className="relative min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-[#09090b]">
    <Canvas key={resetKey} shadows camera={{ position, fov: 35 }} gl={{ preserveDrawingBuffer: true }}>
      <color attach="background" args={[config.scene?.background ?? "#09090b"]} />
      <ambientLight intensity={1.4} /><directionalLight position={[3, 4, 4]} intensity={2.2} castShadow />
      <Suspense fallback={null}><Scene config={config} baseColor={baseColor} layers={layers} patternUrl={patternUrl} patternColor={accent} fontUrl={selectedFontUrl} onBounds={onBounds} target={target} /></Suspense>
      <CameraSync target={target} />
      <OrbitControls enablePan={false} minDistance={Math.max(0.5, distance * 0.4)} maxDistance={distance * 2.5} target={target} />
    </Canvas>
    <button type="button" onClick={() => setResetKey((value) => value + 1)} className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs font-semibold text-white/80 hover:border-brand-red" aria-label="Restablecer vista 3D"><RotateCcw className="h-3.5 w-3.5" />Restablecer vista</button>
    <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs text-white/60"><Loader2 className="h-3.5 w-3.5 animate-spin" />Vista 3D interactiva · arrastrá para rotar</div>
  </div>
}

export function TemplateModelPreload({ config }: { config: ThreeDTemplateConfig }) {
  useGLTF.preload(config.modelUrl)
  return null
}
