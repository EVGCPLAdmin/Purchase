export type CurrencyCode = 'INR' | 'USD' | 'TZS'

export const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; label: string; words: string; minorWords: string }[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', words: 'Indian Rupees', minorWords: 'Paise' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', words: 'US Dollars', minorWords: 'Cents' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling (TSh)', words: 'Tanzanian Shillings', minorWords: 'Cents' },
]

export interface CompanySettings {
  appName: string
  legalName: string
  headquarters: string
  certifications: string
  logoUrl: string
  currency: CurrencyCode
  taxIdLabel: string
}

export function defaultCompanySettings(): CompanySettings {
  return {
    appName: 'Evergreen Purchase Module',
    legalName: '',
    headquarters: '',
    certifications: '',
    logoUrl: '',
    currency: 'USD',
    taxIdLabel: 'Tax ID',
  }
}
