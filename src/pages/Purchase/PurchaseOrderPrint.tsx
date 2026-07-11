import { Drawer } from '../../components/ui/Drawer'
import {
  itemAmount,
  itemLineTotal,
  itemTaxAmount,
  purchaseOrderTotals,
  type PurchaseOrderDoc,
} from '../../types/purchase'
import { useSettings } from '../../context/SettingsContext'
import { money, currencyWords } from '../../lib/money'
import { numberToWords } from '../../lib/numberToWords'

interface Props {
  open: boolean
  onClose: () => void
  doc: PurchaseOrderDoc | null
}

export function PurchaseOrderPrint({ open, onClose, doc }: Props) {
  const { settings } = useSettings()
  if (!doc) return null
  const totals = purchaseOrderTotals(doc)
  const { words, minorWords } = currencyWords(settings.currency)
  const amountInWords = numberToWords(totals.netAmount, words, minorWords)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Print Preview"
      subtitle={doc.poNumber}
      width="wide"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={() => window.print()}>
            Print
          </button>
        </>
      }
    >
      <div id="po-print-area" className="mx-auto max-w-3xl bg-white p-8 text-[13px] leading-relaxed text-black print:p-0">
        <div className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <h1 className="text-xl font-bold">{settings.legalName || settings.appName}</h1>
            {settings.headquarters && <p>{settings.headquarters}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">PURCHASE ORDER</h2>
            <p>PO No: {doc.poNumber}</p>
            <p>Date: {doc.poDate}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div>
            <p className="mb-1 font-semibold uppercase text-neutral-600">Vendor</p>
            <p className="font-medium">{doc.vendorName}</p>
            <p className="whitespace-pre-line">{doc.vendorAddress}</p>
            {doc.vendorGstin && (
              <p>
                {settings.taxIdLabel}: {doc.vendorGstin}
              </p>
            )}
            {doc.quoteRefNo && <p>Quote Ref: {doc.quoteRefNo}</p>}
          </div>
          <div>
            <p className="mb-1 font-semibold uppercase text-neutral-600">Billing Address</p>
            <p className="whitespace-pre-line">{doc.billingAddress}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold uppercase text-neutral-600">Shipping Address</p>
            <p className="whitespace-pre-line">{doc.shippingAddress}</p>
          </div>
        </div>

        <table className="mb-4 w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-1.5 pr-2">Part No</th>
              <th className="py-1.5 pr-2">Description</th>
              <th className="py-1.5 pr-2 text-right">Qty</th>
              <th className="py-1.5 pr-2">Unit</th>
              <th className="py-1.5 pr-2 text-right">Rate</th>
              <th className="py-1.5 pr-2 text-right">Tax %</th>
              <th className="py-1.5 pr-2 text-right">Amount</th>
              <th className="py-1.5 pr-2 text-right">Tax Amt</th>
              <th className="py-1.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-300">
                <td className="py-1.5 pr-2">{item.partNo}</td>
                <td className="py-1.5 pr-2">{item.description}</td>
                <td className="py-1.5 pr-2 text-right">{item.quantity}</td>
                <td className="py-1.5 pr-2">{item.unit}</td>
                <td className="py-1.5 pr-2 text-right">{money(item.rate, settings.currency)}</td>
                <td className="py-1.5 pr-2 text-right">{item.taxPercent}%</td>
                <td className="py-1.5 pr-2 text-right">{money(itemAmount(item), settings.currency)}</td>
                <td className="py-1.5 pr-2 text-right">{money(itemTaxAmount(item), settings.currency)}</td>
                <td className="py-1.5 text-right">{money(itemLineTotal(item), settings.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-6 flex justify-end">
          <table className="w-64">
            <tbody>
              <tr>
                <td className="py-0.5">Subtotal</td>
                <td className="py-0.5 text-right">{money(totals.subtotal, settings.currency)}</td>
              </tr>
              <tr>
                <td className="py-0.5">Total Tax</td>
                <td className="py-0.5 text-right">{money(totals.totalTax, settings.currency)}</td>
              </tr>
              <tr>
                <td className="py-0.5">Additional Charges</td>
                <td className="py-0.5 text-right">{money(doc.additionalCharges, settings.currency)}</td>
              </tr>
              <tr className="border-t-2 border-black font-bold">
                <td className="py-1">Net Amount</td>
                <td className="py-1 text-right">{money(totals.netAmount, settings.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-8">
          <span className="font-semibold">Amount in Words: </span>
          {amountInWords}
        </p>

        <div className="flex justify-end">
          <div className="text-center">
            <p className="mb-8 border-b border-black px-8 pt-6">{doc.authorizedSignatory || ' '}</p>
            <p className="text-xs text-neutral-600">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
