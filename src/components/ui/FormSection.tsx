import type { ReactNode } from 'react'

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="card p-4">
      <legend className="px-1 text-sm font-semibold text-primary">{title}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}
