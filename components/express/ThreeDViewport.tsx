"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Center, OrbitControls, Text, useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import type { Group, Mesh, MeshStandardMaterial } from "three"
import { Box3, TextureLoader, Vector3 } from "three"
import type {
  ThreeDTemplateConfig,
  ThreeDLayerValue,
  TemplateZone,
} from "@/lib/designer/design-types"
import { Loader2, RotateCcw } from "lucide-react"

type Bounds = {
  center: Vector3
  size: Vector3
  maxDim: number
}

function computeBounds(root: { traverse: (cb: (o: object) => void) => void }): Bounds {
  const box = new Box3().setFromObject(root as never)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  return { center, size, maxDim }
}

function TemplateModel({ config, baseColor, onBounds }: { config: ThreeDTemplateConfig; baseColor: string; onBounds: (b: Bounds) => void }) {
  const { scene } = useGLTF(config.modelUrl)
  const cloned = useMemo(() => scene.clone(true), [scene])
  useEffect(() => {
    onBounds(computeBounds(cloned))
  }, [cloned, onBounds])
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

function DecalText({ zone, text, color }: { zone: TemplateZone; text: string; color: string }) {
  const fontSize = Math.max(0.12, Math.max(zone.scale[0], zone.scale[1]) * 0.32)
  return (
    <Text
      position={zone.position}
      rotation={zone.rotation}
      scale={[zone.scale[0] || 1, zone.scale[1] || 1, zone.scale[2] || 1]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      maxWidth={Math.max(0.5, zone.scale[0] * 2)}
      outlineWidth={0.005}
      outlineColor="#000"
    >
      {text}
    </Text>
  )
}

function useDataUrlTexture(url: string | undefined) {
  const [texture, setTexture] = useState<import("three").Texture | null>(null)
  useEffect(() => {
    if (!url) return
    let cancelled = false
    const loader = new TextureLoader()
    loader.load(
      url,
      (tex) => {
        if (cancelled) return
        tex.flipY = false
        tex.needsUpdate = true
        setTexture(tex)
      },
      undefined,
      () => {
        if (cancelled) return
        setTexture((current) => (current === null ? current : null))
      },
    )
    return () => {
      cancelled = true
    }
  }, [url])
  return texture
}

function DecalImage({ zone, url }: { zone: TemplateZone; url: string }) {
  const texture = useDataUrlTexture(url)
  if (!texture) return null
  const w = Math.max(0.05, zone.scale[0])
  const h = Math.max(0.05, zone.scale[1])
  return (
    <mesh position={zone.position} rotation={zone.rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

function ZoneDecals({ zones, layers }: { zones: TemplateZone[]; layers: ThreeDLayerValue[] }) {
  return (
    <group>
      {zones.map((zone) => {
        if (zone.kind === "color") return null
        const layer = layers.find((l) => l.zoneId === zone.id)
        if (zone.kind === "logo" || zone.kind === "sponsor") {
          if (!layer?.assetUrl) return null
          return <DecalImage key={zone.id} zone={zone} url={layer.assetUrl} />
        }
        // text, number — show non-empty value
        const value = (layer?.value ?? "").trim()
        if (!value) return null
        const color = layer?.color ?? "#ffffff"
        return <DecalText key={zone.id} zone={zone} text={value} color={color} />
      })}
    </group>
  )
}

function Scene({
  config,
  baseColor,
  layers,
  onBounds,
  cameraTarget,
}: {
  config: ThreeDTemplateConfig
  baseColor: string
  layers: ThreeDLayerValue[]
  onBounds: (b: Bounds) => void
  cameraTarget: [number, number, number]
}) {
  const group = useRef<Group>(null)
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.001
  })
  return (
    <group ref={group}>
      <TemplateModel config={config} baseColor={baseColor} onBounds={onBounds} />
      <group position={[-cameraTarget[0], -cameraTarget[1], -cameraTarget[2]]}>
        <ZoneDecals zones={config.zones} layers={layers} />
      </group>
    </group>
  )
}

export function ThreeDViewport({
  config,
  baseColor,
  layers = [],
}: {
  config: ThreeDTemplateConfig
  baseColor: string
  layers?: ThreeDLayerValue[]
}) {
  const [resetKey, setResetKey] = useState(0)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const onBounds = useMemo(() => (b: Bounds) => setBounds(b), [])

  const target = (config.scene?.cameraTarget ?? [0, 0, 0]) as [number, number, number]
  const distance = config.scene?.cameraDistance ?? (bounds ? bounds.maxDim * 1.8 : 4.5)

  const cameraPosition: [number, number, number] = config.scene?.cameraPosition ?? [
    target[0] + distance * 0.85,
    target[1] + distance * 0.35,
    target[2] + distance * 0.9,
  ]

  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[#09090b]">
      <Canvas
        key={resetKey}
        shadows
        camera={{ position: cameraPosition, fov: 35 }}
      >
        <color attach="background" args={[config.scene?.background ?? "#09090b"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} castShadow />
        <Suspense fallback={null}>
          <Scene
            config={config}
            baseColor={baseColor}
            layers={layers}
            onBounds={onBounds}
            cameraTarget={target}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={Math.max(0.5, distance * 0.4)}
          maxDistance={distance * 2.5}
          target={target}
        />
      </Canvas>
      <button
        type="button"
        onClick={() => setResetKey((value) => value + 1)}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs font-semibold text-white/80 hover:border-brand-red"
        aria-label="Restablecer vista 3D"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Restablecer vista
      </button>
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs text-white/60">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Vista 3D interactiva · arrastrá para rotar
      </div>
    </div>
  )
}

export function TemplateModelPreload({ config }: { config: ThreeDTemplateConfig }) {
  useGLTF.preload(config.modelUrl)
  return null
}
