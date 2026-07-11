import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatusChip } from '../../components/ui/StatusChip'
import { StockLevelsDrawer } from './StockLevelsDrawer'
import { STOCK_STATUS_TONE, stockStatus, type StoreItem } from '../../types/stores'
import { saveStoreItem, updateStoreItem } from '../../data/repository'
import { money } from '../../lib/money'
import { useSettings } from '../../context/SettingsContext'

interface Props {
  items: StoreItem[]
  setItems: React.Dispatch<React.SetStateAction<StoreItem[]>>
  canCreate: boolean
  canEdit: boolean
}

export function StockLevelsTab({ items, setItems, canCreate, canEdit }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<StoreItem | null>(null)
  const { settings } = useSettings()

  const editable = selected ? canEdit : canCreate

  const columns: DataTableColumn<StoreItem>[] = [
    { key: 'itemCode', header: 'Item Code', width: 120, nowrap: true },
    { key: 'itemName', header: 'Item Name', width: 220 },
    { key: 'category', header: 'Category', width: 140 },
    {
      key: 'quantityInStock',
      header: 'Qty in Stock',
      width: 130,
      accessor: (r) => r.quantityInStock,
      render: (r) => `${r.quantityInStock} ${r.unitOfMeasure}`,
      toText: (r) => `${r.quantityInStock} ${r.unitOfMeasure}`,
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      width: 130,
      accessor: (r) => r.reorderLevel,
      render: (r) => `${r.reorderLevel} ${r.unitOfMeasure}`,
      toText: (r) => `${r.reorderLevel} ${r.unitOfMeasure}`,
    },
    {
      key: 'stockValue',
      header: 'Stock Value',
      width: 130,
      accessor: (r) => r.quantityInStock * r.unitCost,
      render: (r) => money(r.quantityInStock * r.unitCost, settings.currency),
      toText: (r) => money(r.quantityInStock * r.unitCost, settings.currency),
    },
    { key: 'location', header: 'Site', width: 130 },
    {
      key: 'status',
      header: 'Status',
      width: 130,
      accessor: (r) => stockStatus(r),
      render: (r) => <StatusChip value={stockStatus(r)} tone={STOCK_STATUS_TONE[stockStatus(r)]} />,
      toText: (r) => stockStatus(r),
    },
  ]

  async function handleSave(item: StoreItem) {
    if (!item.id) {
      const saved = await saveStoreItem(item)
      setItems((prev) => [...prev, saved])
    } else {
      const saved = await updateStoreItem(item)
      setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canCreate && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSelected(null)
              setDrawerOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            New Store Item
          </button>
        )}
      </div>

      <DataTable
        key="stock-levels"
        tableKey="stock-levels"
        columns={columns}
        data={items}
        getRowId={(r) => r.id}
        onRowClick={(r) => {
          setSelected(r)
          setDrawerOpen(true)
        }}
        emptyMessage="No store items yet."
      />

      <StockLevelsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selected}
        onSave={handleSave}
        editable={editable}
      />
    </div>
  )
}
