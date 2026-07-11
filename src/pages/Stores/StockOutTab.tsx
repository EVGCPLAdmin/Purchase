import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyStockOutEntry, type StockOutEntry, type StoreItem } from '../../types/stores'
import { saveStockOut, updateStoreItem } from '../../data/repository'
import { nextSequenceNo } from '../../lib/id'

interface Props {
  entries: StockOutEntry[]
  setEntries: React.Dispatch<React.SetStateAction<StockOutEntry[]>>
  items: StoreItem[]
  setItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockOutTab({ entries, setEntries, items, setItems, canCreate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<StockOutEntry>(emptyStockOutEntry())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (drawerOpen) {
      setForm(emptyStockOutEntry())
      setError('')
    }
  }, [drawerOpen])

  function set<K extends keyof StockOutEntry>(key: K) {
    return (value: StockOutEntry[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  function pickItem(itemCode: string) {
    const item = items.find((i) => i.itemCode === itemCode)
    setForm((f) => ({ ...f, itemCode, itemName: item?.itemName ?? '' }))
    setError('')
  }

  const columns: DataTableColumn<StockOutEntry>[] = [
    { key: 'transactionNo', header: 'Txn No.', width: 120, nowrap: true },
    { key: 'itemCode', header: 'Item Code', width: 120 },
    { key: 'itemName', header: 'Item Name', width: 220 },
    { key: 'quantity', header: 'Qty', width: 90 },
    { key: 'purpose', header: 'Purpose', width: 200 },
    { key: 'issuedTo', header: 'Issued To', width: 150 },
    { key: 'issuedBy', header: 'Issued By', width: 150 },
    { key: 'date', header: 'Date', width: 110, nowrap: true },
  ]

  async function handleSave() {
    if (!form.itemCode || form.quantity <= 0) return
    const item = items.find((i) => i.itemCode === form.itemCode)
    if (!item) return
    if (form.quantity > item.quantityInStock) {
      setError(`Only ${item.quantityInStock} ${item.unitOfMeasure} available in stock.`)
      return
    }

    setSaving(true)
    try {
      const transactionNo = nextSequenceNo('SOUT', entries.map((e) => e.transactionNo))
      const saved = await saveStockOut({ ...form, transactionNo })
      setEntries((prev) => [...prev, saved])

      const updated = await updateStoreItem({
        ...item,
        quantityInStock: item.quantityInStock - form.quantity,
        lastUpdated: new Date().toISOString().slice(0, 10),
      })
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canCreate && (
          <button type="button" className="btn-primary" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            New Stock Out
          </button>
        )}
      </div>

      <DataTable
        key="stock-out"
        tableKey="stock-out"
        columns={columns}
        data={entries}
        getRowId={(r) => r.id}
        emptyMessage="No stock-out entries yet."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Stock Out"
        subtitle="Issue of material out of stores"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <FormSection title="Stock Out Details">
            <FormField label="Transaction No." value="Auto-generated on save" onChange={() => {}} readOnly disabled />
            <FormField label="Date" type="date" value={form.date} onChange={set('date')} />
            <FormField
              label="Item"
              type="select"
              value={form.itemCode}
              onChange={pickItem}
              options={items.map((i) => ({
                value: i.itemCode,
                label: `${i.itemCode} - ${i.itemName} (${i.quantityInStock} ${i.unitOfMeasure} avail.)`,
              }))}
              span2
              required
            />
            <FormField label="Quantity" type="number" value={form.quantity} onChange={set('quantity')} required />
            <FormField label="Purpose" value={form.purpose} onChange={set('purpose')} placeholder="e.g. Production Issue - Line 01" />
            <FormField label="Issued To" value={form.issuedTo} onChange={set('issuedTo')} />
            <FormField label="Issued By" value={form.issuedBy} onChange={set('issuedBy')} />
          </FormSection>
        </div>
      </Drawer>
    </div>
  )
}
