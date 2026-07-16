"use client"

// Re-export tipado del hook de next-themes.

import { useTheme as useNextTheme } from "next-themes"

export function useTheme() {
  return useNextTheme()
}
