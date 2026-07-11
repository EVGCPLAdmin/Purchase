export interface SavedTableView {
  columnOrder: string[]
  hiddenColumns: string[]
  columnWidths: Record<string, number>
  density: 'comfortable' | 'compact'
}

const KEY_PREFIX = 'dataTable.view.'

export function loadTableView(tableKey: string): Partial<SavedTableView> {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + tableKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTableView(tableKey: string, view: SavedTableView) {
  localStorage.setItem(KEY_PREFIX + tableKey, JSON.stringify(view))
}
