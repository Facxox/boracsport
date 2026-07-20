"use client"

// Paso 1 del registro: datos personales + credenciales.
// Validación cliente antes de pasar al paso 2 (URL ?step=intereses).
// La dirección se solicita después, en el checkout, para no frenar el alta.
//
// El password se guarda en sessionStorage durante el flujo de 2 pasos.
// sessionStorage se borra al cerrar la pestaña, así que no persiste entre
// sesiones.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCustomerStore } from "@/stores/customer-store"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REG_PASSWORD_KEY = "borac-reg-password"

export function RegistrationStep1({ initialStep1Data }: { initialStep1Data: Step1Data }) {
  const router = useRouter()
  const setStored = useCustomerStore((s) => s.setProfile)
  const stored = useCustomerStore((s) => s.profile)

  const [fullName, setFullName] = useState(
    initialStep1Data.fullName ?? stored.name ?? "",
  )
  const [email, setEmail] = useState(initialStep1Data.email ?? stored.email ?? "")
  const [phone, setPhone] = useState(initialStep1Data.phone ?? stored.phone ?? "")
  const [password, setPassword] = useState(() => {
    if (typeof window === "undefined") return ""
    return sessionStorage.getItem(REG_PASSWORD_KEY) ?? ""
  })
  const [touched, setTouched] = useState<{
    name?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
  }>({})

  // Sincronizar el password con sessionStorage (sobrevive back/forward).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (password) sessionStorage.setItem(REG_PASSWORD_KEY, password)
    else sessionStorage.removeItem(REG_PASSWORD_KEY)
  }, [password])

  const nameValid = fullName.trim().length >= 3
  const emailValid = EMAIL_REGEX.test(email.trim())
  const phoneValid = phone.replace(/\D/g, "").length >= 6
  const passwordValid = password.length >= 6
  const allValid = nameValid && emailValid && phoneValid && passwordValid

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allValid) {
      setTouched({ name: true, email: true, password: true, phone: true })
      return
    }
    setStored({ name: fullName, email, phone })
    const params = new URLSearchParams({
      name: fullName,
      email,
      phone,
    })
    router.push(`/registro?step=intereses&${params.toString()}`)
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <Stepper current={1} />
      <h1 className="font-display mt-4 text-2xl font-extrabold">Crear cuenta</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Tus datos se usan para procesar tus pedidos. Después elegís tus intereses.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <Field
          id="fullName"
          label="Nombre completo"
          autoComplete="name"
          required
          value={fullName}
          onChange={setFullName}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          invalid={touched.name && !nameValid}
          error="Ingresá tu nombre (mínimo 3 caracteres)."
          placeholder="Juan Pérez"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            invalid={touched.email && !emailValid}
            error="Email inválido."
          />
          <Field
            id="phone"
            label="Teléfono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={setPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            invalid={touched.phone && !phoneValid}
            error="Necesitamos un teléfono válido."
            placeholder="099 123 456"
          />
        </div>
        <Field
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          invalid={touched.password && !passwordValid}
          error="La contraseña debe tener al menos 6 caracteres."
        />
        <Button type="submit" className="w-full" disabled={!allValid}>
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

type Step1Data = {
  fullName?: string
  email?: string
  phone?: string
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  required,
  value,
  onChange,
  onBlur,
  invalid,
  error,
  placeholder,
  inputMode,
}: {
  id: string
  label: string
  type?: string
  autoComplete?: string
  required?: boolean
  value: string
  onChange: (next: string) => void
  onBlur?: () => void
  invalid?: boolean
  error?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={invalid ? "border-red-500/60" : undefined}
      />
      {invalid && error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Stepper({ current }: { current: 1 | 2 }) {
  const steps = [
    { id: 1, label: "Datos" },
    { id: 2, label: "Intereses" },
  ] as const
  return (
    <ol
      className="flex items-center gap-2 text-[11px]"
      aria-label={`Paso ${current} de ${steps.length}`}
    >
      {steps.map((s, idx) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            aria-current={s.id === current ? "step" : undefined}
            className={
              s.id <= current
                ? "bg-brand-red text-foreground flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
                : "bg-card flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[11px] text-white/40"
            }
          >
            {s.id}
          </span>
          <span className={s.id === current ? "font-semibold text-white" : "text-white/50"}>
            {s.label}
          </span>
          {idx < steps.length - 1 ? <span className="bg-white/10 h-px w-6" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  )
}
