'use client'

// Renders a POS receipt to an offscreen canvas (mirroring the visual design of
// the window.print() receipt in src/app/pos/page.tsx — store name, RTL items
// table, bold total box, policy footer) and packs it into raw ESC/POS bytes
// as a monochrome raster image. Raw ESC/POS *text* mode doesn't reliably shape
// Arabic on typical thermal-printer codepages, so we sidestep that entirely by
// printing a bitmap instead — this also lets us reuse the exact branded layout.

import { formatPrice } from '@/lib/utils'

export interface ReceiptItem {
  nameAr: string
  price: number
  quantity: number
  size?: string | null
  color?: string | null
}

export interface ReceiptOrder {
  orderNumber: string
  paymentMethod: string
  subtotal: number
  discount: number
  total: number
  createdAt: string | Date
  items: ReceiptItem[]
}

const PAY_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'كاش',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}

const WIDTH = 576 // dots — 576/8 = 72 bytes/row, standard for 80mm @ 203dpi
const MAX_HEIGHT = 6000 // generous scratch height, trimmed to actual content afterward
const MARGIN = 16
const BAND_HEIGHT = 200 // rows per GS v 0 command — banding avoids known tall-raster issues on cheap ESC/POS clones

/** next/font/google gives Cairo a hashed internal family name, exposed only via this CSS var — canvas can't use var(), so we resolve it once at render time. */
function resolveCairoFontFamily(): string {
  if (typeof document === 'undefined') return 'Cairo, Arial, sans-serif'
  const varValue = getComputedStyle(document.documentElement).getPropertyValue('--font-cairo').trim()
  return varValue ? `${varValue}, Cairo, Arial, sans-serif` : 'Cairo, Arial, sans-serif'
}

async function ensureFontsReady(fontFamily: string) {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  try {
    await Promise.all([
      '400 20px', '600 20px', '700 22px', '800 24px',
    ].map(spec => document.fonts.load(`${spec} ${fontFamily}`)))
    await document.fonts.ready
  } catch {
    // best-effort — worst case falls back to a system font, still legible
  }
}

function lineHeightOf(font: string): number {
  const match = font.match(/(\d+)px/)
  const size = match ? parseInt(match[1], 10) : 20
  return Math.round(size * 1.3)
}

interface DrawState {
  ctx: CanvasRenderingContext2D
  y: number
}

function centerText(s: DrawState, text: string, font: string, gapAfter = 6) {
  s.ctx.font = font
  s.ctx.textAlign = 'center'
  s.ctx.textBaseline = 'top'
  s.ctx.fillText(text, WIDTH / 2, s.y)
  s.y += lineHeightOf(font) + gapAfter
}

function underlinedCenterText(s: DrawState, text: string, font: string, gapAfter = 8) {
  s.ctx.font = font
  s.ctx.textAlign = 'center'
  s.ctx.textBaseline = 'top'
  s.ctx.fillText(text, WIDTH / 2, s.y)
  const w = s.ctx.measureText(text).width
  const lh = lineHeightOf(font)
  s.ctx.beginPath()
  s.ctx.lineWidth = 1.5
  s.ctx.moveTo(WIDTH / 2 - w / 2, s.y + lh)
  s.ctx.lineTo(WIDTH / 2 + w / 2, s.y + lh)
  s.ctx.stroke()
  s.y += lh + gapAfter
}

function hLine(s: DrawState, dashed: boolean, thickness = 2, gapAfter = 10) {
  s.y += 4
  s.ctx.save()
  s.ctx.lineWidth = thickness
  s.ctx.setLineDash(dashed ? [6, 5] : [])
  s.ctx.beginPath()
  s.ctx.moveTo(MARGIN, s.y)
  s.ctx.lineTo(WIDTH - MARGIN, s.y)
  s.ctx.stroke()
  s.ctx.restore()
  s.y += gapAfter
}

