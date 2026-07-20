import { Suspense } from "react"
import { ConfirmacionEmail } from "./confirmacion-email"

export const metadata = {
  title: "Confirmá tu email",
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacionEmail />
    </Suspense>
  )
}
