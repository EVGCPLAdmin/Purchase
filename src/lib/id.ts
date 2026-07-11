export function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function nextSequenceNo(prefix: string, existing: string[]) {
  const nums = existing
    .map((no) => Number(no.replace(prefix, '').replace(/^-/, '')))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${String(next).padStart(4, '0')}`
}
