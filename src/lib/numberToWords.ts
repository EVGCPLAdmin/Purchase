const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function chunkToWords(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + chunkToWords(n % 100) : ''}`
}

/** International (thousand/million/billion) scale number-to-words for money amounts. */
export function numberToWords(value: number, currencyLabel: string, minorLabel = 'Cents'): string {
  const rounded = Math.round(Math.abs(value) * 100) / 100
  const whole = Math.floor(rounded)
  const fraction = Math.round((rounded - whole) * 100)

  if (whole === 0 && fraction === 0) return `Zero ${currencyLabel} Only`

  const scales = ['', 'Thousand', 'Million', 'Billion']
  let n = whole
  const parts: string[] = []
  let scaleIndex = 0
  if (n === 0) parts.push('Zero')
  while (n > 0) {
    const chunk = n % 1000
    if (chunk > 0) {
      parts.unshift(`${chunkToWords(chunk)}${scales[scaleIndex] ? ' ' + scales[scaleIndex] : ''}`)
    }
    n = Math.floor(n / 1000)
    scaleIndex++
  }

  let words = `${parts.join(' ')} ${currencyLabel}`
  if (fraction > 0) {
    words += ` and ${chunkToWords(fraction)} ${minorLabel}`
  }
  return `${words} Only`
}
