import type { StockInEntry, StockOutEntry, StockTransferEntry, StoreItem } from '../../types/stores'

export const MOCK_STORE_ITEMS: StoreItem[] = [
  {
    id: 'si_1',
    itemCode: 'RM-1001',
    itemName: 'Stainless steel bracket, 40mm',
    category: 'Raw Material',
    unitOfMeasure: 'pcs',
    quantityInStock: 340,
    reorderLevel: 100,
    unitCost: 3.2,
    location: 'Main Site',
    lastUpdated: '2026-06-28',
  },
  {
    id: 'si_2',
    itemCode: 'SP-2045',
    itemName: 'Hydraulic seal kit',
    category: 'Spare Part',
    unitOfMeasure: 'set',
    quantityInStock: 6,
    reorderLevel: 10,
    unitCost: 58,
    location: 'Warehouse A',
    lastUpdated: '2026-06-30',
  },
  {
    id: 'si_3',
    itemCode: 'CN-3312',
    itemName: 'Safety gloves (box of 100)',
    category: 'Consumable',
    unitOfMeasure: 'box',
    quantityInStock: 0,
    reorderLevel: 5,
    unitCost: 42,
    location: 'Main Site',
    lastUpdated: '2026-06-20',
  },
  {
    id: 'si_4',
    itemCode: 'PK-4501',
    itemName: 'Corrugated carton, medium',
    category: 'Packing Material',
    unitOfMeasure: 'pcs',
    quantityInStock: 1200,
    reorderLevel: 300,
    unitCost: 0.85,
    location: 'Warehouse B',
    lastUpdated: '2026-07-01',
  },
]

export const MOCK_STOCK_IN: StockInEntry[] = [
  {
    id: 'sin_1',
    transactionNo: 'SIN-0001',
    itemCode: 'RM-1001',
    itemName: 'Stainless steel bracket, 40mm',
    quantity: 200,
    source: 'PO-0001',
    receivedBy: 'Daniel Mwangi',
    date: '2026-06-15',
    remarks: 'Received in full, no damage.',
  },
]

export const MOCK_STOCK_OUT: StockOutEntry[] = [
  {
    id: 'sout_1',
    transactionNo: 'SOUT-0001',
    itemCode: 'CN-3312',
    itemName: 'Safety gloves (box of 100)',
    quantity: 5,
    purpose: 'Production Issue - Line 01',
    issuedTo: 'Line 01',
    issuedBy: 'Grace Kimani',
    date: '2026-06-22',
    remarks: '',
  },
]

export const MOCK_STOCK_TRANSFER: StockTransferEntry[] = [
  {
    id: 'stx_1',
    transactionNo: 'STX-0001',
    itemCode: 'PK-4501',
    itemName: 'Corrugated carton, medium',
    quantity: 400,
    fromLocation: 'Main Site',
    toLocation: 'Warehouse B',
    transferredBy: 'Amara Okafor',
    date: '2026-06-29',
    remarks: 'Rebalanced ahead of packing run.',
  },
]
