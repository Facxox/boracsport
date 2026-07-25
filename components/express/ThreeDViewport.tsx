"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, useGLTF } from "@react-three/drei"
import { Suspense, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import type { Group, Mesh, MeshStandardMaterial, Object3D, Texture } from "three"
import { Box3, Color, TextureLoader, Vector3 } from "three"
import type { GarmentModelConfig, KitView, ThreeDTemplateConfig, ThreeDLayerValue, TemplateZone } from "@/lib/designer/design-types"
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
  selectedKit?: KitView
}

export type ViewportHandle = {
  getCanvas: () => HTMLCanvasElement | null
}

function computeBounds(root: Object3D): Bounds {
  const box = new Box3().setFromObject(root)
  const center = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  return { center, size, maxDim: Math.max(size.x, size.y, size.z) || 1 }
}

function mergeBounds(a: Bounds | null, b: Bounds): Bounds {
  if (!a) return b
  const min = new Vector3(
    Math.min(a.center.x - a.size.x / 2, b.center.x - b.size.x / 2),
    Math.min(a.center.y - a.size.y / 2, b.center.y - b.size.y / 2),
    Math.min(a.center.z - a.size.z / 2, b.center.z - b.size.z / 2),
  )
  const max = new Vector3(
    Math.max(a.center.x + a.size.x / 2, b.center.x + b.size.x / 2),
    Math.max(a.center.y + a.size.y / 2, b.center.y + b.size.y / 2),
    Math.max(a.center.z + a.size.z / 2, b.center.z + b.size.z / 2),
  )
  const center = new Vector3().addVectors(min, max).multiplyScalar(0.5)
  const size = new Vector3().subVectors(max, min)
  return { center, size, maxDim: Math.max(size.x, size.y, size.z) || 1 }
}

function applyTransform(target: Object3D, transform?: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }) {
  if (!transform) return
  if (transform.position) target.position.set(transform.position[0], transform.position[1], transform.position[2])
  if (transform.rotation) target.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2])
  if (transform.scale) target.scale.set(transform.scale[0], transform.scale[1], transform.scale[2])
}

function matchesMaterial(mesh: Mesh, names: string[] | undefined): boolean {
  if (!names || names.length === 0) return false
  const material = mesh.material as MeshStandardMaterial | undefined
  if (!material?.name) return false
  const meshName = material.name
  return names.some((name) => meshName === name || meshName.toLowerCase().includes(name.toLowerCase()))
}

function cloneMaterialsDeep(root: Object3D): void {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const material = mesh.material
    if (Array.isArray(material)) {
      mesh.material = material.map((m) => m.clone())
    } else if (material) {
      mesh.material = (material as MeshStandardMaterial).clone()
    }
  })
}

function applyMaterialColor(root: Object3D, color: Color, targets: string[] | undefined): void {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const material = mesh.material as MeshStandardMaterial | undefined
    if (!material?.color) return
    if (targets && targets.length > 0 && !matchesMaterial(mesh, targets)) return
    material.color.copy(color)
    material.needsUpdate = true
  })
}

function applyPatternTexture(root: Object3D, texture: Texture | null, fallback: Color, targets: string[] | undefined): void {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const material = mesh.material as MeshStandardMaterial | undefined
    if (!material?.color) return
    if (targets && targets.length > 0 && !matchesMaterial(mesh, targets)) return
    if (texture) {
      material.map = texture
      material.color.copy(new Color(0xffffff))
    } else {
      material.map = null
      material.color.copy(fallback)
    }
    material.needsUpdate = true
  })
}

function useDataUrlTexture(url: string | undefined) {
  const [texture, setTexture] = useState<Texture | null>(null)
  const requestId = useRef(0)
  useEffect(() => {
    const current = ++requestId.current
    let cancelled = false
    if (!url) {
      const pending = Promise.resolve().then(() => {
        if (cancelled || requestId.current !== current) return
        setTexture(null)
      })
      void pending
      return
    }
    const loader = new TextureLoader()
    loader.load(
      url,
      (loaded) => {
        if (cancelled || requestId.current !== current) return
        loaded.flipY = false
        loaded.needsUpdate = true
        setTexture(loaded)
      },
      undefined,
      () => {
        if (cancelled || requestId.current !== current) return
        setTexture(null)
      },
    )
    return () => {
      cancelled = true
    }
  }, [url])
  return texture
}

type GarmentPieceProps = {
  baseColor: string
  patternTexture: Texture | null
  patternTint: Color
  colorTargets: Record<string, string[] | undefined>
  patternTargets: string[] | undefined
  colorLookup: Map<string, Color>
  onBounds: (bounds: Bounds) => void
}