function rowText(s: DrawState, rightText: string, leftText: string, font: string, gapAfter = 6) {
  s.ctx.font = font
  s.ctx.textBaseline = 'top'
  s.ctx.textAlign = 'right'
  s.ctx.fillText(rightText, WIDTH - MARGIN, s.y)
  s.ctx.textAlign = 'left'
  s.ctx.fillText(leftText, MARGIN, s.y)
  s.y += lineHeightOf(font) + gapAfter
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, font: string, maxWidth: number): string[] {
  ctx.font = font
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

interface TableCols {
  priceStart: number; priceEnd: number
  qtyStart: number; qtyEnd: number
  nameStart: number; nameEnd: number
}

function tableCols(): TableCols {
  const inner = WIDTH - MARGIN * 2
  const nameW = inner * 0.52
  const qtyW = inner * 0.18
  const priceW = inner - nameW - qtyW
  const priceStart = MARGIN
  const priceEnd = priceStart + priceW
  const qtyStart = priceEnd
  const qtyEnd = qtyStart + qtyW
  const nameStart = qtyEnd
  const nameEnd = nameStart + nameW
  return { priceStart, priceEnd, qtyStart, qtyEnd, nameStart, nameEnd }
}

function drawItemsTable(s: DrawState, items: ReceiptItem[], fontFamily: string) {
  const cols = tableCols()
  const headerFont = `700 18px ${fontFamily}`
  const nameFont = `700 19px ${fontFamily}`
  const variantFont = `400 14px ${fontFamily}`
  const cellFont = `800 19px ${fontFamily}`

  // Header row
  const headerTop = s.y
  const headerH = lineHeightOf(headerFont) + 10
  s.ctx.fillStyle = '#eaeaea'
  s.ctx.fillRect(MARGIN, headerTop, WIDTH - MARGIN * 2, headerH)
  s.ctx.fillStyle = '#000'
  s.ctx.font = headerFont
  s.ctx.textAlign = 'center'
  s.ctx.textBaseline = 'top'
  s.ctx.fillText('الصنف', (cols.nameStart + cols.nameEnd) / 2, headerTop + 5)
  s.ctx.fillText('الكمية', (cols.qtyStart + cols.qtyEnd) / 2, headerTop + 5)
  s.ctx.fillText('القيمة', (cols.priceStart + cols.priceEnd) / 2, headerTop + 5)
  s.ctx.lineWidth = 1.5
  s.ctx.strokeRect(MARGIN, headerTop, WIDTH - MARGIN * 2, headerH)
  s.y = headerTop + headerH

  for (const item of items) {
    const nameLines = wrapText(s.ctx, item.nameAr, nameFont, cols.nameEnd - cols.nameStart - 12)
    const variantParts = [item.size ? `مقاس: ${item.size}` : '', item.color ? `لون: ${item.color}` : ''].filter(Boolean)
    const variantText = variantParts.join(' | ')

    const rowTop = s.y
    let textY = rowTop + 5
    s.ctx.font = nameFont
    s.ctx.textAlign = 'right'
    s.ctx.textBaseline = 'top'
    for (const line of nameLines) {
      s.ctx.fillText(line, cols.nameEnd - 6, textY)
      textY += lineHeightOf(nameFont)
    }
    if (variantText) {
      s.ctx.font = variantFont
      s.ctx.fillStyle = '#444'
      s.ctx.fillText(variantText, cols.nameEnd - 6, textY)
      s.ctx.fillStyle = '#000'
      textY += lineHeightOf(variantFont)
    }
    const rowH = Math.max(textY - rowTop + 5, lineHeightOf(cellFont) + 10)

    s.ctx.font = cellFont
    s.ctx.textAlign = 'center'
    s.ctx.fillText(String(item.quantity), (cols.qtyStart + cols.qtyEnd) / 2, rowTop + 5)
    s.ctx.fillText(formatPrice(item.price * item.quantity), (cols.priceStart + cols.priceEnd) / 2, rowTop + 5)

    s.ctx.lineWidth = 1
    s.ctx.strokeRect(MARGIN, rowTop, WIDTH - MARGIN * 2, rowH)
    s.ctx.beginPath()
    s.ctx.moveTo(cols.qtyStart, rowTop); s.ctx.lineTo(cols.qtyStart, rowTop + rowH)
    s.ctx.moveTo(cols.nameStart, rowTop); s.ctx.lineTo(cols.nameStart, rowTop + rowH)
    s.ctx.stroke()

    s.y = rowTop + rowH
  }
  s.y += 10
}

function drawSumTable(s: DrawState, order: ReceiptOrder, fontFamily: string) {
  const font = `700 20px ${fontFamily}`
  const rows: [string, string][] = [['القيمة', formatPrice(order.subtotal)]]
  if (order.discount > 0) rows.push(['الخصم', `- ${formatPrice(order.discount)}`])
  rows.push(['المسدد', formatPrice(order.total)])

  for (const [label, value] of rows) {
    const rowTop = s.y
    const rowH = lineHeightOf(font) + 10
    s.ctx.lineWidth = 1
    s.ctx.strokeRect(MARGIN, rowTop, WIDTH - MARGIN * 2, rowH)
    s.ctx.font = font
    s.ctx.textBaseline = 'top'
    s.ctx.textAlign = 'right'
    s.ctx.fillText(label, WIDTH - MARGIN - 8, rowTop + 5)
    s.ctx.textAlign = 'left'
    s.ctx.fillText(value, MARGIN + 8, rowTop + 5)
    s.y = rowTop + rowH
  }
  s.y += 10
}

function drawTotalBox(s: DrawState, total: number, fontFamily: string) {
  const labelFont = `800 26px ${fontFamily}`
  const amountFont = `800 30px ${fontFamily}`
  const boxTop = s.y
  const boxH = Math.max(lineHeightOf(labelFont), lineHeightOf(amountFont)) + 20
  s.ctx.lineWidth = 3
  s.ctx.strokeRect(MARGIN, boxTop, WIDTH - MARGIN * 2, boxH)
  s.ctx.textBaseline = 'middle'
  s.ctx.font = labelFont
  s.ctx.textAlign = 'right'
  s.ctx.fillText('الإجمالي', WIDTH - MARGIN - 10, boxTop + boxH / 2)
  s.ctx.font = amountFont
  s.ctx.textAlign = 'left'
  s.ctx.fillText(formatPrice(total), MARGIN + 10, boxTop + boxH / 2)
  s.y = boxTop + boxH + 12
}

async function renderReceipt(order: ReceiptOrder): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const fontFamily = resolveCairoFontFamily()
  await ensureFontsReady(fontFamily)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = MAX_HEIGHT
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('تعذر إنشاء سطح الرسم لطباعة الفاتورة')

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, WIDTH, MAX_HEIGHT)
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'
  ctx.direction = 'rtl'

  const s: DrawState = { ctx, y: MARGIN }

  centerText(s, 'زهرة الخليج', `800 40px ${fontFamily}`, 2)
  centerText(s, 'ملابس المحجبات', `600 20px ${fontFamily}`, 4)
  underlinedCenterText(s, '☎ 01002001446', `700 20px ${fontFamily}`, 10)

  hLine(s, true)

  const createdAt = new Date(order.createdAt)
  const dateStr = createdAt.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = createdAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  rowText(s, `التاريخ: ${dateStr}`, `الوقت: ${timeStr}`, `400 16px ${fontFamily}`)

  centerText(s, `فاتورة رقم: ${order.orderNumber}`, `800 22px ${fontFamily}`, 4)
  centerText(s, `طريقة الدفع: ${PAY_LABELS[order.paymentMethod] || 'كاش'}`, `700 18px ${fontFamily}`, 4)

  hLine(s, false, 3)

  drawItemsTable(s, order.items, fontFamily)
  drawSumTable(s, order, fontFamily)
  drawTotalBox(s, order.total, fontFamily)

  s.y += 6
  ctx.save()
  ctx.setLineDash([6, 5])
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(MARGIN, s.y)
  ctx.lineTo(WIDTH - MARGIN, s.y)
  ctx.stroke()
  ctx.restore()
  s.y += 14

  centerText(s, 'الاسترجاع خلال ٣ أيام', `800 20px ${fontFamily}`, 8)
  centerText(s, 'الاستبدال خلال أسبوع', `800 20px ${fontFamily}`, 8)

  const contentHeight = Math.min(MAX_HEIGHT, s.y + MARGIN)
  const imageData = ctx.getImageData(0, 0, WIDTH, contentHeight)
  return { data: imageData.data, width: WIDTH, height: contentHeight }
}

