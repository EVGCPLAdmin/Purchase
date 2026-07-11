import { PenLine, Paperclip } from 'lucide-react'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'status'
  | 'user'
  | 'boolean'
  | 'email'
  | 'tags'
  | 'attachment'
  | 'signature'

export interface FieldOption {
  value: string
  label: string
}

interface FormFieldProps {
  label: string
  type?: FieldType
  value: unknown
  onChange: (value: never) => void
  options?: FieldOption[]
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  help?: string
  span2?: boolean
  placeholder?: string
  currencySymbol?: string
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  required,
  readOnly,
  disabled,
  help,
  span2,
  placeholder,
  currencySymbol,
}: FormFieldProps) {
  const spans = span2 || type === 'textarea' ? 'sm:col-span-2' : ''
  const isReadOnly = readOnly || disabled

  return (
    <div className={spans}>
      <label className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {renderControl()}
      {help && <p className="mt-0.5 text-[11px] text-muted">{help}</p>}
    </div>
  )

  function renderControl() {
    const commonProps = {
      disabled: isReadOnly,
      className: isReadOnly ? 'opacity-60' : '',
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            className={`textarea min-h-[80px] ${commonProps.className}`}
            value={(value as string) ?? ''}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            className={`input ${commonProps.className}`}
            value={(value as number) ?? 0}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value) as never)}
          />
        )
      case 'currency':
        return (
          <div className="relative">
            {currencySymbol && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                {currencySymbol}
              </span>
            )}
            <input
              type="number"
              className={`input ${currencySymbol ? 'pl-7' : ''} ${commonProps.className}`}
              value={(value as number) ?? 0}
              readOnly={readOnly}
              disabled={disabled}
              onChange={(e) => onChange(Number(e.target.value) as never)}
            />
          </div>
        )
      case 'date':
        return (
          <input
            type="date"
            className={`input ${commonProps.className}`}
            value={(value as string) ?? ''}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          />
        )
      case 'email':
        return (
          <input
            type="email"
            className={`input ${commonProps.className}`}
            value={(value as string) ?? ''}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          />
        )
      case 'boolean':
        return (
          <div className="flex items-center pt-1.5">
            <input
              type="checkbox"
              checked={!!value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked as never)}
            />
          </div>
        )
      case 'select':
      case 'status':
        return (
          <select
            className={`select ${commonProps.className}`}
            value={(value as string) ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          >
            <option value="" disabled>
              Select…
            </option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'user':
        return (
          <select
            className={`select ${commonProps.className}`}
            value={(value as string) ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          >
            <option value="">— Unassigned —</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'multiselect':
      case 'tags':
        return (
          <input
            type="text"
            className={`input ${commonProps.className}`}
            value={Array.isArray(value) ? (value as string[]).join(', ') : ((value as string) ?? '')}
            placeholder={placeholder ?? 'Comma-separated'}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean) as never,
              )
            }
          />
        )
      case 'attachment':
        return (
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="text"
              className="input"
              placeholder="Paste a file URL / Drive link"
              value={(value as string) ?? ''}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value as never)}
            />
          </div>
        )
      case 'signature':
        return (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-surface px-3 py-1.5">
            <PenLine className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="text"
              className="w-full border-0 bg-transparent p-0 text-sm outline-none"
              placeholder="Type name to e-sign"
              value={(value as string) ?? ''}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value as never)}
            />
          </div>
        )
      case 'text':
      default:
        return (
          <input
            type="text"
            className={`input ${commonProps.className}`}
            value={(value as string) ?? ''}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as never)}
          />
        )
    }
  }
}
