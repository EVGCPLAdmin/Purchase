import { generateId } from '../lib/id'
import type { MaterialRequisition, PurchaseOrderDoc } from '../types/purchase'
import type { StockInEntry, StockOutEntry, StockTransferEntry, StoreItem } from '../types/stores'
import type { Group, User } from '../types/access'
import { MOCK_REQUISITIONS, MOCK_PURCHASE_ORDERS } from './mock/purchase.mock'
import { MOCK_STORE_ITEMS, MOCK_STOCK_IN, MOCK_STOCK_OUT, MOCK_STOCK_TRANSFER } from './mock/stores.mock'
import { MOCK_GROUPS, MOCK_USERS } from './mock/access.mock'
import { loadDevConfig } from './devConfig'
import { sheetsGet, sheetsUpsert } from './sheetsClient'

/**
 * Single data-access seam: every page reads/writes through this module.
 * Each `load*` tries the configured Sheets API tab, falling back to bundled
 * mock data if the API URL isn't configured or the live call fails.
 */

async function loadEntity<T>(tabKey: keyof ReturnType<typeof loadDevConfig>['tabNames'], mock: T[]): Promise<T[]> {
  const config = loadDevConfig()
  const tabName = config.tabNames[tabKey]
  try {
    return await sheetsGet<T>(tabName)
  } catch {
    return mock
  }
}

async function upsertEntity<T extends { id: string }>(
  tabKey: keyof ReturnType<typeof loadDevConfig>['tabNames'],
  record: T,
): Promise<T> {
  const config = loadDevConfig()
  const tabName = config.tabNames[tabKey]
  try {
    return await sheetsUpsert<T>(tabName, record)
  } catch {
    return record
  }
}

// --- Material Requisitions -------------------------------------------------

export function loadRequisitions() {
  return loadEntity<MaterialRequisition>('requisitions', MOCK_REQUISITIONS)
}
export function saveRequisition(mr: Omit<MaterialRequisition, 'id'> & { id?: string }) {
  const record: MaterialRequisition = { ...mr, id: mr.id || generateId('mr') }
  return upsertEntity('requisitions', record)
}
export function updateRequisition(mr: MaterialRequisition) {
  return upsertEntity('requisitions', mr)
}

// --- Purchase Orders ---------------------------------------------------------

export function loadPurchaseOrders() {
  return loadEntity<PurchaseOrderDoc>('purchaseOrders', MOCK_PURCHASE_ORDERS)
}
export function savePurchaseOrder(po: Omit<PurchaseOrderDoc, 'id'> & { id?: string }) {
  const record: PurchaseOrderDoc = { ...po, id: po.id || generateId('po') }
  return upsertEntity('purchaseOrders', record)
}
export function updatePurchaseOrder(po: PurchaseOrderDoc) {
  return upsertEntity('purchaseOrders', po)
}

// --- Store Items -------------------------------------------------------------

export function loadStoreItems() {
  return loadEntity<StoreItem>('storeItems', MOCK_STORE_ITEMS)
}
export function saveStoreItem(item: Omit<StoreItem, 'id'> & { id?: string }) {
  const record: StoreItem = { ...item, id: item.id || generateId('si') }
  return upsertEntity('storeItems', record)
}
export function updateStoreItem(item: StoreItem) {
  return upsertEntity('storeItems', item)
}

// --- Stock In / Out / Transfer (append-only logs) ----------------------------

export function loadStockIn() {
  return loadEntity<StockInEntry>('stockIn', MOCK_STOCK_IN)
}
export function saveStockIn(entry: Omit<StockInEntry, 'id'> & { id?: string }) {
  const record: StockInEntry = { ...entry, id: entry.id || generateId('sin') }
  return upsertEntity('stockIn', record)
}

export function loadStockOut() {
  return loadEntity<StockOutEntry>('stockOut', MOCK_STOCK_OUT)
}
export function saveStockOut(entry: Omit<StockOutEntry, 'id'> & { id?: string }) {
  const record: StockOutEntry = { ...entry, id: entry.id || generateId('sout') }
  return upsertEntity('stockOut', record)
}

export function loadStockTransfer() {
  return loadEntity<StockTransferEntry>('stockTransfer', MOCK_STOCK_TRANSFER)
}
export function saveStockTransfer(entry: Omit<StockTransferEntry, 'id'> & { id?: string }) {
  const record: StockTransferEntry = { ...entry, id: entry.id || generateId('stx') }
  return upsertEntity('stockTransfer', record)
}

// --- Users & Groups (Admin) ---------------------------------------------------

export function loadUsers() {
  return loadEntity<User>('users', MOCK_USERS)
}
export function saveUser(user: Omit<User, 'id'> & { id?: string }) {
  const record: User = { ...user, id: user.id || generateId('usr') }
  return upsertEntity('users', record)
}
export function updateUser(user: User) {
  return upsertEntity('users', user)
}

export function loadGroups() {
  return loadEntity<Group>('groups', MOCK_GROUPS)
}
export function saveGroup(group: Omit<Group, 'id'> & { id?: string }) {
  const record: Group = { ...group, id: group.id || generateId('grp') }
  return upsertEntity('groups', record)
}
export function updateGroup(group: Group) {
  return upsertEntity('groups', group)
}
