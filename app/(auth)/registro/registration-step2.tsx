"use client"

// Paso 2 del registro: selección de intereses + signUp.
// Lee los datos del paso 1 desde la query string. La contraseña viene de
// sessionStorage (la guardó el paso 1).

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useCustomerStore } from "@/stores/customer-store"
import { Stepper } from "./registration-step1"

const REG_PASSWORD_KEY = "borac-reg-password"

interface Card {
  slug: string
  title: string
  emoji: string
  description: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegistrationStep2({
  cards,
  step1Data,
}: {
  cards: Card[]
  step1Data: Step1Data
}) {
  const router = useRouter()
  const setStored = useCustomerStore((s) => s.setProfile)

  const [intereses, setIntereses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  const valid =
    EMAIL_REGEX.test(step1Data.email) &&
    step1Data.fullName.trim().length >= 3 &&
    step1Data.phone.replace(/\D/g, "").length >= 6

  function toggleInterest(slug: string) {
    setIntereses((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  function back() {
    const params = new URLSearchParams({
      name: step1Data.fullName,
      email: step1Data.email,
      phone: step1Data.phone,
    })
    router.push(`/registro?step=datos&${params.toString()}`)
  }

  async function onConfirm() {
    if (!valid || intereses.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const password =
        typeof window !== "undefined"
          ? sessionStorage.getItem(REG_PASSWORD_KEY) ?? ""
          : ""
      if (!password) {
        setError("Tu sesión expiró. Volvé al paso 1.")
        setLoading(false)
        return
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password,
        options: {
          data: {
            full_name: step1Data.fullName,
            phone: step1Data.phone,
            site: "boracsport",
            intereses,
          },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      // Limpiamos el password del sessionStorage apenas se usa.
      if (typeof window !== "undefined") sessionStorage.removeItem(REG_PASSWORD_KEY)
      setStored({ name: step1Data.fullName, email: step1Data.email, phone: step1Data.phone })

      if (data.session) {
        router.push("/cuenta")
        router.refresh()
      } else {
        router.push(
          `/registro/confirmacion?email=${encodeURIComponent(step1Data.email)}`,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setResending(true)
    setResendMsg(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email: step1Data.email,
      })
      if (err) {
        setResendMsg(err.message)
      } else {
        setResendMsg("Email reenviado. Revisá tu casilla.")
      }
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : "No se pudo reenviar")
    } finally {
      setResending(false)
    }
  }

  if (!valid) {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <p className="text-sm text-white/80">
          Faltan datos del paso 1. Volvé a completarlo.
        </p>
        <div className="mt-4">
          <Button onClick={back}>Volver al paso 1</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <Stepper current={2} />
      <h1 className="font-display mt-4 text-2xl font-extrabold">¿Qué te interesa?</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Elegí una o más categorías. Vamos a personalizar tu experiencia.
      </p>

      {cards.length === 0 ? (
        <p className="mt-6 text-sm text-white/60">
          Aún no hay categorías activas. Pedile al administrador que las cree desde el panel.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const selected = intereses.includes(card.slug)
            return (
              <InterestCard
                key={card.slug}
                card={card}
                selected={selected}
                onClick={() => toggleInterest(card.slug)}
              />
            )
          })}
        </div>
      )}

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={back} disabled={loading}>
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={intereses.length === 0 || loading}
          className="bg-brand-red text-foreground hover:bg-[#ef4444]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta…
            </>
          ) : (
            `Crear cuenta${intereses.length > 0 ? ` (${intereses.length})` : ""}`
          )}
        </Button>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        ¿Necesitás volver a revisar tus datos?{" "}
        <Link href="/registro?step=datos" className="underline">
          Editar datos
        </Link>
      </p>

      {/* Detalle: si el botón "Atrás" no es suficiente, permitimos reenviar
          el email de confirmación (útil si Supabase requiere confirmación y
          el primer email no llegó). Lo dejamos oculto detrás de un cliente
          que pueda llamar a supabase.auth.resend. */}
      <details className="text-muted-foreground mt-3 text-xs">
        <summary className="hover:text-foreground cursor-pointer">
          ¿No te llegó el email de confirmación?
        </summary>
        <div className="mt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onResend}
            disabled={resending}
          >
            {resending ? "Reenviando…" : "Reenviar email"}
          </Button>
          {resendMsg ? (
            <p className="mt-2 text-xs">{resendMsg}</p>
          ) : null}
        </div>
      </details>
    </div>
  )
}

type Step1Data = {
  fullName: string
  email: string
  phone: string
  password: string
}

function InterestCard({
  card,
  selected,
  onClick,
}: {
  card: Card
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors " +
        (selected
          ? "border-[#dc2626] bg-brand-red/5 motion-safe:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]"
          : "border-white/10 hover:border-white/25")
      }
    >
      <span className="text-2xl" aria-hidden>
        {card.emoji}
      </span>
      <span className="text-sm font-semibold">{card.title}</span>
      {card.description ? (
        <span className="text-muted-foreground text-xs leading-snug">
          {card.description}
        </span>
      ) : null}
      {selected ? (
        <span
          aria-hidden
          className="bg-brand-red text-foreground absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full"
        >
          <Check className="h-3 w-3" />
        </span>
      ) : null}
    </button>
  )
}
