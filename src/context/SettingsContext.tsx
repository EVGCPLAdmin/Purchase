import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultCompanySettings, type CompanySettings } from '../types/settings'

const STORAGE_KEY = 'company.settings'

interface SettingsContextValue {
  settings: CompanySettings
  updateSettings: (patch: Partial<CompanySettings>) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function loadSettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultCompanySettings(), ...JSON.parse(raw) } : defaultCompanySettings()
  } catch {
    return defaultCompanySettings()
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  function updateSettings(patch: Partial<CompanySettings>) {
    setSettings((s) => ({ ...s, ...patch }))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
