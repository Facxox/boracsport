"use client"

import { useId, useState, type ChangeEvent, type DragEvent } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MAX_FILE_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml"])

interface FileDropProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  label?: string
}

export function FileDrop({ value, onChange, label = "Escudo o logo" }: FileDropProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  function readFile(file: File) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      toast.error("Usá una imagen PNG, JPG o SVG.")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("La imagen no puede superar los 2 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result)
    }
    reader.onerror = () => toast.error("No pudimos leer la imagen.")
    reader.readAsDataURL(file)
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) readFile(file)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-foreground/20 hover:border-foreground/40 flex min-h-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed p-3 text-center transition-colors",
          dragging && "border-brand-red bg-brand-red/5",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Vista previa del archivo" className="max-h-28 max-w-full object-contain" />
        ) : (
          <span className="text-muted-foreground flex flex-col items-center gap-1.5 text-xs">
            <ImagePlus aria-hidden className="h-6 w-6" />
            Arrastrá una imagen o elegí un archivo
            <span className="text-[10px]">PNG, JPG o SVG · máximo 2 MB</span>
          </span>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleInput}
        className="sr-only"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
          Quitar imagen
        </button>
      ) : null}
    </div>
  )
}
