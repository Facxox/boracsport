"use client"

// Coordinator del wizard de registro de 2 pasos.
//
// Reglas de seguridad (fase aprobada):
//   - Step1Data completo (incluida password) vive SOLO en estado React del
//     coordinator. Nunca se persiste en URL, sessionStorage, localStorage ni
//     en el customer-store antes de un signup exitoso.
//   - Ambos pasos (Step1 y Step2) viven en el mismo árbol de React: el cambio
//     de paso es interno al coordinator, no navega a una URL distinta.
//   - Si el usuario refresca la página estando en paso 2, el estado se pierde
//     y el coordinator vuelve a paso 1 sin retener datos.
//   - Sólo después de un signup exitoso, el coordinator puede invocar
//     setStored para autorrellenar checkout en próximas visitas.
//
// Mantenemos:
//   - Google registration (siempre vuelve a /cuenta).
//   - Confirmación: tras signup sin session, navega a /registro/confirmacion.
//   - Resend del email de confirmación desde paso 2.
//   - Botón "Atrás" para volver a paso 1 con los datos ya tipeados.

import { useState } from "react"
import { RegistrationStep1, Stepper } from "./registration-step1"
import { RegistrationStep2 } from "./registration-step2"

export interface InterestCard {
  slug: string
  title: string
  emoji: string
  description: string
}

export interface Step1Data {
  fullName: string
  email: string
  phone: string
  /** Password en memoria únicamente. NO se persiste. */
  password: string
}

const EMPTY_STEP1: Step1Data = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
}

type Step = 1 | 2

export interface RegistrationWizardProps {
  cards: InterestCard[]
}

export function RegistrationWizard({ cards }: RegistrationWizardProps) {
  // Datos del paso 1: viven exclusivamente en este árbol de React.
  // Si el componente se desmonta (refresh, navegación externa), los datos
  // se pierden y se vuelve a paso 1 con campos vacíos.
  const [step1, setStep1] = useState<Step1Data>(EMPTY_STEP1)
  const [step, setStep] = useState<Step>(1)

  function goToStep2(data: Step1Data) {
    setStep1(data)
    setStep(2)
  }

  function goBackToStep1() {
    // Volvemos a paso 1 conservando los datos tipeados en memoria. El usuario
    // no pierde lo que ya completó.
    setStep(1)
  }

  return (
    <div className="space-y-4">
      {/* Stepper compartido, sólo como referencia visual del coordinator. */}
      <Stepper current={step} />
      {step === 1 ? (
        <RegistrationStep1
          initial={step1}
          onContinue={(data) => goToStep2(data)}
        />
      ) : (
        <RegistrationStep2
          cards={cards}
          step1Data={step1}
          onBack={goBackToStep1}
        />
      )}
    </div>
  )
}
