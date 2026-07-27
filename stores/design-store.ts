// Store Zustand del diseñador.
// - Persiste en localStorage (clave "borac-design-v1").
// - El flag `_hasHydrated` vive en memoria (no se persiste).
// - El store IGNORA los JSONB legacy de las plantillas (`editable_zones`,
//   `default_config`). El comportamiento lo define `createDefaultDesign`.
// - Diseños con `version !== 1` se descartan en rehydrate.

"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  DesignState,
  KitId,
  MoldId,
  PatternId,
  RgbColor,
  ZoneConfig,
  ZoneId,
  ZoneType,
} from "@/lib/designer/types"
import { BORAC_DESIGN_STORAGE_KEY } from "@/lib/constants"
import { createDefaultDesign } from "@/lib/designer/default-design"
import { computeActiveZones } from "@/lib/designer/zones"

interface DesignStoreState {
  state: DesignState
  _hasHydrated: boolean

  load: (templateId: string | null) => void
  reset: (templateId: string | null) => void

  setMold: (mold: MoldId) => void
  setKit: (kit: KitId) => void

  setPattern: (pattern: PatternId) => void
  setPatternColor1: (color: RgbColor) => void
  setPatternColor2: (color: RgbColor) => void
  setPatternScale: (scale: number) => void

  setZoneType: (id: ZoneId, type: ZoneType) => void
  // Devuelve una zona por defecto del tipo solicitado. Útil para que el panel
  // cambie el "kind" manteniendo los defaults visuales del módulo.
  defaultZoneOfType: (id: ZoneId, type: ZoneType) => ZoneConfig

  // Setters específicos por tipo. Cada uno pisa el campo manteniendo el resto
  // (no se reemplaza la zona entera para no perder stroke/size de un text).
  setZoneColor: (id: ZoneId, color: RgbColor) => void
  setZoneText: (id: ZoneId, patch: Partial<Extract<ZoneConfig, { type: "text" }>>) => void
  setZoneNumber: (id: ZoneId, patch: Partial<Extract<ZoneConfig, { type: "number" }>>) => void
  setZoneLogo: (id: ZoneId, patch: Partial<Extract<ZoneConfig, { type: "logo" }>>) => void
  setZoneSponsor: (id: ZoneId, patch: Partial<Extract<ZoneConfig, { type: "sponsor" }>>) => void
  setZonePattern: (id: ZoneId, patch: Partial<Extract<ZoneConfig, { type: "pattern" }>>) => void

  importState: (next: DesignState) => void

  _setHasHydrated: (b: boolean) => void
}

function withUpdatedAt(s: DesignState): DesignState {
  return { ...s, updatedAt: new Date().toISOString() }
}

