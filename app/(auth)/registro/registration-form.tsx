"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCustomerStore } from "@/stores/customer-store"

interface Card {
  slug: string
  title: string
  emoji: string
  description: string
}

type Step = "form" | "interests"

export function RegistrationForm({ cards }: { cards: Card[] }) {
  const router = useRouter()
  const stored = useCustomerStore((s) => s.profile)
  const setStored = useCustomerStore((s) => s.setProfile)

  const [step, setStep] = useState<Step>("form")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [intereses, setIntereses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Autorrellenar desde el store cuando ya hay datos previos.
  useEffect(() => {
    if (!hydrated) return
    if (stored.name) setFullName(stored.name)
    if (stored.email) setEmail(stored.email)
    if (stored.phone) setPhone(stored.phone)
    if (stored.address) setAddress(stored.address)
  }, [hydrated, stored.name, stored.email, stored.phone, stored.address])

  function toggleInterest(slug: string) {
    setIntereses((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function onConfirm() {
    if (intereses.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            address,
            site: "boracsport",
            intereses,
          },
        },
      })
      if (error) {
        setError(error.message)
        return
      }
      // Persistir localmente para autorrellenar el checkout incluso antes del primer refresh del servidor.
      setStored({ name: fullName, email, phone, address })
      router.push("/cuenta")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (step === "form") {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6">
        <h1 className="font-display text-2xl font-extrabold">Crear cuenta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tus datos se usan para procesar tus pedidos. Después elegís tus intereses.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // Persistir antes de pasar al siguiente paso.
            setStored({ name: fullName, email, phone, address })
            setStep("interests")
          }}
          className="mt-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="099 123 456"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección de entrega</Label>
            <Input
              id="address"
              type="text"
              autoComplete="street-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, ciudad"
            />
          </div>
          <Button type="submit" className="w-full">
            Continuar
          </Button>
        </form>
        <p className="text-muted-foreground mt-5 text-center text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-brand-red font-semibold">
            Ingresar
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <h1 className="font-display text-2xl font-extrabold">¿Qué te interesa?</h1>
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
              <motion.button
                key={card.slug}
                type="button"
                onClick={() => toggleInterest(card.slug)}
                whileHover={{ y: -2 }}
                animate={
                  selected
                    ? {
                        borderColor: ["#dc2626", "#00e676", "#dc2626"],
                        boxShadow: [
                          "0 0 0 0 rgba(255,90,0,0.0)",
                          "0 0 0 4px rgba(255,90,0,0.18)",
                          "0 0 0 0 rgba(255,90,0,0.0)",
                        ],
                      }
                    : {}
                }
                transition={
                  selected
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                className={
                  "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors " +
                  (selected
                    ? "border-[1px] border-[#dc2626] bg-brand-red/5"
                    : "border-white/10 hover:border-white/25")
                }
              >
                <span className="text-2xl">{card.emoji}</span>
                <span className="text-sm font-semibold">{card.title}</span>
                {card.description ? (
                  <span className="text-muted-foreground text-xs leading-snug">{card.description}</span>
                ) : null}
                {selected && (
                  <span className="bg-brand-red text-foreground absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </motion.button>
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
          onClick={() => setStep("form")}
          disabled={loading}
        >
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
            `Continuar${intereses.length > 0 ? ` (${intereses.length})` : ""}`
          )}
        </Button>
      </div>
    </div>
  )
}