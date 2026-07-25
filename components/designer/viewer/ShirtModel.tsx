"use client"

// `ShirtModel` carga un GLB real desde `template.model_url` y le aplica la
// `CanvasTexture` producida por el `TextureCompositor`.
//
// Mitigaciones del módulo viejo y mejoras de rendimiento:
//   - Clonamos la escena UNA vez por URL, no por cambio de textura, para
//     NO destruir la jerarquía en cada frame.
//   - Asignamos la textura por mesh según un mapping `mesh.name → ZoneId`,
//     lo que garantiza que cada parte de la remera muestra SU región del
//     atlas (no parches aleatorios).
//   - `material.color = white` para que la textura no quede tintada.
//   - `colorSpace = SRGBColorSpace` para que los colores coincidan con la UI.
//   - `dispose()` del clon + de la textura en unmount.
//   - `frameloop="demand"` en el `<Canvas>` padre evita pintar cuando no
//     hay cambios.

import { useEffect, useMemo, useSyncExternalStore } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { DesignState, ZoneId } from "@/lib/designer/types"
import { TextureCompositor, type ZoneImageMap } from "@/components/designer/TextureCompositor"
import { PlaceholderModel } from "@/components/designer/viewer/PlaceholderModel"

// Cache de imágenes a nivel de módulo (logos tipo `dataUrl`). Reutiliza un
// `HTMLImageElement` ya cargado para el mismo `dataUrl`, y notifica a los
// suscriptores cuando una entrada se resuelve para que React re-renderice.
//
// Se expone vía `useSyncExternalStore` para evitar setState en effect.
type ImageCacheListener = () => void
const imageCache = new Map<string, HTMLImageElement>()
const imageInFlight = new Map<string, Promise<HTMLImageElement>>()
const imageCacheListeners = new Set<ImageCacheListener>()
let imageCacheVersion = 0

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return Promise.resolve(cached)
  const inflight = imageInFlight.get(src)
  if (inflight) return inflight
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      imageInFlight.delete(src)
      imageCacheVersion += 1
      imageCacheListeners.forEach((l) => l())
      resolve(img)
    }
    img.onerror = () => {
      imageInFlight.delete(src)
      imageCacheVersion += 1
      imageCacheListeners.forEach((l) => l())
      reject(new Error(`image load failed: ${src.slice(0, 32)}…`))
    }
    img.src = src
  })
  imageInFlight.set(src, promise)
  return promise
}

function subscribeImageCache(listener: ImageCacheListener): () => void {
  imageCacheListeners.add(listener)
  return () => {
    imageCacheListeners.delete(listener)
  }
}

function getImageCacheVersion(): number {
  return imageCacheVersion
}

function getCachedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src)
}

interface ShirtModelProps {
  modelUrl: string | null | undefined
  state: DesignState
}

