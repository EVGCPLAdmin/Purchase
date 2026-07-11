import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useAccess } from '../../context/AccessContext'
import { useAsyncData } from '../../lib/useAsyncData'
import { loadPurchaseOrders, loadRequisitions } from '../../data/repository'
import { RequisitionsTab } from './RequisitionsTab'
import { PurchaseOrdersTab } from './PurchaseOrdersTab'

type Tab = 'requisitions' | 'orders'

export function PurchasePage() {
  const [tab, setTab] = useState<Tab>('requisitions')
  const { hasPermission } = useAccess()
  const canCreate = hasPermission('purchase:create')
  const canEdit = hasPermission('purchase:edit')

  const { data: requisitions, setData: setRequisitions } = useAsyncData(loadRequisitions)
  const { data: purchaseOrders, setData: setPurchaseOrders } = useAsyncData(loadPurchaseOrders)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShoppingCart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text">Purchase</h1>
          <p className="text-sm text-muted">Material requisitions and vendor purchase orders.</p>
        </div>
      </div>

      <div className="inline-flex rounded-md border border-border bg-surface p-1">
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'requisitions' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text'}`}
          onClick={() => setTab('requisitions')}
        >
          Material Requisitions
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'orders' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text'}`}
          onClick={() => setTab('orders')}
        >
          Purchase Orders
        </button>
      </div>

      {tab === 'requisitions' ? (
        <RequisitionsTab
          requisitions={requisitions}
          setRequisitions={setRequisitions}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      ) : (
        <PurchaseOrdersTab
          purchaseOrders={purchaseOrders}
          setPurchaseOrders={setPurchaseOrders}
          requisitions={requisitions}
          setRequisitions={setRequisitions}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}
