import { useEffect, useMemo, useState } from 'react'
import { Plus, Printer, Trash2 } from 'lucide-react'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import {
  emptyPurchaseOrder,
  emptyPurchaseOrderItem,
  itemAmount,
  itemLineTotal,
  itemTaxAmount,
  purchaseOrderTotals,
  type PurchaseOrderDoc,
  type PurchaseOrderItem,
} from '../../types/purchase'
import type { MaterialRequisition } from '../../types/purchase'
import { PO_STATUS_OPTIONS, poStatusLabel } from './purchaseUi'
import { useSettings } from '../../context/SettingsContext'
import { money, currencySymbol, currencyWords } from '../../lib/money'
import { numberToWords } from '../../lib/numberToWords'
import { generateId } from '../../lib/id'

interface Props {
  open: boolean
  onClose: () => void
  record: PurchaseOrderDoc | null
  onSave: (po: PurchaseOrderDoc) => Promise<void>
  onPrintPreview: (po: PurchaseOrderDoc) => void
  editable: boolean
  requisitions: MaterialRequisition[]
}

export function PurchaseOrderDrawer({ open, onClose, record, onSave, onPrintPreview, editable, requisitions }: Props) {
  const [form, setForm] = useState<PurchaseOrderDoc>(emptyPurchaseOrder())
  const [saving, setSaving] = useState(false)
  const [pickedMrId, setPickedMrId] = useState('')
  const { settings } = useSettings()

  useEffect(() => {
    if (open) {
      setForm(record ?? emptyPurchaseOrder())
      setPickedMrId('')
    }
  }, [open, record])

  function set<K extends keyof PurchaseOrderDoc>(key: K) {
    return (value: PurchaseOrderDoc[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  const availableRequisitions = useMemo(
    () =>
      requisitions.filter(
        (mr) => mr.status === 'Approved' && !form.items.some((it) => it.mrId === mr.id),
      ),
    [requisitions, form.items],
  )

  function addFromRequisition() {
    const mr = requisitions.find((r) => r.id === pickedMrId)
    if (!mr) return
    const item: PurchaseOrderItem = {
      ...emptyPurchaseOrderItem(),
      id: generateId('poi'),
      mrId: mr.id,
      partNo: mr.partNo,
      description: mr.partDescription,
      quantity: mr.quantity,
      unit: mr.unit,
    }
    setForm((f) => ({ ...f, items: [...f.items, item] }))
    setPickedMrId('')
  }

  function addBlankItem() {
    setForm((f) => ({ ...f, items: [...f.items, { ...emptyPurchaseOrderItem(), id: generateId('poi') }] }))
  }

  function updateItem(id: string, patch: Partial<PurchaseOrderItem>) {
    setForm((f) => ({ ...f, items: f.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }))
  }

  function removeItem(id: string) {
    setForm((f) => ({ ...f, items: f.items.filter((it) => it.id !== id) }))
  }

  const totals = purchaseOrderTotals(form)
  const { words, minorWords } = currencyWords(settings.currency)
  const amountInWords = numberToWords(totals.netAmount, words, minorWords)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ ...form, additionalCharges: Number(form.additionalCharges) || 0 })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? form.poNumber || 'Purchase Order' : 'New Purchase Order'}
      subtitle="Purchase Order"
      width="wide"
      footer={
        <>
          {record && (
            <button type="button" className="btn-outline mr-auto" onClick={() => onPrintPreview(form)}>
              <Printer className="h-4 w-4" />
              Print Preview
            </button>
          )}
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
        <FormSection title="PO Header">
          <FormField label="PO Number" value={form.poNumber} onChange={set('poNumber')} readOnly placeholder="Auto-generated on save" />
          <FormField label="PO Date" type="date" value={form.poDate} onChange={set('poDate')} disabled={!editable} />
          <FormField label="Vendor Name" value={form.vendorName} onChange={set('vendorName')} required disabled={!editable} />
          <FormField label={settings.taxIdLabel} value={form.vendorGstin} onChange={set('vendorGstin')} disabled={!editable} />
          <FormField label="Quote Ref No." value={form.quoteRefNo} onChange={set('quoteRefNo')} disabled={!editable} />
          <FormField
            label="Status"
            type="status"
            value={form.status}
            onChange={set('status')}
            options={PO_STATUS_OPTIONS.map((s) => ({ value: s, label: poStatusLabel(s) }))}
            disabled={!editable}
          />
          <FormField label="Vendor Address" type="textarea" value={form.vendorAddress} onChange={set('vendorAddress')} disabled={!editable} />
          <FormField label="Billing Address" value={form.billingAddress} onChange={set('billingAddress')} disabled={!editable} />
          <FormField label="Shipping Address" value={form.shippingAddress} onChange={set('shippingAddress')} disabled={!editable} />
          <FormField label="Requested By" value={form.requestedBy} onChange={set('requestedBy')} disabled={!editable} />
        </FormSection>

        <fieldset className="card p-4">
          <legend className="px-1 text-sm font-semibold text-primary">Items</legend>

          {editable && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select className="select max-w-xs" value={pickedMrId} onChange={(e) => setPickedMrId(e.target.value)}>
                <option value="">Select an approved requisition…</option>
                {availableRequisitions.map((mr) => (
                  <option key={mr.id} value={mr.id}>
                    {mr.mrNo} — {mr.partDescription}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-outline" disabled={!pickedMrId} onClick={addFromRequisition}>
                <Plus className="h-4 w-4" />
                Add from Requisition
              </button>
              <button type="button" className="btn-outline" onClick={addBlankItem}>
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          )}

          <div className="overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold text-muted">
                  <th className="px-2 py-2">Part No</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Unit</th>
                  <th className="px-2 py-2">Rate</th>
                  <th className="px-2 py-2">Tax %</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Tax Amt</th>
                  <th className="px-2 py-2">Line Total</th>
                  {editable && <th className="px-2 py-2" />}
                </tr>
              </thead>
              <tbody>
                {form.items.length === 0 && (
                  <tr>
                    <td colSpan={editable ? 10 : 9} className="px-2 py-8 text-center text-muted">
                      No items yet — add one from a Material Requisition or as a blank item.
                    </td>
                  </tr>
                )}
                {form.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="p-1">
                      <input
                        className="input"
                        value={item.partNo}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { partNo: e.target.value })}
                      />
                    </td>
                    <td className="p-1 min-w-[180px]">
                      <input
                        className="input"
                        value={item.description}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="p-1 w-20">
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-1 w-20">
                      <input
                        className="input"
                        value={item.unit}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                      />
                    </td>
                    <td className="p-1 w-24">
                      <input
                        type="number"
                        className="input"
                        value={item.rate}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-1 w-20">
                      <input
                        type="number"
                        className="input"
                        value={item.taxPercent}
                        disabled={!editable}
                        onChange={(e) => updateItem(item.id, { taxPercent: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-2 py-1 tabular-nums text-muted">{money(itemAmount(item), settings.currency)}</td>
                    <td className="px-2 py-1 tabular-nums text-muted">{money(itemTaxAmount(item), settings.currency)}</td>
                    <td className="px-2 py-1 tabular-nums font-medium">{money(itemLineTotal(item), settings.currency)}</td>
                    {editable && (
                      <td className="p-1 text-center">
                        <button type="button" className="btn-ghost !p-1.5 text-danger" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        <FormSection title="Totals & Sign-off">
          <FormField label="Subtotal" type="currency" value={totals.subtotal} onChange={() => {}} readOnly disabled currencySymbol={currencySymbol(settings.currency)} />
          <FormField label="Total Tax" type="currency" value={totals.totalTax} onChange={() => {}} readOnly disabled currencySymbol={currencySymbol(settings.currency)} />
          <FormField
            label="Additional Charges"
            type="currency"
            value={form.additionalCharges}
            onChange={set('additionalCharges')}
            disabled={!editable}
            currencySymbol={currencySymbol(settings.currency)}
          />
          <FormField label="Net Amount" type="currency" value={totals.netAmount} onChange={() => {}} readOnly disabled currencySymbol={currencySymbol(settings.currency)} />
          <FormField label="Amount in Words" type="textarea" value={amountInWords} onChange={() => {}} readOnly disabled span2 />
          <FormField label="Authorized Signatory" type="signature" value={form.authorizedSignatory} onChange={set('authorizedSignatory')} disabled={!editable} />
        </FormSection>
      </div>
    </Drawer>
  )
}
