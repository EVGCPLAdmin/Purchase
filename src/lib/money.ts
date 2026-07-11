import { CURRENCY_OPTIONS, type CurrencyCode } from '../types/settings'

export function currencySymbol(code: CurrencyCode) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol ?? code
}

export function currencyWords(code: CurrencyCode) {
  const entry = CURRENCY_OPTIONS.find((c) => c.code === code)
  return { words: entry?.words ?? code, minorWords: entry?.minorWords ?? 'Cents' }
}

export function money(value: number, code: CurrencyCode) {
  const amount = Number.isFinite(value) ? value : 0
  return `${currencySymbol(code)}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
