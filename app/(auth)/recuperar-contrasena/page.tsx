import { Suspense } from "react"
import { RecuperarContrasena } from "./recuperar-form"

export const metadata = {
  title: "Recuperar contraseña",
}

export default function RecuperarContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarContrasena />
    </Suspense>
  )
}
