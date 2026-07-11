import { useMemo, useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnOrderState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Columns3, Download, Rows3, GripVertical } from 'lucide-react'
import { loadTableView, saveTableView, type SavedTableView } from './dataTableViews'

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: number
  nowrap?: boolean
  accessor?: (row: T) => unknown
  render?: (row: T) => React.ReactNode
  toText?: (row: T) => string
}

interface DataTableProps<T> {
  tableKey: string
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  rowsBeforeScroll?: number
}

const ROW_HEIGHT = { comfortable: 52, compact: 38 }

export function DataTable<T>({
  tableKey,
  columns,
  data,
  getRowId,
  onRowClick,
  emptyMessage = 'No records found.',
  rowsBeforeScroll = 12,
}: DataTableProps<T>) {
  const saved = useMemo(() => loadTableView(tableKey), [tableKey])
  const allKeys = useMemo(() => columns.map((c) => c.key), [columns])

  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    saved.columnOrder && saved.columnOrder.every((k) => allKeys.includes(k)) ? saved.columnOrder : allKeys,
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    Object.fromEntries(allKeys.map((k) => [k, !(saved.hiddenColumns ?? []).includes(k)])),
  )
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(saved.columnWidths ?? {})
  const [density, setDensity] = useState<'comfortable' | 'compact'>(saved.density ?? 'comfortable')
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false)
  const dragKey = useRef<string | null>(null)

  useEffect(() => {
    const view: SavedTableView = {
      columnOrder,
      hiddenColumns: allKeys.filter((k) => columnVisibility[k] === false),
      columnWidths,
      density,
    }
    saveTableView(tableKey, view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableKey, columnOrder, columnVisibility, columnWidths, density])

  const colDefs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        header: col.header,
        accessorFn: (row: T) => (col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key]),
        cell: (info) => (col.render ? col.render(info.row.original) : String(info.getValue() ?? '—')),
        enableSorting: true,
      })),
    [columns],
  )

  const filteredData = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const text = col.toText ? col.toText(row) : String(col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key] ?? '')
        return text.toLowerCase().includes(q)
      }),
    )
  }, [data, search, columns])

  const table = useReactTable({
    data: filteredData,
    columns: colDefs,
    state: { sorting, columnOrder, columnVisibility },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  })

  function handleDragStart(key: string) {
    dragKey.current = key
  }
  function handleDrop(targetKey: string) {
    const source = dragKey.current
    dragKey.current = null
    if (!source || source === targetKey) return
    setColumnOrder((order) => {
      const next = order.filter((k) => k !== source)
      const targetIndex = next.indexOf(targetKey)
      next.splice(targetIndex, 0, source)
      return next
    })
  }

  function startResize(key: string, startX: number) {
    const startWidth = columnWidths[key] ?? columns.find((c) => c.key === key)?.width ?? 160
    function onMove(e: MouseEvent) {
      const next = Math.max(60, startWidth + (e.clientX - startX))
      setColumnWidths((w) => ({ ...w, [key]: next }))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function exportCsv() {
    const visibleCols = columns.filter((c) => columnVisibility[c.key] !== false)
    const orderedCols = columnOrder.map((k) => visibleCols.find((c) => c.key === k)).filter((c): c is DataTableColumn<T> => !!c)
    const header = orderedCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',')
    const rows = filteredData.map((row) =>
      orderedCols
        .map((c) => {
          const text = c.toText ? c.toText(row) : String(c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key] ?? '')
          return `"${text.replace(/"/g, '""')}"`
        })
        .join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableKey}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const rowHeight = ROW_HEIGHT[density]
  const maxHeight = rowHeight * rowsBeforeScroll + 44

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="input pl-8"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable'))}
          title="Toggle row density"
        >
          <Rows3 className="h-4 w-4" />
          {density === 'comfortable' ? 'Comfortable' : 'Compact'}
        </button>
        <div className="relative">
          <button type="button" className="btn-outline" onClick={() => setColumnsMenuOpen((o) => !o)}>
            <Columns3 className="h-4 w-4" />
            Columns
          </button>
          {columnsMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColumnsMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 max-h-72 w-56 overflow-auto rounded-lg border border-border bg-surface p-2 shadow-card">
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={columnVisibility[col.key] !== false}
                      onChange={(e) => setColumnVisibility((v) => ({ ...v, [col.key]: e.target.checked }))}
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        <button type="button" className="btn-outline" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-[1] bg-surface-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const col = columns.find((c) => c.key === header.column.id)
                  const width = columnWidths[header.column.id] ?? col?.width
                  const sortDir = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      draggable
                      onDragStart={() => handleDragStart(header.column.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(header.column.id)}
                      style={{ width, minWidth: width }}
                      className="relative select-none border-b border-border px-3 py-2 text-left align-top text-xs font-semibold text-muted"
                    >
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted/60" />
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-text"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' && <ArrowUp className="h-3 w-3" />}
                          {sortDir === 'desc' && <ArrowDown className="h-3 w-3" />}
                          {!sortDir && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                        </button>
                      </div>
                      <div
                        onMouseDown={(e) => startResize(header.column.id, e.clientX)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/40"
                      />
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                style={{ height: rowHeight }}
                className={`${i % 2 === 1 ? 'bg-surface-2/40' : ''} ${onRowClick ? 'cursor-pointer hover:bg-surface-2' : ''} border-b border-border last:border-b-0`}
              >
                {row.getVisibleCells().map((cell) => {
                  const col = columns.find((c) => c.key === cell.column.id)
                  return (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 align-top text-text ${col?.nowrap ? 'whitespace-nowrap' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
