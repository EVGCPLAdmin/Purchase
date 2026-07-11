import { RefreshCw, Settings as SettingsIcon } from 'lucide-react'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { useSettings } from '../../context/SettingsContext'
import { CURRENCY_OPTIONS } from '../../types/settings'

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()

  function hardRefresh() {
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
    }
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text">Settings</h1>
          <p className="text-sm text-muted">Company branding, profile and build information.</p>
        </div>
      </div>

      <FormSection title="Branding">
        <FormField label="App Name" value={settings.appName} onChange={(v) => updateSettings({ appName: v })} span2 />
        <FormField label="Logo URL" value={settings.logoUrl} onChange={(v) => updateSettings({ logoUrl: v })} span2 help="Paste a hosted logo URL; shown in the sidebar once set." />
      </FormSection>

      <FormSection title="Company Profile">
        <FormField label="Legal Name" value={settings.legalName} onChange={(v) => updateSettings({ legalName: v })} />
        <FormField label="Headquarters" value={settings.headquarters} onChange={(v) => updateSettings({ headquarters: v })} />
        <FormField
          label="Certifications / Standards"
          type="textarea"
          value={settings.certifications}
          onChange={(v) => updateSettings({ certifications: v })}
          span2
        />
        <FormField
          label="Currency"
          type="select"
          value={settings.currency}
          onChange={(v) => updateSettings({ currency: v })}
          options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: c.label }))}
        />
        <FormField
          label="Tax ID Field Label"
          value={settings.taxIdLabel}
          onChange={(v) => updateSettings({ taxIdLabel: v })}
          help="e.g. GSTIN, VAT Number, EIN — used on the Purchase Order form and print preview."
        />
      </FormSection>

      <FormSection title="Build Info">
        <FormField label="Version" value={__APP_VERSION__} onChange={() => {}} readOnly disabled />
        <FormField label="Build Date" value={new Date(__BUILD_DATE__).toLocaleString()} onChange={() => {}} readOnly disabled />
      </FormSection>

      <div>
        <button type="button" className="btn-outline" onClick={hardRefresh}>
          <RefreshCw className="h-4 w-4" />
          Hard Refresh
        </button>
        <p className="mt-1 text-xs text-muted">Clears cached assets — useful right after a redeploy if the browser is showing a stale build.</p>
      </div>
    </div>
  )
}
