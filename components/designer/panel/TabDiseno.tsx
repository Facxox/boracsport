"use client"

// Pestaña "Diseño" — patrón global del kit + colores del patrón + escala.

import { useDesignStore } from "@/stores/design-store"
import { PATTERNS } from "@/components/designer/patterns"
import { ColorPicker } from "./ColorPicker"
import { PatternGrid } from "./PatternGrid"
import { ContinuousPatternBanner } from "./ContinuousPatternBanner"

export function TabDiseno() {
  const pattern = useDesignStore((s) => s.state.pattern)
  const setPatternColor1 = useDesignStore((s) => s.setPatternColor1)
  const setPatternColor2 = useDesignStore((s) => s.setPatternColor2)
  const setPatternScale = useDesignStore((s) => s.setPatternScale)

  const descriptor = PATTERNS.find((p) => p.id === pattern.id)

  return (
    <div className="space-y-5">
      <PatternGrid />
      <ContinuousPatternBanner />

      <div className="space-y-3">
        <h3 className="text-foreground/70 text-xs font-semibold tracking-wider uppercase">
          Colores del patrón
        </h3>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Color 1</span>
          </div>
          <ColorPicker
            value={pattern.color1}
            onChange={setPatternColor1}
            ariaLabel="Color 1 del patrón"
          />
        </div>
        {descriptor?.needsTwoColors ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Color 2</span>
            </div>
            <ColorPicker
              value={pattern.color2}
              onChange={setPatternColor2}
              ariaLabel="Color 2 del patrón"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">Escala</span>
          <span className="text-muted-foreground text-[11px] font-mono">
            {pattern.scale.toFixed(2)}×
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={pattern.scale}
          onChange={(e) => setPatternScale(Number(e.target.value))}
          aria-label="Escala del patrón"
          className="accent-brand-red w-full"
        />
      </div>

      <span className="sr-only">Patrón actual: {pattern.id}</span>
    </div>
  )
}
