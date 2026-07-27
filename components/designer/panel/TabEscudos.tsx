"use client"

import { useMemo, useState } from "react"
import {
  ChevronDown,
  Hash,
  ImageIcon,
  Megaphone,
  PaintBucket,
  Palette,
  Type,
  type LucideIcon,
} from "lucide-react"
import { PATTERNS } from "@/components/designer/patterns"
import { DESIGNER_FONTS } from "@/lib/designer/fonts"
import type { PatternId, RgbColor, ZoneId, ZoneType } from "@/lib/designer/types"
import { computeActiveZones } from "@/lib/designer/zones"
import { cn } from "@/lib/utils"
import { useDesignStore } from "@/stores/design-store"
import { ColorPicker } from "./ColorPicker"
import { FileDrop } from "./FileDrop"

const ZONE_LABEL: Record<ZoneId, string> = {
  front: "Frente",
  back: "Espalda",
  neck: "Cuello",
  collar: "Solapa",
  sleeve_l: "Manga izquierda",
  sleeve_r: "Manga derecha",
  cuff_l: "Puño izquierdo",
  cuff_r: "Puño derecho",
  short: "Short",
  short_back: "Short (atrás)",
  socks: "Medias",
  socks_back: "Medias (atrás)",
}

interface TypeOption {
  id: ZoneType
  label: string
  icon: LucideIcon
}

const TYPE_OPTIONS: ReadonlyArray<TypeOption> = [
  { id: "color", label: "Color", icon: PaintBucket },
  { id: "pattern", label: "Patrón", icon: Palette },
  { id: "text", label: "Texto", icon: Type },
  { id: "number", label: "Número", icon: Hash },
  { id: "sponsor", label: "Sponsor", icon: Megaphone },
  { id: "logo", label: "Escudo", icon: ImageIcon },
]

const INPUT_CLASS =
  "border-foreground/15 bg-background focus:border-brand-red h-9 w-full rounded-md border px-2 text-sm outline-none"

