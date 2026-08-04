"use client"

// Paso 2 del registro: selección de intereses + signUp.
//
// Recibe Step1Data (incluida password) por props desde el coordinator
// (./registration-wizard.tsx). No lee URL, sessionStorage ni localStorage.
// Si el usuario refresca la página en este paso, el coordinator se desmonta,
// se vuelve a paso 1 y se pierden los datos.
//
// Filtramos los intereses estrictamente contra los slugs entregados por el
// servidor (cards) para no enviar valores manipulados a Supabase.

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useCustomerStore } from "@/stores/customer-store"
import { Stepper } from "./registration-step1"
import type { InterestCard, Step1Data } from "./registration-wizard"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface RegistrationStep2Props {
  cards: InterestCard[]
  step1Data: Step1Data
  onBack: () => void
}

export function RegistrationStep2({
  cards,
  step1Data,
  onBack,
}: RegistrationStep2Props) {
  const router = useRouter()
  const setStored = useCustomerStore((s) => s.setProfile)

  const [intereses, setIntereses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  const validSlugs = useMemo(() => new Set(cards.map((c) => c.slug)), [cards])

  const dataValid =
    EMAIL_REGEX.test(step1Data.email) &&
    step1Data.fullName.trim().length >= 3 &&
    step1Data.phone.replace(/\D/g, "").length >= 6 &&
    step1Data.password.length >= 6

  function toggleInterest(slug: string) {
    if (!validSlugs.has(slug)) return
    setIntereses((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  // Filtramos intereses contra slugs válidos antes de enviarlos al signup.
  const interesesFiltrados = useMemo(
    () => intereses.filter((slug) => validSlugs.has(slug)),
    [intereses, validSlugs],
  )

  async function onConfirm() {
    if (!dataValid) {
      setError("Faltan datos del paso 1. Volvé a completarlo.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            full_name: step1Data.fullName,
            phone: step1Data.phone,
            site: "boracsport",
            intereses: interesesFiltrados,
          },
        },
      })
      if (signUpError) {
        if (/already registered|email.*exists|user.*exists/i.test(signUpError.message)) {
          setError("Ya tenés una cuenta con ese email. Iniciá sesión.")
        } else {
          setError(signUpError.message)
        }
        return
      }
      // Anti-enumeration: con email ya registrado Supabase puede devolver
      // success sin crear usuario ni sesión.
      if (!data.user) {
        setError("Ya tenés una cuenta con ese email. Iniciá sesión.")
        return
      }

      // Signup exitoso: recién ahora persistimos PII para autorrellenar el
      // checkout. Nunca antes — ni en URL, ni en sessionStorage, ni en
      // localStorage, ni en el customer-store.
      setStored({
        name: step1Data.fullName,
        email: step1Data.email,
        phone: step1Data.phone,
      })

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
    if (!EMAIL_REGEX.test(step1Data.email)) return
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

  if (!dataValid) {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <Stepper current={2} />
        <p className="mt-6 text-sm text-white/80">
          Faltan datos del paso 1. Volvé a completarlo.
        </p>
        <div className="mt-4">
          <Button onClick={onBack}>Volver al paso 1</Button>
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
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={loading}
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="bg-brand-red text-foreground hover:bg-[#ef4444]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta…
            </>
          ) : (
            `Crear cuenta${interesesFiltrados.length > 0 ? ` (${interesesFiltrados.length})` : ""}`
          )}
        </Button>
      </div>

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

function InterestCard({
  card,
  selected,
  onClick,
}: {
  card: InterestCard
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
