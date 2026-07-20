// Customer checkout data — se hidrata desde user_metadata al login y desde
// el formulario de registro al crear cuenta. Persistido en localStorage para
// autorrellenar el checkout incluso si el visitante navegó fuera y volvió.

"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CustomerProfile {
  name: string
  email: string
  phone: string
  address: string
}

type CustomerState = {
  profile: CustomerProfile
  _hasHydrated: boolean

  setProfile: (next: Partial<CustomerProfile>) => void
  reset: () => void
  clearProfile: () => void
  _setHasHydrated: (b: boolean) => void
}

const EMPTY: CustomerProfile = { name: "", email: "", phone: "", address: "" }

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      profile: EMPTY,
      _hasHydrated: false,

      setProfile: (next) =>
        set((state) => ({
          profile: { ...state.profile, ...next },
        })),
      reset: () => set({ profile: EMPTY }),
      // Alias explícito para "limpiar la info personal del cliente en este
      // dispositivo". Útil cuando el usuario cierra sesión y no queremos que
      // el siguiente usuario del mismo navegador vea los datos.
      clearProfile: () => set({ profile: EMPTY }),
      _setHasHydrated: (b) => set({ _hasHydrated: b }),
    }),
    {
      name: "borac-customer-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)

export function useCustomerHasHydrated(): boolean {
  return useCustomerStore((s) => s._hasHydrated)
}