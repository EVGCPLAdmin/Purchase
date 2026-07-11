import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatusChip } from '../../components/ui/StatusChip'
import { RequisitionDrawer } from './RequisitionDrawer'
import { REQUISITION_STATUS_TONE } from './purchaseUi'
import type { MaterialRequisition } from '../../types/purchase'
import { saveRequisition, updateRequisition } from '../../data/repository'
import { nextSequenceNo } from '../../lib/id'

interface Props {
  requisitions: MaterialRequisition[]
  setRequisitions: React.Dispatch<React.SetStateAction<MaterialRequisition[]>>
  canCreate: boolean
  canEdit: boolean
}

export function RequisitionsTab({ requisitions, setRequisitions, canCreate, canEdit }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<MaterialRequisition | null>(null)

  const editable = selected ? canEdit : canCreate

  const columns: DataTableColumn<MaterialRequisition>[] = [
    { key: 'mrNo', header: 'MR No.', width: 120, nowrap: true },
    { key: 'partNo', header: 'Part No', width: 120 },
    { key: 'partDescription', header: 'Description', width: 240 },
    {
      key: 'quantity',
      header: 'Qty',
      width: 110,
      accessor: (r) => r.quantity,
      render: (r) => `${r.quantity} ${r.unit}`,
      toText: (r) => `${r.quantity} ${r.unit}`,
    },
    { key: 'department', header: 'Department', width: 140 },
    { key: 'location', header: 'Site', width: 140 },
    { key: 'requestedBy', header: 'Requested By', width: 150 },
    { key: 'requestDate', header: 'Date', width: 110, nowrap: true },
    {
      key: 'status',
      header: 'Status',
      width: 140,
      render: (r) => <StatusChip value={r.status} tone={REQUISITION_STATUS_TONE[r.status]} />,
      toText: (r) => r.status,
    },
  ]

  async function handleSave(mr: MaterialRequisition) {
    if (!mr.id) {
      const mrNo = nextSequenceNo('MR', requisitions.map((r) => r.mrNo))
      const saved = await saveRequisition({ ...mr, mrNo })
      setRequisitions((prev) => [...prev, saved])
    } else {
      const saved = await updateRequisition(mr)
      setRequisitions((prev) => prev.map((r) => (r.id === saved.id ? saved : r)))
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
            New Requisition
          </button>
        )}
      </div>

      <DataTable
        key="material-requisitions"
        tableKey="material-requisitions"
        columns={columns}
        data={requisitions}
        getRowId={(r) => r.id}
        onRowClick={(r) => {
          setSelected(r)
          setDrawerOpen(true)
        }}
        emptyMessage="No requisitions yet."
      />

      <RequisitionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selected}
        onSave={handleSave}
        editable={editable}
      />
    </div>
  )
}