export function TabEscudos() {
  const kit = useDesignStore((s) => s.state.kit)
  const zones = useDesignStore((s) => s.state.zones)
  const setZoneType = useDesignStore((s) => s.setZoneType)
  const active = useMemo(() => computeActiveZones(kit), [kit])
  const [openId, setOpenId] = useState<ZoneId | null>(active[0] ?? null)

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Elegí una zona para agregar color, patrón, texto, dorsal, sponsor o escudo.
      </p>
      <div className="space-y-2">
        {active.map((id) => {
          const zone = zones[id]
          const open = openId === id
          return (
            <div
              key={id}
              className={cn(
                "border-foreground/10 rounded-lg border",
                open && "border-brand-red/40",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : id)}
                aria-expanded={open}
                aria-controls={`zone-${id}`}
                className="hover:bg-foreground/5 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
              >
                <span>{ZONE_LABEL[id]}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
                    {zone.type}
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                  />
                </span>
              </button>
              {open ? (
                <div id={`zone-${id}`} className="space-y-3 border-t px-3 py-3">
                  <fieldset>
                    <legend className="text-foreground/70 mb-1.5 text-xs font-semibold tracking-wider uppercase">
                      Tipo
                    </legend>
                    <div className="flex flex-wrap gap-1.5">
                      {TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon
                        const selected = zone.type === option.id
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setZoneType(id, option.id)}
                            className={cn(
                              "inline-flex min-h-9 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all",
                              selected
                                ? "border-brand-red bg-brand-red/10 text-brand-red"
                                : "border-foreground/10 hover:border-foreground/30",
                            )}
                          >
                            <Icon aria-hidden className="h-3.5 w-3.5" />
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                  <ZoneFields id={id} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ZoneFields({ id }: { id: ZoneId }) {
  const zone = useDesignStore((s) => s.state.zones[id])
  const setZoneColor = useDesignStore((s) => s.setZoneColor)
  const setZoneText = useDesignStore((s) => s.setZoneText)
  const setZoneNumber = useDesignStore((s) => s.setZoneNumber)
  const setZoneLogo = useDesignStore((s) => s.setZoneLogo)
  const setZoneSponsor = useDesignStore((s) => s.setZoneSponsor)
  const setZonePattern = useDesignStore((s) => s.setZonePattern)

  switch (zone.type) {
    case "color":
      return (
        <ColorField
          label="Color"
          value={zone.color}
          onChange={(color) => setZoneColor(id, color)}
        />
      )
    case "text":
      return (
        <TextFields
          label="Texto"
          value={zone.text}
          color={zone.color}
          fontId={zone.fontId}
          size={zone.size}
          bold={zone.bold}
          strokeColor={zone.strokeColor}
          strokeWidth={zone.strokeWidth}
          onValue={(text) => setZoneText(id, { text })}
          onColor={(color) => setZoneText(id, { color })}
          onFont={(fontId) => setZoneText(id, { fontId })}
          onSize={(size) => setZoneText(id, { size })}
          onBold={(bold) => setZoneText(id, { bold })}
          onStrokeColor={(strokeColor) => setZoneText(id, { strokeColor })}
          onStrokeWidth={(strokeWidth) => setZoneText(id, { strokeWidth })}
        />
      )
    case "number":
      return (
        <TextFields
          label="Número"
          value={zone.value}
          color={zone.color}
          fontId={zone.fontId}
          size={zone.size}
          bold={zone.bold}
          strokeColor={zone.strokeColor}
          strokeWidth={zone.strokeWidth}
          inputMode="numeric"
          onValue={(value) => setZoneNumber(id, { value })}
          onColor={(color) => setZoneNumber(id, { color })}
          onFont={(fontId) => setZoneNumber(id, { fontId })}
          onSize={(size) => setZoneNumber(id, { size })}
          onBold={(bold) => setZoneNumber(id, { bold })}
          onStrokeColor={(strokeColor) => setZoneNumber(id, { strokeColor })}
          onStrokeWidth={(strokeWidth) => setZoneNumber(id, { strokeWidth })}
        />
      )
    case "sponsor":
      return (
        <TextFields
          label="Sponsor"
          value={zone.text}
          color={zone.color}
          fontId={zone.fontId}
          size={zone.size}
          bold={zone.bold}
          onValue={(text) => setZoneSponsor(id, { text })}
          onColor={(color) => setZoneSponsor(id, { color })}
          onFont={(fontId) => setZoneSponsor(id, { fontId })}
          onSize={(size) => setZoneSponsor(id, { size })}
          onBold={(bold) => setZoneSponsor(id, { bold })}
        />
      )
    case "logo":
      return (
        <div className="space-y-3">
          <FileDrop value={zone.dataUrl} onChange={(dataUrl) => setZoneLogo(id, { dataUrl })} />
          <RangeField
            label="Escala"
            value={zone.scale}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(scale) => setZoneLogo(id, { scale })}
          />
          <RangeField
            label="Posición horizontal"
            value={zone.offsetX}
            min={-300}
            max={300}
            step={5}
            onChange={(offsetX) => setZoneLogo(id, { offsetX })}
          />
          <RangeField
            label="Posición vertical"
            value={zone.offsetY}
            min={-300}
            max={300}
            step={5}
            onChange={(offsetY) => setZoneLogo(id, { offsetY })}
          />
        </div>
      )
    case "pattern":
      return (
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Patrón</span>
            <select
              value={zone.patternId}
              onChange={(event) => setZonePattern(id, { patternId: event.target.value as PatternId })}
              className={INPUT_CLASS}
            >
              {PATTERNS.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.label}
                </option>
              ))}
            </select>
          </label>
          <ColorField
            label="Color 1"
            value={zone.color1}
            onChange={(color1) => setZonePattern(id, { color1 })}
          />
          <ColorField
            label="Color 2"
            value={zone.color2}
            onChange={(color2) => setZonePattern(id, { color2 })}
          />
          <RangeField
            label="Escala"
            value={zone.scale}
            min={0.5}
            max={2}
            step={0.05}
            onChange={(scale) => setZonePattern(id, { scale })}
          />
        </div>
      )
  }
}

interface TextFieldsProps {
  label: string
  value: string
  color: RgbColor
  fontId: string
  size: number
  bold: boolean
  inputMode?: "numeric"
  strokeColor?: RgbColor
  strokeWidth?: number
  onValue: (value: string) => void
  onColor: (color: RgbColor) => void
  onFont: (fontId: string) => void
  onSize: (size: number) => void
  onBold: (bold: boolean) => void
  onStrokeColor?: (color: RgbColor) => void
  onStrokeWidth?: (width: number) => void
}

function TextFields(props: TextFieldsProps) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium">{props.label}</span>
        <input
          type="text"
          inputMode={props.inputMode}
          value={props.value}
          maxLength={40}
          onChange={(event) => props.onValue(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Tipografía</span>
        <select
          value={props.fontId}
          onChange={(event) => props.onFont(event.target.value)}
          className={INPUT_CLASS}
        >
          {DESIGNER_FONTS.map((font) => (
            <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <ColorField label="Color" value={props.color} onChange={props.onColor} />
      <RangeField label="Tamaño" value={props.size} min={40} max={700} step={10} onChange={props.onSize} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={props.bold}
          onChange={(event) => props.onBold(event.target.checked)}
          className="accent-brand-red h-4 w-4"
        />
        Negrita
      </label>
      {props.onStrokeColor && props.strokeColor !== undefined ? (
        <ColorField label="Color del borde" value={props.strokeColor} onChange={props.onStrokeColor} />
      ) : null}
      {props.onStrokeWidth && props.strokeWidth !== undefined ? (
        <RangeField
          label="Grosor del borde"
          value={props.strokeWidth}
          min={0}
          max={30}
          step={1}
          onChange={props.onStrokeWidth}
        />
      ) : null}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: RgbColor
  onChange: (color: RgbColor) => void
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <ColorPicker value={value} onChange={onChange} ariaLabel={label} />
    </div>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between text-sm font-medium">
        {label}
        <span className="text-muted-foreground font-mono text-[11px]">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-brand-red w-full"
      />
    </label>
  )
}
