'use client'

// localStorage-backed queue for POS sales made while the store PC has no
// internet. The server assigns real POS-XXXX order numbers, so a queued sale
// only gets one once useOfflineSync successfully POSTs it to /api/pos/sale —
// until then it's identified by a local id only.

const STORAGE_KEY = 'zahrtelkhlig:pos-offline-queue'

export interface QueuedSaleItem {
  productId: string
  nameAr: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

export interface QueuedSalePayload {
  items: QueuedSaleItem[]
  paymentMethod: string
  notes?: string
  discount: number
}

export interface QueuedSale {
  localId: string
  queuedAt: number
  payload: QueuedSalePayload
  status: 'pending' | 'failed'
  error?: string
}

function readQueue(): QueuedSale[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedSale[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function enqueueSale(payload: QueuedSalePayload): QueuedSale {
  const queue = readQueue()
  const entry: QueuedSale = {
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queuedAt: Date.now(),
    payload,
    status: 'pending',
  }
  queue.push(entry)
  writeQueue(queue)
  return entry
}

export function getQueue(): QueuedSale[] {
  return readQueue()
}

export function removeFromQueue(localId: string) {
  writeQueue(readQueue().filter(s => s.localId !== localId))
}

export function markFailed(localId: string, error: string) {
  writeQueue(readQueue().map(s => s.localId === localId ? { ...s, status: 'failed', error } : s))
}
