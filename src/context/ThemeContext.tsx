import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ThemeOption {
  id: string
  label: string
  mode: 'light' | 'dark'
  swatch: string
}

export const THEMES: ThemeOption[] = [
  { id: 'evergreen-light', label: 'Evergreen Light', mode: 'light', swatch: '#057a55' },
  { id: 'evergreen-dark', label: 'Evergreen Dark', mode: 'dark', swatch: '#34d399' },
  { id: 'midnight', label: 'Midnight', mode: 'dark', swatch: '#63b3ed' },
  { id: 'contrast', label: 'High Contrast', mode: 'light', swatch: '#005a3c' },
]

const STORAGE_KEY = 'ui.theme'

interface ThemeContextValue {
  themeId: string
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem(STORAGE_KEY) || THEMES[0].id)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  return <ThemeContext.Provider value={{ themeId, setThemeId }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
