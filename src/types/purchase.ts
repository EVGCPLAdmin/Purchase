export type RequisitionStatus = 'Pending' | 'Approved' | 'Converted to PO' | 'Rejected'

export interface MaterialRequisition {
  id: string
  mrNo: string
  partNo: string
  partDescription: string
  quantity: number
  unit: string
  department: string
  location: string
  requestedBy: string
  requestDate: string
  status: RequisitionStatus
}

export type PurchaseOrderStatus = 'draft' | 'approved' | 'ordered' | 'received' | 'cancelled'

export interface PurchaseOrderItem {
  id: string
  mrId?: string
  partNo: string
  description: string
  quantity: number
  unit: string
  rate: number
  taxPercent: number
}

export interface PurchaseOrderDoc {
  id: string
  poNumber: string
  poDate: string
  vendorName: string
  vendorAddress: string
  vendorGstin: string
  quoteRefNo: string
  billingAddress: string
  shippingAddress: string
  items: PurchaseOrderItem[]
  additionalCharges: number
  authorizedSignatory: string
  status: PurchaseOrderStatus
  requestedBy: string
}

export function emptyRequisition(): MaterialRequisition {
  return {
    id: '',
    mrNo: '',
    partNo: '',
    partDescription: '',
    quantity: 0,
    unit: '',
    department: '',
    location: '',
    requestedBy: '',
    requestDate: new Date().toISOString().slice(0, 10),
    status: 'Pending',
  }
}

export function emptyPurchaseOrder(): PurchaseOrderDoc {
  return {
    id: '',
    poNumber: '',
    poDate: new Date().toISOString().slice(0, 10),
    vendorName: '',
    vendorAddress: '',
    vendorGstin: '',
    quoteRefNo: '',
    billingAddress: '',
    shippingAddress: '',
    items: [],
    additionalCharges: 0,
    authorizedSignatory: '',
    status: 'draft',
    requestedBy: '',
  }
}

export function emptyPurchaseOrderItem(): PurchaseOrderItem {
  return { id: '', partNo: '', description: '', quantity: 0, unit: '', rate: 0, taxPercent: 0 }
}

export interface PurchaseOrderTotals {
  subtotal: number
  totalTax: number
  netAmount: number
}

export function itemAmount(item: PurchaseOrderItem) {
  return item.quantity * item.rate
}
export function itemTaxAmount(item: PurchaseOrderItem) {
  return itemAmount(item) * (item.taxPercent / 100)
}
export function itemLineTotal(item: PurchaseOrderItem) {
  return itemAmount(item) + itemTaxAmount(item)
}

export function purchaseOrderTotals(doc: Pick<PurchaseOrderDoc, 'items' | 'additionalCharges'>): PurchaseOrderTotals {
  const subtotal = doc.items.reduce((sum, it) => sum + itemAmount(it), 0)
  const totalTax = doc.items.reduce((sum, it) => sum + itemTaxAmount(it), 0)
  const netAmount = subtotal + totalTax + doc.additionalCharges
  return { subtotal, totalTax, netAmount }
}
