"use client"

// Listener global: cuando Supabase dispara SIGNED_OUT (logout manual o
// expiración de token), limpiamos el carrito y el perfil del cliente que
// teníamos en localStorage. Evita que el siguiente usuario del mismo
// navegador vea datos sensibles del dueño anterior.
//
// No toca la UI: este componente devuelve null.

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"

export function SignOutCleanup() {
  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        try {
          useCartStore.getState().clear()
        } catch {
          /* ignore */
        }
        try {
          useCustomerStore.getState().clearProfile()
        } catch {
          /* ignore */
        }
      }
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  return null
}
