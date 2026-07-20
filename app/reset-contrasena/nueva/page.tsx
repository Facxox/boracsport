import { Suspense } from "react"
import { NuevaContrasena } from "./nueva-form"

export const metadata = {
  title: "Nueva contraseña",
}

// Esta ruta la visita el cliente después de hacer click en el link
// de recuperación de email. El callback /auth/callback intercambia el
// code por una sesión y redirige acá, donde el usuario ya está
// autenticado y puede cambiar la contraseña.
export default function NuevaContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <NuevaContrasena />
    </Suspense>
  )
}
