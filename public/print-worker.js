// Plain static SharedWorker (not bundled by webpack/Serwist) that polls for
// unprinted POS sales and broadcasts them to every connected browser tab.
// All WebUSB printing happens in the tab (window) context, not here.

const POLL_INTERVAL_MS = 5000

/** @type {MessagePort[]} */
const ports = []

async function poll() {
  try {
    const res = await fetch('/api/pos/sale/unprinted', { credentials: 'same-origin' })
    if (!res.ok) return
    const { orders } = await res.json()
    if (orders && orders.length > 0) {
      for (const port of ports) {
        port.postMessage({ type: 'unprinted-orders', orders })
      }
    }
  } catch {
    // Network hiccup — just try again on the next tick.
  }
}

self.addEventListener('connect', (event) => {
  const port = event.ports[0]
  ports.push(port)

  port.addEventListener('message', (e) => {
    if (e.data?.type === 'poll-now') poll()
  })

  port.start()
})

setInterval(poll, POLL_INTERVAL_MS)
