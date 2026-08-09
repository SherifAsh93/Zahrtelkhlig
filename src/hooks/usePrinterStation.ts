'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { webUsbPrinter, type PrinterStatus } from '@/lib/webusb-printer'
import { buildReceiptEscPos, type ReceiptOrder } from '@/lib/escpos'

interface UnprintedOrder extends ReceiptOrder {
  id: string
}

const RECONNECT_WATCHDOG_MS = 8000

/**
 * Wires the SharedWorker (polls for new unprinted POS sales) to the WebUSB
 * printer, and exposes printOrder() for the manual reprint button — both
 * paths share this one render -> transfer pipeline.
 *
 * Debugging: every step here logs to the normal page DevTools console with a
 * '[Printer]' prefix — filter the console by that to isolate print activity.
 * The SharedWorker's own logs ('[PrintWorker]' prefix) do NOT show up here —
 * they only appear in the worker's own console via chrome://inspect/#workers
 * — which is why poll results are also re-broadcast as 'poll-status'
 * messages and logged from this side instead.
 */
export function usePrinterStation() {
  const [status, setStatus] = useState<PrinterStatus>({ state: 'unpaired' })
  const workerRef = useRef<SharedWorker | null>(null)
  // Serializes the worker's broadcasts so overlapping canvas renders/USB
  // transfers never kick off if several new orders arrive in one poll tick.
  const printQueueRef = useRef(Promise.resolve())

  const printOrder = useCallback(async (order: ReceiptOrder) => {
    console.log('[Printer] printOrder() rendering receipt for', order.orderNumber)
    const bytes = await buildReceiptEscPos(order)
    console.log(`[Printer] printOrder() rendered ${bytes.length} bytes, sending to WebUSB…`)
    await webUsbPrinter.transferOut(bytes)
    console.log('[Printer] printOrder() transfer complete for', order.orderNumber)
  }, [])

  const claimAndPrint = useCallback((order: UnprintedOrder) => {
    printQueueRef.current = printQueueRef.current.then(async () => {
      console.log('[Printer] claimAndPrint() starting for', order.orderNumber, order.id)
      try {
        await printOrder(order)
        const res = await fetch(`/api/pos/sale/${order.id}/claim-print`, { method: 'POST' })
        const data = await res.json().catch(() => null)
        if (res.ok && data?.claimed) {
          console.log('[Printer] ✓ printed and claimed', order.orderNumber)
        } else if (res.ok) {
          console.warn('[Printer] printed', order.orderNumber, 'but another station already claimed it first — duplicate print, harmless')
        } else {
          console.error('[Printer] claim-print request failed for', order.orderNumber, res.status)
        }
      } catch (err) {
        // Leave unclaimed on failure — retried on the worker's next poll.
        console.error('[Printer] ✗ failed to print', order.orderNumber, '— will retry on next poll:', err)
      }
    })
    return printQueueRef.current
  }, [printOrder])

  const startWorker = useCallback(() => {
    if (workerRef.current) {
      console.log('[Printer] startWorker() — already running, skipping')
      return
    }
    if (typeof window === 'undefined' || typeof SharedWorker === 'undefined') {
      console.warn('[Printer] startWorker() — SharedWorker unsupported in this browser')
      return
    }
    console.log('[Printer] startWorker() — launching /print-worker.js')
    const worker = new SharedWorker('/print-worker.js')
    worker.port.onmessage = (event) => {
      if (event.data?.type === 'poll-status') {
        const { ok, count, error } = event.data as { ok: boolean; count?: number; error?: string }
        if (ok) {
          console.log(`[Printer] worker poll — ${count} unprinted order(s)`)
        } else {
          console.error('[Printer] worker poll failed:', error)
        }
      } else if (event.data?.type === 'unprinted-orders') {
        const orders = event.data.orders as UnprintedOrder[]
        console.log('[Printer] worker reported unprinted orders:', orders.map(o => o.orderNumber))
        for (const order of orders) {
          claimAndPrint(order)
        }
      }
    }
    worker.port.start()
    workerRef.current = worker
  }, [claimAndPrint])

  useEffect(() => {
    const unsubscribe = webUsbPrinter.onStatus((s) => {
      setStatus(s)
      // Start (or leave running) the poller the instant we're connected —
      // covers the initial pairing, a silent reconnect, and the watchdog
      // below all through the same path.
      if (s.state === 'connected') startWorker()
    })

    console.log('[Printer] mount — attempting silent reconnect to previously paired printer')
    webUsbPrinter.tryReconnect().then((connected) => {
      console.log('[Printer] initial tryReconnect() ->', connected)
    })

    // WebUSB devices on cheap thermal printers drop out under load; if we're
    // not connected but a device was paired before, keep quietly retrying
    // instead of requiring a full page reload to notice it's back.
    const watchdog = setInterval(() => {
      if (!webUsbPrinter.isConnected) {
        console.log('[Printer] watchdog — not connected, retrying silent reconnect…')
        webUsbPrinter.tryReconnect()
      }
    }, RECONNECT_WATCHDOG_MS)

    return () => {
      unsubscribe()
      clearInterval(watchdog)
      workerRef.current?.port.close()
      workerRef.current = null
    }
  }, [startWorker])

  const pair = useCallback(async () => {
    const ok = await webUsbPrinter.pair()
    if (ok) startWorker()
    return ok
  }, [startWorker])

  const unpair = useCallback(() => {
    webUsbPrinter.unpair()
    workerRef.current?.port.close()
    workerRef.current = null
  }, [])

  return { status, pair, unpair, printOrder }
}
