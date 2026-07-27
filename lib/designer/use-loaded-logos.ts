// Hook que precarga los `dataUrl` de logos presentes en un `DesignState`.
//
// Los logos viven como `dataUrl` en cada `ZoneConfig` de tipo "logo". Antes
// de dibujar necesitamos un `HTMLImageElement` ya cargado. Esta util:
//
//   1. Mantiene un cache a nivel de módulo (un logo idéntico sólo se
//      decodifica una vez).
//   2. Dispara la carga en background de cualquier `dataUrl` nuevo.
//   3. Notifica a los suscriptores cuando un logo se resuelve.
//
// Se expone vía `useSyncExternalStore` para evitar `setState` dentro de
// `useEffect` (que es propenso a re-renders innecesarios).

import { useMemo, useSyncExternalStore } from "react"
import type { DesignState, ZoneId } from "@/lib/designer/types"

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

export type ZoneImageMap = Map<ZoneId, HTMLImageElement>

/**
 * Devuelve un `Map<ZoneId, HTMLImageElement>` con los logos del estado
 * actualmente cargados. Para cualquier `dataUrl` aún no cacheado, dispara
 * la carga en background y re-renderiza cuando se completa.
 */
export function useLoadedLogos(state: DesignState): ZoneImageMap {
  // Re-render cuando el cache de imágenes cambia.
  const cacheVersion = useSyncExternalStore(
    subscribeImageCache,
    getImageCacheVersion,
    getImageCacheVersion,
  )

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

  return useMemo(() => {
    const map: ZoneImageMap = new Map()
    for (const { id, url } of dataUrls) {
      const cached = getCachedImage(url)
      if (cached) map.set(id, cached)
      else void loadImage(url)
    }
    return map
    // `useSyncExternalStore` se encarga de re-renderizar cuando el cache
    // se actualiza, así que `cacheVersion` es la señal reactiva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrls, cacheVersion])
}