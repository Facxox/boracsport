"use client"

import { useState, type FormEvent } from "react"
import { Mail, MessageCircle, Send } from "lucide-react"
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
import { WHATSAPP_NUMBER, WHATSAPP_QUOTE_TEMPLATE } from "@/lib/constants"
import { serialize } from "@/lib/utils/url-serializer"

interface QuoteModalProps {
  state: DesignState
}

interface QuoteForm {
  name: string
  team: string
  sizes: string
  privacy: boolean
}

const MOLD_LABEL: Record<DesignState["mold"], string> = {
  round_classic: "Cuello redondo · manga clásica",
  v_classic: "Cuello V · manga clásica",
  round_raglan: "Cuello redondo · raglan",
  v_raglan: "Cuello V · raglan",
}

const KIT_LABEL: Record<DesignState["kit"], string> = {
  shirt: "Camiseta",
  shirt_short: "Camiseta + short",
  full: "Completo (con medias)",
}

const FIELD_CLASS =
  "border-foreground/15 bg-background focus:border-brand-red h-9 w-full rounded-md border px-2 text-sm outline-none"

function buildZonesSummary(state: DesignState): string {
  const parts: string[] = []
  for (const zone of Object.values(state.zones)) {
    switch (zone.type) {
      case "text":
        parts.push(`texto "${zone.text}"`)
        break
      case "number":
        parts.push(`número "${zone.value}"`)
        break
      case "sponsor":
        parts.push(`sponsor "${zone.text}"`)
        break
      case "logo":
        parts.push("logo")
        break
      case "pattern":
        parts.push(`patrón ${zone.patternId}`)
        break
      case "color":
        parts.push(zone.color)
        break
    }
  }
  return parts.join(", ")
}

export function QuoteModal({ state }: QuoteModalProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<QuoteForm>({
    name: "",
    team: "",
    sizes: "",
    privacy: false,
  })

  function buildShareLink() {
    if (typeof window === "undefined") return ""
    const url = new URL(window.location.href)
    url.searchParams.delete("design")
    url.searchParams.set("d", serialize(state))
    return url.toString()
  }

  function renderMessage() {
    const link = buildShareLink()
    return WHATSAPP_QUOTE_TEMPLATE.replace("{name}", form.name || "—")
      .replace("{team}", form.team || "—")
      .replace("{mold}", MOLD_LABEL[state.mold])
      .replace("{kit}", KIT_LABEL[state.kit])
      .replace("{pattern}", state.pattern.id)
      .replace("{zones}", buildZonesSummary(state))
      .replace("{sizes}", form.sizes || "—")
      .replace("{link}", link)
  }

  function sendWhatsApp(event: FormEvent) {
    event.preventDefault()
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(renderMessage())}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function sendEmail() {
    const subject = `Cotización ${form.team || "uniforme"} — Borac Sport`
    const body = renderMessage()
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" variant="outline" />}>
        <MessageCircle aria-hidden />
        Cotizar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cotizar diseño</DialogTitle>
          <DialogDescription>
            Te pasamos el resumen a Borac Sport por WhatsApp o email para armar el presupuesto.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={sendWhatsApp}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Tu nombre</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={FIELD_CLASS}
              placeholder="Ej. María Pérez"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Equipo o empresa</span>
            <input
              required
              value={form.team}
              onChange={(event) => setForm((prev) => ({ ...prev, team: event.target.value }))}
              className={FIELD_CLASS}
              placeholder="Ej. Club Atlético Borac"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Talles y cantidades</span>
            <textarea
              rows={2}
              value={form.sizes}
              onChange={(event) => setForm((prev) => ({ ...prev, sizes: event.target.value }))}
              className={`${FIELD_CLASS} h-auto py-2`}
              placeholder="Ej. 10 S, 8 M, 4 L"
            />
          </label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              required
              checked={form.privacy}
              onChange={(event) => setForm((prev) => ({ ...prev, privacy: event.target.checked }))}
              className="accent-brand-red mt-0.5 h-4 w-4"
            />
            Acepto compartir los datos con Borac Sport para recibir la cotización.
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={sendEmail} disabled={!form.privacy}>
              <Mail aria-hidden />
              Email
            </Button>
            <Button type="submit" disabled={!form.privacy}>
              <Send aria-hidden />
              WhatsApp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
