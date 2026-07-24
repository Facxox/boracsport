"use client"

import { useCallback, useId, useRef, useState } from "react"
import Image from "next/image"
import { ArrowDown, ArrowUp, Loader2, Trash2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { safeImageUrl } from "@/lib/safe-image"
import { createClient } from "@/lib/supabase/client"

export type DropzoneKind = "image" | "model" | "media"

interface FileDropzoneProps {
  bucket: "boracsport_products" | "boracsport_templates" | "boracsport_hero"
  prefix: string
  kind: DropzoneKind
  value: string[]
  onChange: (urls: string[]) => void
  accept?: string
  maxFiles?: number
  label?: string
  emptyHint?: string
}

const ACCEPT_BY_KIND: Record<DropzoneKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  model: ".glb,.gltf,model/gltf-binary,model/gltf+json",
  media: "image/jpeg,image/png,image/webp,video/mp4,video/webm",
}

function safeUrl(u: string): string | null {
  try {
    const url = new URL(u, "https://placeholder.local")
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return u
  } catch {
    return null
  }
}

export function FileDropzone({
  bucket,
  prefix,
  kind,
  value,
  onChange,
  accept,
  maxFiles = 12,
  label,
  emptyHint,
}: FileDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ name: string; pct: number }[]>([])

  const acceptAttr = accept ?? ACCEPT_BY_KIND[kind]

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      // Dedupe por nombre+tamaño en este lote y contra los ya subidos.
      // (No leemos bytes para no duplicar trabajo; la key es estable para
      // archivos idénticos seleccionados dos veces.)
      const seen = new Set<string>()
      const unique = files.filter((f) => {
        const k = `${f.name}|${f.size}|${f.lastModified}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      const dupes = files.length - unique.length
      if (dupes > 0) toast.message(`${dupes} archivo${dupes === 1 ? "" : "s"} duplicado${dupes === 1 ? "" : "s"} se omitió${dupes === 1 ? "" : "n"}.`)
      if (unique.length === 0) return
      const remaining = Math.max(0, maxFiles - value.length)
      if (remaining <= 0) {
        toast.error(`Máximo ${maxFiles} archivos`)
        return
      }
      const slice = unique.slice(0, remaining)
      setBusy(true)
      setProgress(slice.map((f) => ({ name: f.name, pct: 0 })))
      try {
        // 1) Pedir al backend una signed upload URL por archivo (metadata JSON,
        //    el body nunca toca el body-cap de Vercel porque son pocos bytes).
        const metadata = {
          mode: "sign",
          bucket,
          prefix,
          files: slice.map((f) => ({
            filename: f.name,
            contentType:
              f.type ||
              (kind === "model"
                ? /\.gltf$/i.test(f.name)
                  ? "model/gltf+json"
                  : "model/gltf-binary"
                : "application/octet-stream"),
            size: f.size,
          })),
        }
        const tick = setInterval(() => {
          setProgress((prev) => prev.map((p) => (p.pct < 90 ? { ...p, pct: p.pct + 10 } : p)))
        }, 150)
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        })
        if (!res.ok) {
          clearInterval(tick)
          const { error } = (await res.json().catch(() => ({ error: "Error" }))) as { error?: string }
          throw new Error(error ?? `Error ${res.status}`)
        }
        const data = (await res.json()) as {
          files: Array<{ path: string; token: string; signedUrl: string; publicUrl: string }>
        }

        // 2) Subir cada archivo DIRECTO a Supabase Storage con la signed URL
        //    (TUS resumible, soporta archivos >300MB sin pasar por Vercel).
        const supabase = createClient()
        const uploadedUrls: string[] = []
        for (let i = 0; i < slice.length; i++) {
          const file = slice[i]
          const slot = data.files[i]
          if (!slot) throw new Error("Falta slot firmado para un archivo")
          const { error: upErr } = await supabase.storage
            .from(bucket)
            .uploadToSignedUrl(slot.path, slot.token, file, { upsert: false })
          if (upErr) {
            clearInterval(tick)
            throw new Error(upErr.message)
          }
          uploadedUrls.push(slot.publicUrl)
          setProgress((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, pct: 100 } : p)),
          )
        }
        clearInterval(tick)
        onChange([...value, ...uploadedUrls])
        toast.success(`${uploadedUrls.length} archivo${uploadedUrls.length === 1 ? "" : "s"} subido${uploadedUrls.length === 1 ? "" : "s"}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir")
      } finally {
        setBusy(false)
        setProgress([])
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [bucket, prefix, value, onChange, maxFiles],
  )

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    void upload(files)
  }

  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    void upload(files)
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  function move(url: string, dir: -1 | 1) {
    const idx = value.indexOf(url)
    if (idx < 0) return
    const next = idx + dir
    if (next < 0 || next >= value.length) return
    const copy = [...value]
    const [item] = copy.splice(idx, 1)
    copy.splice(next, 0, item)
    onChange(copy)
  }

  return (
    <div className="grid gap-3">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        accept={acceptAttr}
        onChange={onPick}
        className="hidden"
      />
      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors " +
          (dragging
            ? "border-[#dc2626] bg-[#dc2626]/5"
            : "border-white/15 bg-black/20 hover:border-white/30")
        }
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[#dc2626]" />
            <p className="text-sm">Subiendo {progress.length} archivo{progress.length === 1 ? "" : "s"}…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-white/60" />
            <p className="text-sm">
              <span className="font-semibold text-[#dc2626]">Arrastrá</span> o hacé click para subir
            </p>
            <p className="text-xs text-white/50">
              {label ?? (kind === "model" ? ".glb / .gltf" : kind === "media" ? "Imágenes o video" : "Imágenes JPG, PNG o WebP")}
              {emptyHint ? ` · ${emptyHint}` : ""}
            </p>
          </>
        )}
      </label>

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, idx) => (
            <li
              key={url}
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/30"
            >
              <div className="aspect-square w-full">
                {kind === "media" && /\.(mp4|webm)$/i.test(url) ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline />
                ) : kind === "model" ? (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/60">.glb / .gltf</div>
                ) : (
                  safeImageUrl(url) ? (
                    <Image
                      src={safeImageUrl(url) as string}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[10px] text-white/40">
                      URL no válida
                    </div>
                  )
                )}
              </div>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(url, -1)}
                  disabled={idx === 0}
                  className="rounded p-1 text-white/80 hover:bg-white/10 disabled:opacity-30"
                  aria-label="Mover arriba"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(url, 1)}
                  disabled={idx === value.length - 1}
                  className="rounded p-1 text-white/80 hover:bg-white/10 disabled:opacity-30"
                  aria-label="Mover abajo"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="rounded p-1 text-red-400 hover:bg-red-500/20"
                  aria-label="Quitar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {idx === 0 && kind !== "model" ? (
                <span className="absolute bottom-1 left-1 rounded bg-[#dc2626] px-1.5 py-0.5 text-[10px] font-bold text-black">
                  Portada
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Hidden fields so the URL list is submitted with the form. */}
      {value.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}
      {value.length === 0 ? <input type="hidden" name="images" value="" /> : null}
    </div>
  )
}

export function HiddenUrlField({ name, value }: { name: string; value: string }) {
  return <input type="hidden" name={name} value={value} />
}