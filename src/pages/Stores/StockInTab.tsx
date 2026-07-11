import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyStockInEntry, type StockInEntry, type StoreItem } from '../../types/stores'
import { saveStockIn, updateStoreItem } from '../../data/repository'
import { nextSequenceNo } from '../../lib/id'

interface Props {
  entries: StockInEntry[]
  setEntries: React.Dispatch<React.SetStateAction<StockInEntry[]>>
  items: StoreItem[]
  setItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockInTab({ entries, setEntries, items, setItems, canCreate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<StockInEntry>(emptyStockInEntry())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (drawerOpen) setForm(emptyStockInEntry())
  }, [drawerOpen])

  function set<K extends keyof StockInEntry>(key: K) {
    return (value: StockInEntry[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  function pickItem(itemCode: string) {
    const item = items.find((i) => i.itemCode === itemCode)
    setForm((f) => ({ ...f, itemCode, itemName: item?.itemName ?? '' }))
  }

  const columns: DataTableColumn<StockInEntry>[] = [
    { key: 'transactionNo', header: 'Txn No.', width: 120, nowrap: true },
    { key: 'itemCode', header: 'Item Code', width: 120 },
    { key: 'itemName', header: 'Item Name', width: 220 },
    { key: 'quantity', header: 'Qty', width: 90 },
    { key: 'source', header: 'Source', width: 180 },
    { key: 'receivedBy', header: 'Received By', width: 150 },
    { key: 'date', header: 'Date', width: 110, nowrap: true },
    { key: 'remarks', header: 'Remarks', width: 200 },
  ]

  async function handleSave() {
    if (!form.itemCode || form.quantity <= 0) return
    setSaving(true)
    try {
      const transactionNo = nextSequenceNo('SIN', entries.map((e) => e.transactionNo))
      const saved = await saveStockIn({ ...form, transactionNo })
      setEntries((prev) => [...prev, saved])

      const item = items.find((i) => i.itemCode === form.itemCode)
      if (item) {
        const updated = await updateStoreItem({
          ...item,
          quantityInStock: item.quantityInStock + form.quantity,
          lastUpdated: new Date().toISOString().slice(0, 10),
        })
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      }
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
            New Stock In
          </button>
        )}
      </div>

      <DataTable
        key="stock-in"
        tableKey="stock-in"
        columns={columns}
        data={entries}
        getRowId={(r) => r.id}
        emptyMessage="No stock-in entries yet."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Stock In"
        subtitle="Receipt of material into stores"
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
        <FormSection title="Stock In Details">
          <FormField label="Transaction No." value="Auto-generated on save" onChange={() => {}} readOnly disabled />
          <FormField label="Date" type="date" value={form.date} onChange={set('date')} />
          <FormField
            label="Item"
            type="select"
            value={form.itemCode}
            onChange={pickItem}
            options={items.map((i) => ({ value: i.itemCode, label: `${i.itemCode} - ${i.itemName}` }))}
            span2
            required
          />
          <FormField label="Quantity" type="number" value={form.quantity} onChange={set('quantity')} required />
          <FormField label="Source" value={form.source} onChange={set('source')} placeholder="e.g. PO number / Production Return" />
          <FormField label="Received By" value={form.receivedBy} onChange={set('receivedBy')} />
          <FormField label="Remarks" type="textarea" value={form.remarks} onChange={set('remarks')} span2 />
        </FormSection>
      </Drawer>
    </div>
  )
}
