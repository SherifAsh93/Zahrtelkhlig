'use client'

// Thin wrapper around the WebUSB API for talking directly to the Xprinter
// XP-N160II with raw ESC/POS bytes — no window.print(), no OS print dialog.
//
// Pairing requires a user gesture the first time (browser security rule), via
// pair(). After that, the matched vendorId/productId are stored so future
// page loads can silently reconnect with tryReconnect() (no prompt).

const STORAGE_KEY = 'zahrtelkhlig:printer-device'

interface StoredDevice {
  vendorId: number
  productId: number
}

export type PrinterState = 'unpaired' | 'disconnected' | 'connecting' | 'connected' | 'error'

export interface PrinterStatus {
  state: PrinterState
  message?: string
}

function getStoredDevice(): StoredDevice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as StoredDevice : null
  } catch {
    return null
  }
}

function setStoredDevice(device: StoredDevice) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(device))
}

function clearStoredDevice() {
  localStorage.removeItem(STORAGE_KEY)
}

function findBulkOutEndpoint(device: USBDevice): { interfaceNumber: number; endpointNumber: number } | null {
  const config = device.configuration
  if (!config) return null
  for (const iface of config.interfaces) {
    const endpoint = iface.alternate.endpoints.find(e => e.direction === 'out' && e.type === 'bulk')
    if (endpoint) return { interfaceNumber: iface.interfaceNumber, endpointNumber: endpoint.endpointNumber }
  }
  return null
}

class WebUsbPrinter {
  private device: USBDevice | null = null
  private outEndpoint: number | null = null
  private listeners = new Set<(status: PrinterStatus) => void>()
  // A tail promise that always resolves (errors are swallowed on the tail
  // itself) so a failed print never permanently blocks later prints — each
  // caller still gets the real success/failure via the promise returned
  // from transferOut/print.
  private tail: Promise<void> = Promise.resolve()

  constructor() {
    if (typeof navigator !== 'undefined' && navigator.usb) {
      navigator.usb.addEventListener('disconnect', (event) => {
        if (this.device && event.device === this.device) {
          this.device = null
          this.outEndpoint = null
          this.emit({ state: 'disconnected', message: 'تم فصل الطابعة' })
        }
      })
    }
  }

  onStatus(callback: (status: PrinterStatus) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private emit(status: PrinterStatus) {
    for (const listener of this.listeners) listener(status)
  }

  get isConnected() {
    return this.device !== null && this.outEndpoint !== null
  }

  /** Must be called directly from a user click handler (browser requires a gesture). */
  async pair(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.usb) {
      this.emit({ state: 'error', message: 'هذا المتصفح لا يدعم WebUSB — استخدم Chrome أو Edge' })
      return false
    }
    try {
      const device = await navigator.usb.requestDevice({ filters: [{}] })
      setStoredDevice({ vendorId: device.vendorId, productId: device.productId })
      await this.connect(device)
      return true
    } catch (err) {
      this.emit({ state: 'error', message: err instanceof Error ? err.message : 'تعذر إقران الطابعة' })
      return false
    }
  }

  /** Silent reconnect using a previously paired device — no prompt shown. */
  async tryReconnect(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.usb) return false
    const stored = getStoredDevice()
    if (!stored) {
      this.emit({ state: 'unpaired' })
      return false
    }
    try {
      const devices = await navigator.usb.getDevices()
      const match = devices.find(d => d.vendorId === stored.vendorId && d.productId === stored.productId)
      if (!match) {
        this.emit({ state: 'disconnected', message: 'الطابعة المقترنة غير متصلة حالياً' })
        return false
      }
      await this.connect(match)
      return true
    } catch (err) {
      this.emit({ state: 'error', message: err instanceof Error ? err.message : 'تعذر الاتصال بالطابعة' })
      return false
    }
  }

  private async connect(device: USBDevice) {
    this.emit({ state: 'connecting' })
    if (!device.opened) await device.open()
    if (device.configuration === null) await device.selectConfiguration(1)
    const endpoint = findBulkOutEndpoint(device)
    if (!endpoint) {
      this.emit({ state: 'error', message: 'لم يتم العثور على منفذ إرسال بيانات على الطابعة' })
      throw new Error('No bulk OUT endpoint found on device')
    }
    await device.claimInterface(endpoint.interfaceNumber)
    this.device = device
    this.outEndpoint = endpoint.endpointNumber
    this.emit({ state: 'connected' })
  }

  /** Sends raw bytes to the printer. Calls are serialized so concurrent prints never interleave. */
  async transferOut(bytes: Uint8Array<ArrayBuffer>): Promise<void> {
    const run = this.tail.then(() => this.doTransfer(bytes))
    this.tail = run.catch(() => {})
    return run
  }

  private async doTransfer(bytes: Uint8Array<ArrayBuffer>) {
    if (!this.device || this.outEndpoint === null) {
      throw new Error('الطابعة غير متصلة')
    }
    const result = await this.device.transferOut(this.outEndpoint, bytes)
    if (result.status !== 'ok') {
      throw new Error(`فشل الإرسال للطابعة: ${result.status}`)
    }
  }

  unpair() {
    clearStoredDevice()
    this.device = null
    this.outEndpoint = null
    this.emit({ state: 'unpaired' })
  }
}

export const webUsbPrinter = new WebUsbPrinter()