// Devuelve un `Map<ZoneId, HTMLImageElement>` con los logos ya cargados.
// Para cualquier `dataUrl` que aún no esté en el cache, dispara la carga
// en background; el componente se re-renderiza cuando se completa gracias
// al `useSyncExternalStore` abajo.
function useLoadedLogos(state: DesignState): ZoneImageMap {
  // Suscripción: re-render cuando el cache de imágenes cambia.
  const cacheVersion = useSyncExternalStore(
    subscribeImageCache,
    getImageCacheVersion,
    getImageCacheVersion,
  )

  // Disparar la carga de cualquier `dataUrl` presente en el estado.
  // Se hace en cada render: si ya está cacheado, `loadImage` resuelve
  // sync; si no, dispara la promesa y el cache notificará al re-render.
  const dataUrls = useMemo(() => {
    const urls: Array<{ id: ZoneId; url: string }> = []
    for (const id of Object.keys(state.zones) as ZoneId[]) {
      const z = state.zones[id]
      if (z && z.type === "logo" && z.dataUrl) {
        urls.push({ id, url: z.dataUrl })
      }
    }
    return urls
  }, [state.zones])

  // Construir el map de logos resueltos (o vacíos si todavía no cargan).
  return useMemo(() => {
    const map: ZoneImageMap = new Map()
    for (const { id, url } of dataUrls) {
      const cached = getCachedImage(url)
      if (cached) map.set(id, cached)
      else void loadImage(url)
    }
    return map
    // `useSyncExternalStore` arriba se encarga de re-renderizar cuando el
    // cache se actualiza, así que `cacheVersion` es la señal reactiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrls, cacheVersion])
}

// Contrato con el modelo 3D: cada mesh del GLB debe llevar uno de estos
// nombres para que el material correcto le sea asignado.
//
//   torso_front, torso_back  → torso (frente / espalda)
//   sleeve_l, sleeve_r       → mangas
//   cuff_l, cuff_r           → puños
//   collar, neck             → cuello / solapa
//   short                    → short
//   socks                    → medias
//
// Meshes sin nombre reconocido quedan sin material asignado (usan el del
// GLB original) — útil para meshes accesorios (botones, costuras).
const MESH_TO_ZONE: Record<string, true> = {
  torso_front: true,
  torso_back: true,
  sleeve_l: true,
  sleeve_r: true,
  cuff_l: true,
  cuff_r: true,
  collar: true,
  neck: true,
  short: true,
  socks: true,
}

export function ShirtModel({ modelUrl, state }: ShirtModelProps) {
  // 0) Pre-cargar cualquier logo presente en el estado. Si todavía no
  //    está en el cache, dispara la carga y re-renderiza al resolverse.
  const logos = useLoadedLogos(state)

  // 1) Atlas 2048x2048. Se recompone sólo cuando cambia el design state
  //    o el set de logos pre-cargados.
  const canvas = useMemo(
    () => TextureCompositor.compose(state, logos),
    [state, logos],
  )

  // 2) Subimos el canvas a GPU. Reutilizamos la misma `CanvasTexture` para
  //    todos los meshes; sólo marcamos `needsUpdate` cuando cambia.
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    tex.minFilter = THREE.LinearMipMapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.needsUpdate = true
    return tex
  }, [canvas])

  // 3) Liberamos la textura cuando el componente se desmonta o cuando
  //    cambia la URL del modelo.
  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  if (!modelUrl) return <PlaceholderModel state={state} />
  return <GLBModel url={modelUrl} texture={texture} />
}

function GLBModel({ url, texture }: { url: string; texture: THREE.CanvasTexture }) {
  const { scene } = useGLTF(url)

  // Clonar la escena UNA vez por URL. `useGLTF` cachea por URL, así que el
  // `scene` es estable entre renders; sólo cambia la textura (que es la
  // misma referencia para todos los meshes, así que no re-clonamos).
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      const m = obj as THREE.Mesh
      if (!m.isMesh) return
      if (!MESH_TO_ZONE[m.name]) return
      const src = m.material as THREE.Material
      const mat = (src ?? new THREE.MeshStandardMaterial()).clone() as THREE.MeshStandardMaterial
      mat.map = texture
      // Sin tinte: si no, el atlas se mezcla con el color base del material
      // del GLB y aparecen los "parches de color incorrectos".
      mat.color = new THREE.Color("#ffffff")
      mat.needsUpdate = true
      m.material = mat
    })
    return c
    // `url` es la señal de re-clone: si cambia, `scene` cambia y queremos
    // clonar de nuevo. `useGLTF` cachea por URL así que es estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, texture, url])

  // Dispose del clon cuando se desmonta o cambia la URL.
  useEffect(() => {
    const target = cloned
    return () => {
      target.traverse((obj) => {
        const m = obj as THREE.Mesh
        if (m.isMesh) {
          ;(m.material as THREE.Material).dispose()
          m.geometry?.dispose()
        }
      })
    }
  }, [cloned])

  return <primitive object={cloned} />
}
