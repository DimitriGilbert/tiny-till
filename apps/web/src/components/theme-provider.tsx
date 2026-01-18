import * as React from "react"

import { useTheme, useSystemThemeSync } from "@/stores/theme-store"

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isHydrated } = useTheme()

  useSystemThemeSync()

  if (!isHydrated) {
    return null
  }

  return <>{children}</>
}

export { useTheme } from "@/stores/theme-store"
