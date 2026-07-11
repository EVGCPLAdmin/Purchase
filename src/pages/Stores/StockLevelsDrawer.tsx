import { useEffect, useState } from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyStoreItem, STORE_CATEGORY_OPTIONS, type StoreItem } from '../../types/stores'
import { SITE_OPTIONS, UNIT_OPTIONS } from '../../types/options'
import { useSettings } from '../../context/SettingsContext'
import { currencySymbol, money } from '../../lib/money'

interface Props {
  open: boolean
  onClose: () => void
  record: StoreItem | null
  onSave: (item: StoreItem) => Promise<void>
  editable: boolean
}

export function StockLevelsDrawer({ open, onClose, record, onSave, editable }: Props) {
  const [form, setForm] = useState<StoreItem>(emptyStoreItem())
  const [saving, setSaving] = useState(false)
  const { settings } = useSettings()

  useEffect(() => {
    if (open) setForm(record ?? emptyStoreItem())
  }, [open, record])

  function set<K extends keyof StoreItem>(key: K) {
    return (value: StoreItem[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  const stockValue = form.quantityInStock * form.unitCost

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ ...form, lastUpdated: new Date().toISOString().slice(0, 10) })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? form.itemName || 'Store Item' : 'New Store Item'}
      subtitle="Stock Levels"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            {editable ? 'Cancel' : 'Close'}
          </button>
          {editable && (
            <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
              {record ? 'Save Changes' : 'Save'}
            </button>
          )}
        </>
      }
    >
      <FormSection title="Item Details">
        <FormField label="Item Code" value={form.itemCode} onChange={set('itemCode')} required disabled={!editable} />
        <FormField label="Item Name" value={form.itemName} onChange={set('itemName')} required disabled={!editable} />
        <FormField
          label="Category"
          type="select"
          value={form.category}
          onChange={set('category')}
          options={STORE_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          disabled={!editable}
        />
        <FormField
          label="Unit of Measure"
          type="select"
          value={form.unitOfMeasure}
          onChange={set('unitOfMeasure')}
          options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
          disabled={!editable}
        />
        <FormField label="Quantity in Stock" type="number" value={form.quantityInStock} onChange={set('quantityInStock')} disabled={!editable} />
        <FormField label="Reorder Level" type="number" value={form.reorderLevel} onChange={set('reorderLevel')} disabled={!editable} />
        <FormField
          label="Unit Cost"
          type="currency"
          value={form.unitCost}
          onChange={set('unitCost')}
          disabled={!editable}
          currencySymbol={currencySymbol(settings.currency)}
        />
        <FormField label="Stock Value" value={money(stockValue, settings.currency)} onChange={() => {}} readOnly disabled />
        <FormField
          label="Site"
          type="select"
          value={form.location}
          onChange={set('location')}
          options={SITE_OPTIONS.map((s) => ({ value: s, label: s }))}
          span2
          disabled={!editable}
        />
      </FormSection>
    </Drawer>
  )
}
