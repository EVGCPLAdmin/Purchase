export type StoreCategory = 'Raw Material' | 'Consumable' | 'Spare Part' | 'Finished Goods' | 'Packing Material'

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface StoreItem {
  id: string
  itemCode: string
  itemName: string
  category: StoreCategory
  unitOfMeasure: string
  quantityInStock: number
  reorderLevel: number
  unitCost: number
  location: string
  lastUpdated: string
}

export interface StockInEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  source: string
  receivedBy: string
  date: string
  remarks: string
}

export interface StockOutEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  purpose: string
  issuedTo: string
  issuedBy: string
  date: string
  remarks: string
}

export interface StockTransferEntry {
  id: string
  transactionNo: string
  itemCode: string
  itemName: string
  quantity: number
  fromLocation: string
  toLocation: string
  transferredBy: string
  date: string
  remarks: string
}

export function stockStatus(item: Pick<StoreItem, 'quantityInStock' | 'reorderLevel'>): StockStatus {
  if (item.quantityInStock <= 0) return 'Out of Stock'
  if (item.quantityInStock <= item.reorderLevel) return 'Low Stock'
  return 'In Stock'
}

export const STOCK_STATUS_TONE: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
}

export const STORE_CATEGORY_OPTIONS: StoreCategory[] = [
  'Raw Material',
  'Consumable',
  'Spare Part',
  'Finished Goods',
  'Packing Material',
]

export function emptyStoreItem(): StoreItem {
  return {
    id: '',
    itemCode: '',
    itemName: '',
    category: 'Raw Material',
    unitOfMeasure: '',
    quantityInStock: 0,
    reorderLevel: 0,
    unitCost: 0,
    location: '',
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
}

export function emptyStockInEntry(): StockInEntry {
  return {
    id: '',
    transactionNo: '',
    itemCode: '',
    itemName: '',
    quantity: 0,
    source: '',
    receivedBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}

export function emptyStockOutEntry(): StockOutEntry {
  return {
    id: '',
    transactionNo: '',
    itemCode: '',
    itemName: '',
    quantity: 0,
    purpose: '',
    issuedTo: '',
    issuedBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}

export function emptyStockTransferEntry(): StockTransferEntry {
  return {
    id: '',
    transactionNo: '',
    itemCode: '',
    itemName: '',
    quantity: 0,
    fromLocation: '',
    toLocation: '',
    transferredBy: '',
    date: new Date().toISOString().slice(0, 10),
    remarks: '',
  }
}
