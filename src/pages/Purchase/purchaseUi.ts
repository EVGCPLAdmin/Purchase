import type { Tone } from '../../components/ui/StatusChip'
import type { PurchaseOrderStatus, RequisitionStatus } from '../../types/purchase'

export const REQUISITION_STATUS_TONE: Record<RequisitionStatus, Tone> = {
  Pending: 'neutral',
  Approved: 'info',
  'Converted to PO': 'success',
  Rejected: 'danger',
}

export const REQUISITION_STATUS_OPTIONS: RequisitionStatus[] = ['Pending', 'Approved', 'Converted to PO', 'Rejected']

export const PO_STATUS_TONE: Record<PurchaseOrderStatus, Tone> = {
  draft: 'neutral',
  approved: 'info',
  ordered: 'primary',
  received: 'success',
  cancelled: 'danger',
}

export const PO_STATUS_OPTIONS: PurchaseOrderStatus[] = ['draft', 'approved', 'ordered', 'received', 'cancelled']

export function poStatusLabel(status: PurchaseOrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