export const useDesignStore = create<DesignStoreState>()(
  persist(
    (set, get) => ({
      state: createDefaultDesign(null),
      _hasHydrated: false,

      load: (templateId) =>
        set((prev) => {
          // Si ya hay un templateId distinto, NO pisar el diseño en memoria:
          // el usuario quizás ya empezó a editar. Solo sembrar si está vacío.
          const cur = prev.state
          if (cur.templateId === templateId) return prev
          return { state: withUpdatedAt(createDefaultDesign(templateId, cur.mold, cur.kit)) }
        }),

      reset: (templateId) =>
        set(() => ({ state: withUpdatedAt(createDefaultDesign(templateId)) })),

      setMold: (mold) =>
        set((prev) => ({ state: withUpdatedAt({ ...prev.state, mold }) })),

      setKit: (kit) =>
        set((prev) => ({ state: withUpdatedAt({ ...prev.state, kit }) })),

      setPattern: (pattern) =>
        set((prev) => ({
          state: withUpdatedAt({ ...prev.state, pattern: { ...prev.state.pattern, id: pattern } }),
        })),
      setPatternColor1: (color) =>
        set((prev) => ({
          state: withUpdatedAt({ ...prev.state, pattern: { ...prev.state.pattern, color1: color } }),
        })),
      setPatternColor2: (color) =>
        set((prev) => ({
          state: withUpdatedAt({ ...prev.state, pattern: { ...prev.state.pattern, color2: color } }),
        })),
      setPatternScale: (scale) =>
        set((prev) => ({
          state: withUpdatedAt({ ...prev.state, pattern: { ...prev.state.pattern, scale } }),
        })),

      defaultZoneOfType: (id, type) => {
        switch (type) {
          case "color":
            return { id, type: "color", color: "#0f172a" as RgbColor }
          case "text":
            return {
              id,
              type: "text",
              text: "EQUIPO",
              color: "#f4f4f5" as RgbColor,
              fontId: "syne",
              size: 220,
              bold: true,
              strokeColor: "#000000" as RgbColor,
              strokeWidth: 0,
            }
          case "number":
            return {
              id,
              type: "number",
              value: "10",
              color: "#f4f4f5" as RgbColor,
              fontId: "bebas",
              size: 520,
              bold: true,
              strokeColor: "#000000" as RgbColor,
              strokeWidth: 8,
            }
          case "logo":
            return { id, type: "logo", dataUrl: null, scale: 0.4, offsetX: 0, offsetY: 0 }
          case "sponsor":
            return {
              id,
              type: "sponsor",
              text: "SPONSOR",
              color: "#f4f4f5" as RgbColor,
              fontId: "syne",
              size: 220,
              bold: true,
            }
          case "pattern":
            return {
              id,
              type: "pattern",
              patternId: "hoops",
              color1: "#0f172a" as RgbColor,
              color2: "#dc2626" as RgbColor,
              scale: 1,
            }
        }
      },

      setZoneType: (id, type) =>
        set((prev) => {
          const def = (get().defaultZoneOfType as (i: ZoneId, t: ZoneType) => ZoneConfig)(id, type)
          // Conservamos mold/kit y updatedAt; zonas las reemplazamos sólo en
          // esta entrada.
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: def },
            }),
          }
        }),

      setZoneColor: (id, color) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "color") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, color } },
            }),
          }
        }),

      setZoneText: (id, patch) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "text") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, ...patch } },
            }),
          }
        }),

      setZoneNumber: (id, patch) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "number") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, ...patch } },
            }),
          }
        }),

      setZoneLogo: (id, patch) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "logo") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, ...patch } },
            }),
          }
        }),

      setZoneSponsor: (id, patch) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "sponsor") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, ...patch } },
            }),
          }
        }),

      setZonePattern: (id, patch) =>
        set((prev) => {
          const cur = prev.state.zones[id]
          if (!cur || cur.type !== "pattern") return prev
          return {
            state: withUpdatedAt({
              ...prev.state,
              zones: { ...prev.state.zones, [id]: { ...cur, ...patch } },
            }),
          }
        }),

      importState: (next) =>
        set(() => ({ state: withUpdatedAt(next) })),

      _setHasHydrated: (b) => set({ _hasHydrated: b }),
    }),
    {
      name: BORAC_DESIGN_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el state. El flag de hidratación vive en memoria.
      partialize: (s) => ({ state: s.state }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[design] rehydrate failed, clearing corrupted storage:", error)
          try {
            localStorage.removeItem(BORAC_DESIGN_STORAGE_KEY)
          } catch {
            /* ignore */
          }
          state?._setHasHydrated(true)
          return
        }
        if (state && state.state.version !== 1) {
          // Snapshot legacy del módulo viejo → descartar.
          try {
            localStorage.removeItem(BORAC_DESIGN_STORAGE_KEY)
          } catch {
            /* ignore */
          }
          state.state = createDefaultDesign(null)
        }
        state?._setHasHydrated(true)
      },
    },
  ),
)

// Hook de hidratación. Equivalente a `useCartHasHydrated` (ver cart-store).
export function useDesignHasHydrated(): boolean {
  return useDesignStore((s) => s._hasHydrated)
}

// Selector: lista de zonas visibles según kit. Memoizar en el componente
// con `useMemo` si se usa en render intensivo.
export function selectActiveZones(kit: KitId) {
  return computeActiveZones(kit)
}