function packRowsToBits(data: Uint8ClampedArray, width: number, rowStart: number, rowCount: number): Uint8Array<ArrayBuffer> {
  const bytesPerRow = width / 8
  const packed = new Uint8Array(bytesPerRow * rowCount)
  for (let row = 0; row < rowCount; row++) {
    const srcRow = rowStart + row
    for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
      let byte = 0
      for (let bit = 0; bit < 8; bit++) {
        const x = byteIndex * 8 + bit
        const pixelIndex = (srcRow * width + x) * 4
        const r = data[pixelIndex]
        const g = data[pixelIndex + 1]
        const b = data[pixelIndex + 2]
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b
        if (luminance < 128) byte |= 0x80 >> bit
      }
      packed[row * bytesPerRow + byteIndex] = byte
    }
  }
  return packed
}

function rasterBandCommand(packed: Uint8Array<ArrayBuffer>, width: number, rowCount: number): Uint8Array<ArrayBuffer> {
  const bytesPerRow = width / 8
  const header = new Uint8Array([
    0x1D, 0x76, 0x30, 0x00,
    bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff,
    rowCount & 0xff, (rowCount >> 8) & 0xff,
  ])
  const out = new Uint8Array(header.length + packed.length)
  out.set(header, 0)
  out.set(packed, header.length)
  return out
}

function concatBytes(chunks: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

/** Builds a full ESC/POS job (init + banded raster receipt image + feed/cut) ready for WebUSB transferOut. */
export async function buildReceiptEscPos(order: ReceiptOrder): Promise<Uint8Array<ArrayBuffer>> {
  const { data, width, height } = await renderReceipt(order)

  const chunks: Uint8Array<ArrayBuffer>[] = [new Uint8Array([0x1B, 0x40])] // ESC @ — initialize

  for (let rowStart = 0; rowStart < height; rowStart += BAND_HEIGHT) {
    const rowCount = Math.min(BAND_HEIGHT, height - rowStart)
    const packed = packRowsToBits(data, width, rowStart, rowCount)
    chunks.push(rasterBandCommand(packed, width, rowCount))
  }

  // Feed a few lines then partial cut (GS V 1) — widely supported on ESC/POS clones.
  chunks.push(new Uint8Array([0x0A, 0x0A, 0x0A, 0x0A, 0x1D, 0x56, 0x01]))

  return concatBytes(chunks)
}
