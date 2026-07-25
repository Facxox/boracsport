"use client"

// `ShirtModel` carga un GLB real desde `template.model_url` y le aplica la
// `CanvasTexture` producida por el `TextureCompositor`.
//
// Mitigaciones del módulo viejo:
//   - Clonamos la escena antes de mutar materiales para NO contaminar el
//     caché interno de `useGLTF`.
//   - `material.map = tex` se asigna a un `material.clone()` por mesh.
//   - `colorSpace = SRGBColorSpace` para que los colores coincidan con la UI.
//   - `anisotropy = 8` para que la textura no se vea borrosa a ángulos rasantes.

import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { DesignState } from "@/lib/designer/types"
import { TextureCompositor, type ZoneImageMap } from "@/components/designer/TextureCompositor"
import { PlaceholderModel } from "@/components/designer/viewer/PlaceholderModel"

interface ShirtModelProps {
  modelUrl: string | null | undefined
  state: DesignState
  logos: ZoneImageMap
}

export function ShirtModel({ modelUrl, state, logos }: ShirtModelProps) {
  // Solo recomponer la textura cuando cambian las entradas relevantes. Esta
  // operación es cara (2048×2048 canvas + drawImage) y no debe correr cada frame.
  const texture = useMemo(() => {
    const canvas = TextureCompositor.compose(state, logos)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [state, logos])

  if (!modelUrl) {
    return <PlaceholderModel state={state} />
  }

  return <GLBModel url={modelUrl} texture={texture} />
}

interface GLBModelProps {
  url: string
  texture: THREE.CanvasTexture
}

function GLBModel({ url, texture }: GLBModelProps) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      const m = obj as THREE.Mesh
      if (m.isMesh && m.material) {
        const mat = (m.material as THREE.Material).clone() as THREE.MeshStandardMaterial
        mat.map = texture
        mat.needsUpdate = true
        m.material = mat
      }
    })
    return c
  }, [scene, texture])
  return <primitive object={cloned} />
}
