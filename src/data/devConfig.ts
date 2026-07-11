const STORAGE_KEY = 'devConfig.sheets'

export interface SheetTabNames {
  requisitions: string
  purchaseOrders: string
  storeItems: string
  stockIn: string
  stockOut: string
  stockTransfer: string
  users: string
  groups: string
}

export const DEFAULT_TAB_NAMES: SheetTabNames = {
  requisitions: 'MaterialRequisitions',
  purchaseOrders: 'PurchaseOrders',
  storeItems: 'StoreItems',
  stockIn: 'StockIn',
  stockOut: 'StockOut',
  stockTransfer: 'StockTransfer',
  users: 'Users',
  groups: 'Groups',
}

export interface DevConfig {
  execUrl: string
  spreadsheetId: string
  tabNames: SheetTabNames
}

export function loadDevConfig(): DevConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDevConfig()
    const parsed = JSON.parse(raw)
    return {
      execUrl: parsed.execUrl ?? '',
      spreadsheetId: parsed.spreadsheetId ?? '',
      tabNames: { ...DEFAULT_TAB_NAMES, ...(parsed.tabNames ?? {}) },
    }
  } catch {
    return defaultDevConfig()
  }
}

export function saveDevConfig(config: DevConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

function defaultDevConfig(): DevConfig {
  return { execUrl: '', spreadsheetId: '', tabNames: DEFAULT_TAB_NAMES }
}

/** Resolution order: localStorage Developer Config override, then build-time env var, then unset (mock only). */
export function resolveExecUrl(): string {
  const fromStorage = loadDevConfig().execUrl
  if (fromStorage) return fromStorage
  return import.meta.env.VITE_SHEETS_API_URL ?? ''
}
