"use client"

import { useState, useTransition } from "react"
import { Clipboard, Download, Save } from "lucide-react"
import { toast } from "sonner"
import { saveDesignAction } from "@/app/cuenta/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { DesignState } from "@/lib/designer/types"
import { exportCanvasPng } from "@/lib/utils/png-export"
import { serialize } from "@/lib/utils/url-serializer"

interface SaveDesignModalProps {
  state: DesignState
  getCanvas: () => HTMLCanvasElement | null
}

export function SaveDesignModal({ state, getCanvas }: SaveDesignModalProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  async function downloadPng() {
    const canvas = getCanvas()
    if (!canvas) {
      toast.error("El visor todavía no está listo.")
      return
    }
    try {
      await exportCanvasPng(canvas, `borac-diseno-${Date.now()}.png`)
    } catch {
      toast.error("No pudimos descargar la imagen.")
    }
  }

  async function copyLink() {
    const url = new URL(window.location.href)
    url.searchParams.delete("design")
    url.searchParams.set("d", serialize(state))
    try {
      await navigator.clipboard.writeText(url.toString())
      toast.success("Link copiado.")
    } catch {
      toast.error("No pudimos copiar el link.")
    }
  }

  function saveToAccount() {
    startTransition(async () => {
      try {
        const result = await saveDesignAction(state)
        if (!result.ok && result.reason === "unauthenticated") {
          toast.error("Iniciá sesión para guardar en tu cuenta.")
          return
        }
        if (!result.ok) {
          toast.error("El diseño no es válido.")
          return
        }
        toast.success("Diseño guardado en tu cuenta.")
        setOpen(false)
      } catch {
        toast.error("No pudimos guardar el diseño.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <Save aria-hidden />
        Guardar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar diseño</DialogTitle>
          <DialogDescription>
            Descargá una imagen, compartí un link o guardalo en tu cuenta.
            Las imágenes subidas no se incluyen en el link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button type="button" variant="outline" onClick={downloadPng}>
            <Download aria-hidden />
            Descargar PNG
          </Button>
          <Button type="button" variant="outline" onClick={copyLink}>
            <Clipboard aria-hidden />
            Copiar link
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" disabled={pending} onClick={saveToAccount}>
            <Save aria-hidden />
            {pending ? "Guardando…" : "Guardar en mi cuenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
