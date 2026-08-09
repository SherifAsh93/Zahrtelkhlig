// Plain static SharedWorker (not bundled by webpack/Serwist) that polls for
// unprinted POS sales and broadcasts them to every connected browser tab.
// All WebUSB printing happens in the tab (window) context, not here.
//
// Debugging note: console output from a SharedWorker does NOT show up in a
// normal page's DevTools console — it has its own console, inspectable via
// chrome://inspect/#workers (or edge://inspect/#workers). To make polling
// visible in the ordinary page console instead, every poll tick — including
// "found nothing" and fetch failures — is reported back over the port as a
// 'poll-status' message; src/hooks/usePrinterStation.ts logs those.

const POLL_INTERVAL_MS = 5000

/** @type {MessagePort[]} */
const ports = []

function broadcast(message) {
  for (const port of ports) port.postMessage(message)
}

async function poll() {
  const startedAt = Date.now()
  try {
    const res = await fetch('/api/pos/sale/unprinted', { credentials: 'same-origin' })
    if (!res.ok) {
      console.error('[PrintWorker] poll failed: HTTP', res.status)
      broadcast({ type: 'poll-status', ok: false, error: `HTTP ${res.status}`, at: startedAt })
      return
    }
    const { orders } = await res.json()
    const count = Array.isArray(orders) ? orders.length : 0
    console.log(`[PrintWorker] poll ok — ${count} unprinted order(s)`, orders?.map(o => o.orderNumber))
    broadcast({ type: 'poll-status', ok: true, count, at: startedAt })
    if (count > 0) broadcast({ type: 'unprinted-orders', orders })
  } catch (err) {
    console.error('[PrintWorker] poll threw', err)
    broadcast({ type: 'poll-status', ok: false, error: err instanceof Error ? err.message : String(err), at: startedAt })
  }
}

self.addEventListener('connect', (event) => {
  const port = event.ports[0]
  ports.push(port)
  console.log('[PrintWorker] tab connected, total ports:', ports.length)

  port.addEventListener('message', (e) => {
    if (e.data?.type === 'poll-now') poll()
  })

  port.start()
})

setInterval(poll, POLL_INTERVAL_MS)
poll()
