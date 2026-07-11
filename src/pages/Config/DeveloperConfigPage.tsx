import { useState } from 'react'
import { CheckCircle2, Wrench, XCircle } from 'lucide-react'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { DEFAULT_TAB_NAMES, loadDevConfig, saveDevConfig, type DevConfig, type SheetTabNames } from '../../data/devConfig'
import { sheetsPing } from '../../data/sheetsClient'

const TAB_LABELS: Record<keyof SheetTabNames, string> = {
  requisitions: 'Material Requisitions',
  purchaseOrders: 'Purchase Orders',
  storeItems: 'Store Items',
  stockIn: 'Stock In',
  stockOut: 'Stock Out',
  stockTransfer: 'Stock Transfer',
  users: 'Users',
  groups: 'Groups',
}

type PingState = 'idle' | 'checking' | 'ok' | 'fail'

export function DeveloperConfigPage() {
  const [config, setConfig] = useState<DevConfig>(loadDevConfig())
  const [saved, setSaved] = useState(false)
  const [pingStates, setPingStates] = useState<Record<string, PingState>>({})

  function setTabName(key: keyof SheetTabNames, value: string) {
    setConfig((c) => ({ ...c, tabNames: { ...c.tabNames, [key]: value } }))
    setSaved(false)
  }

  function handleSave() {
    saveDevConfig(config)
    setSaved(true)
  }

  async function testConnection(key: keyof SheetTabNames) {
    setPingStates((s) => ({ ...s, [key]: 'checking' }))
    const ok = config.execUrl ? await sheetsPing(config.execUrl, config.tabNames[key]).catch(() => false) : false
    setPingStates((s) => ({ ...s, [key]: ok ? 'ok' : 'fail' }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Wrench className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text">Developer Config</h1>
          <p className="text-sm text-muted">
            Per-browser overrides for the Google Sheets backend. Leave the Exec URL blank to run on mock data only.
          </p>
        </div>
      </div>

      <FormSection title="Apps Script Connection">
        <FormField
          label="Apps Script Exec URL"
          value={config.execUrl}
          onChange={(v) => {
            setConfig((c) => ({ ...c, execUrl: v }))
            setSaved(false)
          }}
          span2
          placeholder="https://script.google.com/macros/s/…/exec"
          help="From Deploy → New deployment → Web app, in the target Apps Script project (see src/gas/Code.gs)."
        />
        <FormField
          label="Spreadsheet ID"
          value={config.spreadsheetId}
          onChange={(v) => {
            setConfig((c) => ({ ...c, spreadsheetId: v }))
            setSaved(false)
          }}
          span2
          help="Optional — informational only; the deployed Apps Script is bound to its own spreadsheet."
        />
      </FormSection>

      <fieldset className="card p-4">
        <legend className="px-1 text-sm font-semibold text-primary">Sheet Tab Names</legend>
        <div className="space-y-2">
          {(Object.keys(DEFAULT_TAB_NAMES) as (keyof SheetTabNames)[]).map((key) => {
            const state = pingStates[key] ?? 'idle'
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-40 shrink-0 text-sm text-muted">{TAB_LABELS[key]}</div>
                <input className="input" value={config.tabNames[key]} onChange={(e) => setTabName(key, e.target.value)} />
                <button type="button" className="btn-outline shrink-0" onClick={() => testConnection(key)}>
                  Test Connection
                </button>
                <span className="w-24 shrink-0 text-xs">
                  {state === 'checking' && <span className="text-muted">Checking…</span>}
                  {state === 'ok' && (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reachable
                    </span>
                  )}
                  {state === 'fail' && (
                    <span className="flex items-center gap-1 text-danger">
                      <XCircle className="h-3.5 w-3.5" /> Failed
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="button" className="btn-primary" onClick={handleSave}>
          Save Config
        </button>
        {saved && <span className="text-sm text-success">Saved — reload the page to apply.</span>}
      </div>
    </div>
  )
}
