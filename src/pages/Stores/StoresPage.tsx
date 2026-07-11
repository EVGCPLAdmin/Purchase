import { useState } from 'react'
import { Package } from 'lucide-react'
import { useAccess } from '../../context/AccessContext'
import { useAsyncData } from '../../lib/useAsyncData'
import { loadStockIn, loadStockOut, loadStockTransfer, loadStoreItems } from '../../data/repository'
import { StockLevelsTab } from './StockLevelsTab'
import { StockInTab } from './StockInTab'
import { StockOutTab } from './StockOutTab'
import { StockTransferTab } from './StockTransferTab'

type Tab = 'levels' | 'in' | 'out' | 'transfer'

const TABS: { id: Tab; label: string }[] = [
  { id: 'levels', label: 'Stock Levels' },
  { id: 'in', label: 'Stock In' },
  { id: 'out', label: 'Stock Out' },
  { id: 'transfer', label: 'Stock Transfer' },
]

export function StoresPage() {
  const [tab, setTab] = useState<Tab>('levels')
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('stores:create')

  const { data: items, setData: setItems } = useAsyncData(loadStoreItems)
  const { data: stockIn, setData: setStockIn } = useAsyncData(loadStockIn)
  const { data: stockOut, setData: setStockOut } = useAsyncData(loadStockOut)
  const { data: stockTransfer, setData: setStockTransfer } = useAsyncData(loadStockTransfer)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Package className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text">Stores & Inventory</h1>
          <p className="text-sm text-muted">Stock levels, receipts, issues and transfers across sites.</p>
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-md border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded px-3 py-1.5 text-sm font-medium ${tab === t.id ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'levels' && (
        <StockLevelsTab
          items={items}
          setItems={setItems}
          canCreate={canCreate}
          canEdit={hasPermission('stores:create')}
        />
      )}
      {tab === 'in' && <StockInTab entries={stockIn} setEntries={setStockIn} items={items} setItems={setItems} canCreate={canCreate} />}
      {tab === 'out' && <StockOutTab entries={stockOut} setEntries={setStockOut} items={items} setItems={setItems} canCreate={canCreate} />}
      {tab === 'transfer' && (
        <StockTransferTab entries={stockTransfer} setEntries={setStockTransfer} items={items} setItems={setItems} canCreate={canCreate} />
      )}
    </div>
  )
}
