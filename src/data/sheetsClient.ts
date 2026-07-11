import { resolveExecUrl } from './devConfig'

/**
 * Thin client for the Google Apps Script Web App backend (see src/gas/Code.gs
 * for the server-side contract). GET returns a tab's rows; POST creates or
 * updates one row keyed by `id`.
 */

export class SheetsApiError extends Error {}

function requireUrl(): string {
  const url = resolveExecUrl()
  if (!url) throw new SheetsApiError('No Sheets API URL configured')
  return url
}

export async function sheetsGet<T>(tab: string): Promise<T[]> {
  const url = `${requireUrl()}?tab=${encodeURIComponent(tab)}`
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new SheetsApiError(`GET ${tab} failed: ${res.status}`)
  const body = await res.json()
  if (!body.ok) throw new SheetsApiError(body.error ?? `GET ${tab} failed`)
  return body.data as T[]
}

export async function sheetsUpsert<T extends { id: string }>(tab: string, record: T): Promise<T> {
  const res = await fetch(requireUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'upsert', tab, record }),
  })
  if (!res.ok) throw new SheetsApiError(`POST ${tab} failed: ${res.status}`)
  const body = await res.json()
  if (!body.ok) throw new SheetsApiError(body.error ?? `POST ${tab} failed`)
  return body.data as T
}

export async function sheetsAppend<T extends { id: string }>(tab: string, record: T): Promise<T> {
  return sheetsUpsert(tab, record)
}

export async function sheetsPing(execUrl: string, tab: string): Promise<boolean> {
  const res = await fetch(`${execUrl}?tab=${encodeURIComponent(tab)}&ping=1`)
  if (!res.ok) return false
  const body = await res.json().catch(() => null)
  return !!body?.ok
}
