"use client"

import { useState, useTransition } from "react"
import { Building2, Check, ChevronRight, Copy, Loader2, Receipt, Smartphone, Upload } from "lucide-react"
import { toast } from "sonner"
import {
  BANK_ACCOUNTS,
  TAX_HOLDER,
  TRANSFER_INSTRUCTIONS,
  TRANSFER_SENIA_MESSAGE,
} from "@/lib/config/banking"
import { WHATSAPP_NUMBER } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/types/cart"

const ACCOUNT = BANK_ACCOUNTS[0]

interface TransferOptionsProps {
  items?: CartItem[]
  customer?: { name: string; email: string; phone: string; address?: string }
}

export function TransferOptions({ items, customer }: TransferOptionsProps) {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startReceiptTransition] = useTransition()

  async function registerOrder() {
    if (!items || !customer || registering) return
    setRegistering(true)
    setError(null)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod: "transfer",
          customer: { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Error ${res.status} al registrar el pedido`)
      setOrderId(data.orderId)
      toast.success("Pedido registrado. Subí tu comprobante cuando termines la transferencia.")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No se pudo registrar el pedido"
      setError(message)
      toast.error(message)
    } finally {
      setRegistering(false)
    }
  }

  async function uploadReceipt(file: File) {
    if (!orderId) {
      toast.error("Primero registrá el pedido")
      return
    }
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("guest_name", customer?.name ?? "")
      fd.append("guest_email", customer?.email ?? "")
      fd.append("guest_phone", customer?.phone ?? "")
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "No se pudo subir el comprobante")
      setReceiptUrl(data.url ?? null)
      toast.success("Comprobante subido")
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No se pudo subir"
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const canRegister = Boolean(items && customer && customer.name && customer.email && customer.phone)

  return (
    <div className="space-y-5">
      {/* Cuenta */}
      <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Transferencia BROU</p>
            <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight">{ACCOUNT.name}</h3>
            <p className="text-muted-foreground text-xs">{ACCOUNT.accountType}</p>
          </div>
          <Building2 className="h-5 w-5 text-[#dc2626]" />
        </header>

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wider">Titular</dt>
            <dd className="mt-1 font-semibold">{TAX_HOLDER.legalName}</dd>
          </div>

          <div className="rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/5 p-4">
            <dt className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Cuenta principal</dt>
            <dd className="mt-1 flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-bold tracking-wide">{ACCOUNT.accountNumber}</code>
              <CopyButton value={ACCOUNT.accountNumber} />
            </dd>
          </div>

          {ACCOUNT.legacyAccountNumber ? (
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">Cuenta anterior (compatibilidad)</dt>
              <dd className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <code className="font-mono text-sm">{ACCOUNT.legacyAccountNumber}</code>
                <CopyButton value={ACCOUNT.legacyAccountNumber} />
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {/* Instrucciones */}
      <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
        <header className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#dc2626]" />
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider">Cómo pagar</h3>
        </header>
        <ol className="mt-3 space-y-2 text-sm text-white/80">
          {TRANSFER_INSTRUCTIONS.map((line, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="bg-white/5 text-muted-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground mt-3 text-xs">
          Las terminales de <strong className="text-white/70">Abitab</strong> y <strong className="text-white/70">Redpagos</strong>{" "}
          aceptan pagos a cuentas BROU usando el número principal.
        </p>
      </section>

      {/* Mensaje seña */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-sm leading-relaxed text-amber-100/90">{TRANSFER_SENIA_MESSAGE}</p>
        </div>
      </section>

      {/* Acciones */}
      {items && customer ? (
        <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            <p className="font-medium text-white/80">Paso a paso</p>
            <ol className="mt-2 space-y-1.5">
              <li className="flex gap-2">
                <span className="bg-white/10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">1</span>
                <span>Registrá el pedido con el botón de abajo.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-white/10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">2</span>
                <span>Transferí a la cuenta BROU de arriba.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-white/10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">3</span>
                <span>Subí el comprobante y avisanos por WhatsApp.</span>
              </li>
            </ol>
            <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Confirmamos en horario laboral.
            </p>
          </div>
          <div className="space-y-3">
            {!orderId ? (
              <button
                type="button"
                onClick={() => void registerOrder()}
                disabled={!canRegister || registering}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#dc2626] px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
              >
                {registering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando pedido…
                  </>
                ) : (
                  <>
                    Registrar pedido por transferencia
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <>
                <p className="text-muted-foreground text-center text-xs">
                  Pedido <span className="font-mono text-white/70">#{orderId.slice(0, 8)}</span> registrado.
                </p>
                <ReceiptUploader
                  orderId={orderId}
                  uploading={uploading}
                  onUpload={uploadReceipt}
                  receiptUrl={receiptUrl}
                />
                <WhatsAppReceiptButton orderId={orderId} customer={customer} accountNumber={ACCOUNT.accountNumber} />
              </>
            )}
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Número copiado")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("No se pudo copiar")
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium transition-colors",
        "hover:bg-white/10 hover:border-white/20",
      )}
      aria-label={`Copiar ${value}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-300">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}

function ReceiptUploader({
  orderId,
  uploading,
  receiptUrl,
  onUpload,
}: {
  orderId: string
  uploading: boolean
  receiptUrl: string | null
  onUpload: (file: File) => Promise<void>
}) {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      void onUpload(file)
    }
  }

  return (
    <label
      htmlFor={`receipt-${orderId}`}
      className={cn(
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-black/20 px-4 py-4 text-sm transition-colors hover:border-[#dc2626]/60",
        uploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={`receipt-${orderId}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />
      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo comprobante…
        </>
      ) : receiptUrl ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-300">Comprobante subido · Subir otro</span>
        </>
      ) : (
        <>
          <Upload className="h-4 w-4" />
          Subir foto del comprobante (JPG/PNG/WEBP, máx 8MB)
        </>
      )}
    </label>
  )
}

function WhatsAppReceiptButton({
  orderId,
  customer,
  accountNumber,
}: {
  orderId: string
  customer: { name: string; email: string; phone: string }
  accountNumber: string
}) {
  const message = [
    `Hola! Soy ${customer.name || "cliente"}.`,
    `Acabo de hacer una transferencia al BROU ${accountNumber}.`,
    `Pedido #${orderId.slice(0, 8)}.`,
    "Te adjunto el comprobante en este chat para que confirmen el pago y procesen la seña.",
  ].join("\n")
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20"
    >
      Enviar comprobante por WhatsApp
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}