function GarmentPiece({ config, baseColor, patternTexture, patternTint, colorTargets, patternTargets, colorLookup, onBounds }: GarmentPieceProps & { config: GarmentModelConfig }) {
  const { scene } = useGLTF(config.url)
  const cloned = useMemo(() => {
    const next = scene.clone(true)
    cloneMaterialsDeep(next)
    return next
  }, [scene])

  useEffect(() => {
    onBounds(computeBounds(cloned))
  }, [cloned, onBounds])

  useEffect(() => {
    const base = new Color(baseColor)
    // Reset colors then re-apply by zone.
    cloned.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const material = mesh.material as MeshStandardMaterial | undefined
      if (!material?.color) return
      material.map = null
      material.color.copy(base)
      material.needsUpdate = true
    })
    for (const [zoneId, targets] of Object.entries(colorTargets)) {
      if (!targets || targets.length === 0) continue
      const color = colorLookup.get(zoneId)
      if (!color) continue
      applyMaterialColor(cloned, color, targets)
    }
    if (patternTexture) {
      applyPatternTexture(cloned, patternTexture, patternTint, patternTargets)
    } else {
      applyPatternTexture(cloned, null, patternTint, patternTargets)
    }
  }, [baseColor, cloned, patternTexture, patternTint, patternTargets, colorTargets, colorLookup])

  return <primitive object={cloned} />
}

function GarmentPieceWithTransform({ transformer, ...rest }: { transformer: GarmentModelConfig } & GarmentPieceProps) {
  const groupRef = useRef<Group>(null)
  useEffect(() => {
    if (groupRef.current) applyTransform(groupRef.current, transformer)
  }, [transformer])
  return (
    <group ref={groupRef}>
      <GarmentPiece {...rest} config={transformer} />
    </group>
  )
}

function DecalText({
  zone,
  text,
  color,
  font,
  outlineColor,
  outlineWidth,
  enabled,
}: {
  zone: TemplateZone
  text: string
  color: string
  font?: string
  outlineColor: string
  outlineWidth: number
  enabled: boolean
}) {
  if (!enabled || !text.trim()) return null
  const fontSize = Math.max(0.12, Math.max(zone.scale[0], zone.scale[1]) * 0.32)
  return (
    <Text
      position={zone.position}
      rotation={zone.rotation}
      scale={zone.scale}
      fontSize={fontSize}
      color={color}
      font={font}
      anchorX="center"
      anchorY="middle"
      maxWidth={Math.max(0.5, zone.scale[0] * 2)}
      outlineWidth={outlineWidth}
      outlineColor={outlineColor}
      renderOrder={3}
      material-depthTest={false}
      material-toneMapped={false}
    >
      {text}
    </Text>
  )
}

