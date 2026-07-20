"use client"

// Pantalla para definir la nueva contraseña. Sólo accesible si el cliente
// llegó desde el link de recuperación (Supabase ya intercambió el code y
// tiene una sesión temporal). updateUser({ password }) la cambia.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function NuevaContrasena() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(Boolean(data.user))
    })
  }, [])

  const passwordValid = password.length >= 6
  const match = password === confirm
  const canSubmit = passwordValid && match && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(err.message)
        return
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display mt-4 text-2xl font-extrabold">
          Contraseña actualizada
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" onClick={() => router.push("/cuenta")}>
            Ir a mi cuenta
          </Button>
          <Link href="/login" className="text-brand-red text-sm font-semibold">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (authed === false) {
    return (
      <div className="bg-card rounded-2xl border border-white/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
          <Lock className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display mt-4 text-2xl font-extrabold">
          Link expirado o inválido
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Pedí uno nuevo desde la pantalla de recuperación.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <ButtonLink href="/recuperar-contrasena">
            Pedir nuevo link
          </ButtonLink>
          <Link href="/login" className="text-brand-red text-sm font-semibold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <h1 className="font-display text-2xl font-extrabold">Nueva contraseña</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Definí una nueva contraseña para tu cuenta. Mínimo 6 caracteres.
      </p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && !passwordValid ? (
            <p className="text-xs text-amber-400">Mínimo 6 caracteres.</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Repetir contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm.length > 0 && !match ? (
            <p className="text-xs text-red-400">Las contraseñas no coinciden.</p>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={!canSubmit} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar contraseña"
          )}
        </Button>
      </form>
    </div>
  )
}

function ButtonLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="bg-brand-red text-foreground hover:bg-[#ef4444] inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-bold"
    >
      {children}
    </Link>
  )
}
