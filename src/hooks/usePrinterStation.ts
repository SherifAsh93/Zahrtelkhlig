'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { webUsbPrinter, type PrinterStatus } from '@/lib/webusb-printer'
import { buildReceiptEscPos, type ReceiptOrder } from '@/lib/escpos'

interface UnprintedOrder extends ReceiptOrder {
  id: string
}

/**
 * Wires the SharedWorker (polls for new unprinted POS sales) to the WebUSB
 * printer, and exposes printOrder() for the manual reprint button — both
 * paths share this one render -> transfer pipeline.
 */
export function usePrinterStation() {
  const [status, setStatus] = useState<PrinterStatus>({ state: 'unpaired' })
  const workerRef = useRef<SharedWorker | null>(null)
  // Serializes the worker's broadcasts so overlapping canvas renders/USB
  // transfers never kick off if several new orders arrive in one poll tick.
  const printQueueRef = useRef(Promise.resolve())

  const printOrder = useCallback(async (order: ReceiptOrder) => {
    const bytes = await buildReceiptEscPos(order)
    await webUsbPrinter.transferOut(bytes)
  }, [])

  const claimAndPrint = useCallback((order: UnprintedOrder) => {
    printQueueRef.current = printQueueRef.current.then(async () => {
      try {
        await printOrder(order)
        await fetch(`/api/pos/sale/${order.id}/claim-print`, { method: 'POST' })
      } catch {
        // Leave unclaimed on failure — retried on the worker's next poll.
      }
    })
    return printQueueRef.current
  }, [printOrder])

  const startWorker = useCallback(() => {
    if (workerRef.current || typeof window === 'undefined' || typeof SharedWorker === 'undefined') return
    const worker = new SharedWorker('/print-worker.js')
    worker.port.onmessage = (event) => {
      if (event.data?.type === 'unprinted-orders') {
        for (const order of event.data.orders as UnprintedOrder[]) {
          claimAndPrint(order)
        }
      }
    }
    worker.port.start()
    workerRef.current = worker
  }, [claimAndPrint])

  useEffect(() => {
    const unsubscribe = webUsbPrinter.onStatus(setStatus)
    webUsbPrinter.tryReconnect().then((connected) => {
      if (connected) startWorker()
    })
    return () => {
      unsubscribe()
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