function DecalImage({ zone, url }: { zone: TemplateZone; url: string }) {
  const texture = useDataUrlTexture(url)
  if (!texture) return null
  return (
    <mesh position={zone.position} rotation={zone.rotation} renderOrder={2}>
      <planeGeometry args={[Math.max(0.05, zone.scale[0]), Math.max(0.05, zone.scale[1])]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  )
}

function ZoneDecals({ zones, layers, fontUrl }: { zones: TemplateZone[]; layers: ThreeDLayerValue[]; fontUrl?: string }) {
  return (
    <group>
      {zones.map((zone) => {
        if (zone.kind === "color" || zone.kind === "pattern") return null
        const layer = layers.find((item) => item.zoneId === zone.id)
        if (zone.kind === "logo" || zone.kind === "sponsor") {
          return layer?.assetUrl ? <DecalImage key={zone.id} zone={zone} url={layer.assetUrl} /> : null
        }
        const value = layer?.value?.trim()
        if (!value || layer?.enabled === false) return null
        const strokeColor = layer?.strokeEnabled ? layer?.strokeColor ?? "#000000" : "transparent"
        const strokeWidth = layer?.strokeEnabled ? (zone.kind === "number" ? 0.025 : 0.008) : 0
        return (
          <DecalText
            key={zone.id}
            zone={zone}
            text={value}
            color={layer?.color ?? "#ffffff"}
            font={fontUrl}
            outlineColor={strokeColor}
            outlineWidth={strokeWidth}
            enabled={true}
          />
        )
      })}
    </group>
  )
}

function ZoneColorResolver({ zones, layers, onResolve }: { zones: TemplateZone[]; layers: ThreeDLayerValue[]; onResolve: (map: Map<string, Color>) => void }) {
  const map = useMemo(() => {
    const out = new Map<string, Color>()
    for (const zone of zones) {
      if (zone.kind !== "color") continue
      const layer = layers.find((item) => item.zoneId === zone.id)
      const color = layer?.color ?? zone.defaultValue ?? zone.allowedColors?.[0] ?? "#111111"
      out.set(zone.id, new Color(color))
    }
    return out
  }, [zones, layers])
  useEffect(() => {
    onResolve(map)
  }, [map, onResolve])
  return null
}

function Scene({
  config,
  baseColor,
  layers,
  patternUrl,
  patternColor,
  fontUrl,
  selectedKit,
  onBounds,
  onCanvasReady,
  target,
}: {
  config: ThreeDTemplateConfig
  baseColor: string
  layers: ThreeDLayerValue[]
  patternUrl?: string
  patternColor: string
  fontUrl?: string
  selectedKit: KitView
  onBounds: (bounds: Bounds) => void
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void
  target: [number, number, number]
}) {
  const { gl } = useThree()
  const groupRef = useRef<Group | null>(null)
  const combinedBounds = useRef<Bounds | null>(null)
  const [colorLookup, setColorLookup] = useState<Map<string, Color>>(new Map())

  useEffect(() => {
    onCanvasReady(gl.domElement)
    return () => onCanvasReady(null)
  }, [gl, onCanvasReady])

  const colorTargets = useMemo(() => {
    const out: Record<string, string[] | undefined> = {}
    for (const zone of config.zones) {
      if (zone.kind === "color" && zone.materialNames?.length) {
        out[zone.id] = zone.materialNames
      }
    }
    return out
  }, [config.zones])

  const patternTargets = useMemo(() => {
    const patternZone = config.zones.find((zone) => zone.kind === "pattern")
    return patternZone?.materialNames
  }, [config.zones])

  const patternTexture = useDataUrlTexture(patternUrl)
  const patternTint = useMemo(() => new Color(patternColor), [patternColor])

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0015
  })

  function captureBounds(b: Bounds) {
    combinedBounds.current = mergeBounds(combinedBounds.current, b)
    onBounds(combinedBounds.current)
  }

  const pieces = useMemo(() => {
    const shirts = config.models?.shirt
    const shorts = config.models?.shirtShort
    const full = config.models?.full
    const out: GarmentModelConfig[] = []
    if (shirts) out.push(shirts)
    if (selectedKit === "shirtShort") {
      if (shorts) out.push(shorts)
    } else if (selectedKit === "full") {
      if (shorts) out.push(shorts)
      if (full) out.push(full)
    }
    return out
  }, [config.models, selectedKit])

  return (
    <group ref={groupRef}>
      <group position={[-target[0], -target[1], -target[2]]}>
        {pieces.map((piece, idx) => (
          <GarmentPieceWithTransform
            key={`${piece.url}-${idx}`}
            transformer={piece}
            baseColor={baseColor}
            patternTexture={patternTexture}
            patternTint={patternTint}
            colorTargets={colorTargets}
            patternTargets={patternTargets}
            colorLookup={colorLookup}
            onBounds={captureBounds}
          />
        ))}
        <ZoneColorResolver zones={config.zones} layers={layers} onResolve={setColorLookup} />
        <ZoneDecals zones={config.zones} layers={layers} fontUrl={fontUrl} />
      </group>
    </group>
  )
}

function CameraSync({ target }: { target: [number, number, number] }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(new Vector3(target[0], target[1], target[2]))
  }, [camera, target])
  return null
}

export const ThreeDViewport = forwardRef<ViewportHandle, ViewportProps>(function ThreeDViewport(
  { config, baseColor, layers = [], selectedPatternId, patternColor = "#5b0000", patternSecondaryColor = "#7a3200", selectedFontUrl, selectedKit = "shirt" },
  ref,
) {
  const [resetKey, setResetKey] = useState(0)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      getCanvas: () => canvas,
    }),
    [canvas],
  )

  const onBounds = useMemo(() => (value: Bounds) => setBounds(value), [])
  const target = (config.scene?.cameraTarget ?? [0, 0, 0]) as [number, number, number]
  const distance = config.scene?.cameraDistance ?? (bounds ? bounds.maxDim * 1.6 : 4.5)
  const position: [number, number, number] = config.scene?.cameraPosition ?? [
    target[0] + distance * 0.85,
    target[1] + distance * 0.35,
    target[2] + distance * 0.9,
  ]
  const pattern = config.patterns?.find((item) => item.id === selectedPatternId)
  const patternUrl = pattern?.url
  const accent = pattern?.secondaryColor && patternSecondaryColor ? patternSecondaryColor : patternColor

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-[#09090b]">
      <Canvas
        key={resetKey}
        shadows
        camera={{ position, fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach="background" args={[config.scene?.background ?? "#09090b"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} castShadow />
        <Suspense fallback={null}>
          <Scene
            config={config}
            baseColor={baseColor}
            layers={layers}
            patternUrl={patternUrl}
            patternColor={accent}
            fontUrl={selectedFontUrl}
            selectedKit={selectedKit}
            onBounds={onBounds}
            onCanvasReady={setCanvas}
            target={target}
          />
        </Suspense>
        <CameraSync target={target} />
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
})

export function TemplateModelPreload({ config }: { config: ThreeDTemplateConfig }) {
  useGLTF.preload(config.modelUrl)
  return null
}
