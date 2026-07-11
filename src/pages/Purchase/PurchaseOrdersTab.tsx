import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatusChip } from '../../components/ui/StatusChip'
import { PurchaseOrderDrawer } from './PurchaseOrderDrawer'
import { PurchaseOrderPrint } from './PurchaseOrderPrint'
import { PO_STATUS_TONE, poStatusLabel } from './purchaseUi'
import { purchaseOrderTotals, type MaterialRequisition, type PurchaseOrderDoc } from '../../types/purchase'
import { savePurchaseOrder, updatePurchaseOrder, updateRequisition } from '../../data/repository'
import { nextSequenceNo } from '../../lib/id'
import { money } from '../../lib/money'
import { useSettings } from '../../context/SettingsContext'

interface Props {
  purchaseOrders: PurchaseOrderDoc[]
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrderDoc[]>>
  requisitions: MaterialRequisition[]
  setRequisitions: React.Dispatch<React.SetStateAction<MaterialRequisition[]>>
  canCreate: boolean
  canEdit: boolean
}

export function PurchaseOrdersTab({
  purchaseOrders,
  setPurchaseOrders,
  requisitions,
  setRequisitions,
  canCreate,
  canEdit,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<PurchaseOrderDoc | null>(null)
  const [printDoc, setPrintDoc] = useState<PurchaseOrderDoc | null>(null)
  const { settings } = useSettings()

  const editable = selected ? canEdit : canCreate

  const columns: DataTableColumn<PurchaseOrderDoc>[] = [
    { key: 'poNumber', header: 'PO Number', width: 120, nowrap: true },
    { key: 'poDate', header: 'Date', width: 110, nowrap: true },
    { key: 'vendorName', header: 'Vendor', width: 200 },
    {
      key: 'items',
      header: 'Items',
      width: 80,
      accessor: (r) => r.items.length,
      toText: (r) => String(r.items.length),
    },
    {
      key: 'netAmount',
      header: 'Net Amount',
      width: 140,
      accessor: (r) => purchaseOrderTotals(r).netAmount,
      render: (r) => money(purchaseOrderTotals(r).netAmount, settings.currency),
      toText: (r) => money(purchaseOrderTotals(r).netAmount, settings.currency),
    },
    {
      key: 'status',
      header: 'Status',
      width: 130,
      render: (r) => <StatusChip value={poStatusLabel(r.status)} tone={PO_STATUS_TONE[r.status]} />,
      toText: (r) => poStatusLabel(r.status),
    },
    { key: 'requestedBy', header: 'Requested By', width: 150 },
  ]

  async function handleSave(po: PurchaseOrderDoc) {
    let saved: PurchaseOrderDoc
    if (!po.id) {
      const poNumber = nextSequenceNo('PO', purchaseOrders.map((p) => p.poNumber))
      saved = await savePurchaseOrder({ ...po, poNumber })
      setPurchaseOrders((prev) => [...prev, saved])
    } else {
      saved = await updatePurchaseOrder(po)
      setPurchaseOrders((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))
    }

    const linkedMrIds = saved.items.map((it) => it.mrId).filter((id): id is string => !!id)
    for (const mrId of linkedMrIds) {
      const mr = requisitions.find((r) => r.id === mrId)
      if (mr && mr.status !== 'Converted to PO') {
        const updated = await updateRequisition({ ...mr, status: 'Converted to PO' })
        setRequisitions((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      }
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
            New Purchase Order
          </button>
        )}
      </div>

      <DataTable
        key="purchase-orders"
        tableKey="purchase-orders"
        columns={columns}
        data={purchaseOrders}
        getRowId={(r) => r.id}
        onRowClick={(r) => {
          setSelected(r)
          setDrawerOpen(true)
        }}
        emptyMessage="No purchase orders yet."
      />

      <PurchaseOrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selected}
        onSave={handleSave}
        onPrintPreview={(doc) => setPrintDoc(doc)}
        editable={editable}
        requisitions={requisitions}
      />

      <PurchaseOrderPrint open={!!printDoc} onClose={() => setPrintDoc(null)} doc={printDoc} />
    </div>
  )
}
