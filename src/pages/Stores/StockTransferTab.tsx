import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyStockTransferEntry, type StockTransferEntry, type StoreItem } from '../../types/stores'
import { SITE_OPTIONS } from '../../types/options'
import { saveStockTransfer, updateStoreItem } from '../../data/repository'
import { nextSequenceNo } from '../../lib/id'

interface Props {
  entries: StockTransferEntry[]
  setEntries: React.Dispatch<React.SetStateAction<StockTransferEntry[]>>
  items: StoreItem[]
  setItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
}

export function StockTransferTab({ entries, setEntries, items, setItems, canCreate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<StockTransferEntry>(emptyStockTransferEntry())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (drawerOpen) setForm(emptyStockTransferEntry())
  }, [drawerOpen])

  function set<K extends keyof StockTransferEntry>(key: K) {
    return (value: StockTransferEntry[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  function pickItem(itemCode: string) {
    const item = items.find((i) => i.itemCode === itemCode)
    setForm((f) => ({ ...f, itemCode, itemName: item?.itemName ?? '', fromLocation: item?.location ?? '' }))
  }

  const columns: DataTableColumn<StockTransferEntry>[] = [
    { key: 'transactionNo', header: 'Txn No.', width: 120, nowrap: true },
    { key: 'itemCode', header: 'Item Code', width: 120 },
    { key: 'itemName', header: 'Item Name', width: 220 },
    { key: 'quantity', header: 'Qty', width: 90 },
    { key: 'fromLocation', header: 'From', width: 130 },
    { key: 'toLocation', header: 'To', width: 130 },
    { key: 'transferredBy', header: 'Transferred By', width: 150 },
    { key: 'date', header: 'Date', width: 110, nowrap: true },
  ]

  async function handleSave() {
    if (!form.itemCode || form.quantity <= 0 || !form.toLocation) return
    setSaving(true)
    try {
      const transactionNo = nextSequenceNo('STX', entries.map((e) => e.transactionNo))
      const saved = await saveStockTransfer({ ...form, transactionNo })
      setEntries((prev) => [...prev, saved])

      const item = items.find((i) => i.itemCode === form.itemCode)
      if (item) {
        const updated = await updateStoreItem({
          ...item,
          location: form.toLocation,
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
            New Stock Transfer
          </button>
        )}
      </div>

      <DataTable
        key="stock-transfer"
        tableKey="stock-transfer"
        columns={columns}
        data={entries}
        getRowId={(r) => r.id}
        emptyMessage="No stock transfers yet."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Stock Transfer"
        subtitle="Move an item between sites"
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
        <FormSection title="Stock Transfer Details">
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
          <FormField label="From Site" value={form.fromLocation} onChange={() => {}} readOnly disabled />
          <FormField
            label="To Site"
            type="select"
            value={form.toLocation}
            onChange={set('toLocation')}
            options={SITE_OPTIONS.map((s) => ({ value: s, label: s }))}
            required
          />
          <FormField label="Transferred By" value={form.transferredBy} onChange={set('transferredBy')} />
          <FormField label="Remarks" type="textarea" value={form.remarks} onChange={set('remarks')} span2 />
        </FormSection>
      </Drawer>
    </div>
  )
}
