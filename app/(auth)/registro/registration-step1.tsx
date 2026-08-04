"use client"

// Paso 1 del registro: datos personales + credenciales.
// Es un componente presentacional controlado por el coordinator
// (./registration-wizard.tsx). No escribe en URL, sessionStorage,
// localStorage ni en el customer-store. La password y los demás datos
// viven sólo en estado React del coordinator.

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import type { Step1Data } from "./registration-wizard"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface RegistrationStep1Props {
  /** Valores iniciales del coordinator. El componente los refleja en su
   *  estado local, pero cualquier cambio se devuelve al coordinator vía
   *  onContinue cuando el usuario avanza. */
  initial: Step1Data
  /** Callback invocado al pasar al paso 2 con los datos ya validados. */
  onContinue: (data: Step1Data) => void
}

export function RegistrationStep1({ initial, onContinue }: RegistrationStep1Props) {
  const [fullName, setFullName] = useState(initial.fullName)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone)
  const [password, setPassword] = useState(initial.password)
  const [touched, setTouched] = useState<{
    name?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
  }>({})

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
    onContinue({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    })
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 p-6">
      <h1 className="font-display mt-4 text-2xl font-extrabold">Crear cuenta</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Tus datos se usan para procesar tus pedidos. Después elegís tus intereses.
      </p>

      <div className="mt-6">
        <GoogleAuthButton
          next="/cuenta"
          label="Registrarme con Google"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Si entrás con Google podés elegir tus intereses después desde tu cuenta.
        </p>
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="bg-white/10 h-px flex-1" />
        <span className="text-muted-foreground text-xs">o con email</span>
        <span className="bg-white/10 h-px flex-1" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
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
