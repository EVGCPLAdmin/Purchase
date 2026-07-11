import { useEffect, useState } from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyRequisition, type MaterialRequisition } from '../../types/purchase'
import { DEPARTMENT_OPTIONS, SITE_OPTIONS, UNIT_OPTIONS } from '../../types/options'
import { REQUISITION_STATUS_OPTIONS } from './purchaseUi'

interface Props {
  open: boolean
  onClose: () => void
  record: MaterialRequisition | null
  onSave: (mr: MaterialRequisition) => Promise<void>
  editable: boolean
}

export function RequisitionDrawer({ open, onClose, record, onSave, editable }: Props) {
  const [form, setForm] = useState<MaterialRequisition>(emptyRequisition())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(record ?? emptyRequisition())
  }, [open, record])

  function set<K extends keyof MaterialRequisition>(key: K) {
    return (value: MaterialRequisition[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? form.mrNo || 'Requisition' : 'New Requisition'}
      subtitle="Material Requisition"
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
      <div className="space-y-4">
        <FormSection title="Requisition Details">
          <FormField label="MR No." value={form.mrNo} onChange={set('mrNo')} readOnly placeholder="Auto-generated on save" />
          <FormField
            label="Status"
            type="status"
            value={form.status}
            onChange={set('status')}
            options={REQUISITION_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            disabled={!editable}
          />
          <FormField label="Part No" value={form.partNo} onChange={set('partNo')} required disabled={!editable} />
          <FormField
            label="Part Description"
            value={form.partDescription}
            onChange={set('partDescription')}
            required
            disabled={!editable}
          />
          <FormField
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={set('quantity')}
            required
            disabled={!editable}
          />
          <FormField
            label="Unit"
            type="select"
            value={form.unit}
            onChange={set('unit')}
            options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
            disabled={!editable}
          />
          <FormField
            label="Department"
            type="select"
            value={form.department}
            onChange={set('department')}
            options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
            required
            disabled={!editable}
          />
          <FormField
            label="Site"
            type="select"
            value={form.location}
            onChange={set('location')}
            options={SITE_OPTIONS.map((s) => ({ value: s, label: s }))}
            required
            disabled={!editable}
          />
          <FormField label="Requested By" value={form.requestedBy} onChange={set('requestedBy')} required disabled={!editable} />
          <FormField label="Request Date" type="date" value={form.requestDate} onChange={set('requestDate')} disabled={!editable} />
        </FormSection>
      </div>
    </Drawer>
  )
}
