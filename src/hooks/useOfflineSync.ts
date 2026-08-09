'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getQueue, removeFromQueue, markFailed, type QueuedSale } from '@/lib/offlineQueue'

const RETRY_INTERVAL_MS = 15_000

export function useOfflineSync() {
  const [queue, setQueue] = useState<QueuedSale[]>(() => getQueue())
  const [syncing, setSyncing] = useState(false)
  const syncingRef = useRef(false)

  const refresh = useCallback(() => setQueue(getQueue()), [])

  const flush = useCallback(async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    try {
      for (const sale of getQueue()) {
        try {
          const res = await fetch('/api/pos/sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale.payload),
          })
          if (res.ok) {
            removeFromQueue(sale.localId)
          } else {
            const data = await res.json().catch(() => ({}))
            // Server rejected it (e.g. stock ran out while offline) — leave it
            // for the staff to see and resolve manually rather than looping
            // on it forever or silently dropping the sale.
            markFailed(sale.localId, data.error || 'فشل إرسال الفاتورة')
          }
        } catch {
          // Network still down — stop here, whatever's left stays queued.
          break
        }
        refresh()
      }
    } finally {
      refresh()
      syncingRef.current = false
      setSyncing(false)
    }
  }, [refresh])

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) flush()

    const onOnline = () => flush()
    window.addEventListener('online', onOnline)
    const interval = setInterval(() => {
      if (navigator.onLine) flush()
    }, RETRY_INTERVAL_MS)

    return () => {
      window.removeEventListener('online', onOnline)
      clearInterval(interval)
    }
  }, [flush, refresh])

  const discard = useCallback((localId: string) => {
    removeFromQueue(localId)
    refresh()
  }, [refresh])

  return { queue, syncing, flush, discard, refresh }
}
