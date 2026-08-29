import JsBarcode from 'jsbarcode'

export const PAGE_W = 320
// 240 (no 205): el peor caso real (campos cerca del máximo) necesita ~231mm de alto.
export const PAGE_H = 240
export const MARGIN = 8
export const CONTENT_W = PAGE_W - MARGIN * 2

// La fuente "helvetica" de jsPDF solo soporta WinAnsi (Latin-1); cualquier
// carácter fuera de ese rango (ej. flechas → de datos antiguos) se renderiza
// corrupto. Se normalizan los símbolos más comunes y se descarta el resto.
export const sanitizeForPdf = (value) => {
  if (value === null || value === undefined || value === '') return value
  return String(value)
    .replace(/[→➜➔↦]/g, '-')
    .replace(/[←]/g, '<-')
    .replace(/[–—]/g, '-')
    .replace(/[•·]/g, '-')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

export const loadImageAsDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve({ dataUrl: canvas.toDataURL('image/png'), ratio: img.naturalWidth / img.naturalHeight })
    }
    img.onerror = reject
    img.src = src
  })

export const generateBarcodeDataUrl = (value) => {
  const canvas = document.createElement('canvas')
  JsBarcode(canvas, value || '-', {
    format: 'CODE128',
    displayValue: false,
    margin: 0,
    height: 60,
    width: 2,
  })
  return canvas.toDataURL('image/png')
}

export const ensureSpace = (doc, y, needed) => {
  if (y + needed <= PAGE_H - MARGIN) return y
  doc.addPage([PAGE_W, PAGE_H], 'landscape')
  return MARGIN
}

export const drawSectionTitle = (doc, x, y, text) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text(text.toUpperCase(), x, y)
}

// jsPDF mide el ancho de línea con la fuente activa al llamar a splitTextToSize —
// hay que fijar bold/9 ANTES de partir el texto, o el cálculo sale con una fuente
// más angosta y el texto se sale del ancho real.
export const wrapValue = (doc, value, maxWidth) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  return doc.splitTextToSize(sanitizeForPdf(value) || '—', maxWidth)
}

export const drawField = (doc, x, y, maxWidth, label, value) => {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 120, 120)
  doc.text(label, x, y)

  const lines = wrapValue(doc, value, maxWidth)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(20, 20, 20)
  doc.text(lines, x, y + 4)

  return y + 4 + lines.length * 3.6
}

// Alto que ocupará un drawField sin dibujarlo — se usa para calcular de
// antemano cuánto necesitan crecer las cajas de Remitente/Destinatario.
export const measureFieldHeight = (doc, maxWidth, value) => {
  const lines = wrapValue(doc, value, maxWidth)
  return 4 + lines.length * 3.6
}

// Caja cuyo alto se calcula según cuántas líneas necesite el texto (no un alto fijo)
// — así "Contenido del paquete" y "Observaciones" nunca se desbordan del recuadro.
export const drawGrowingBox = (doc, y, label, value, minHeight = 12) => {
  const lines = wrapValue(doc, value, CONTENT_W - 6)
  // 10 en vez de 7.5: con descendentes (g, j, p, q, y) la última línea se salía por abajo.
  const boxH = Math.max(minHeight, 10 + lines.length * 3.6)
  y = ensureSpace(doc, y, boxH)
  doc.setDrawColor(180, 180, 180)
  doc.rect(MARGIN, y, CONTENT_W, boxH)
  drawField(doc, MARGIN + 3, y + 5.5, CONTENT_W - 6, label, value)
  return y + boxH + 2
}

export const drawFieldPair = (doc, x, y, halfWidth, label1, value1, label2, value2) => {
  const y1 = drawField(doc, x, y, halfWidth - 3, label1, value1)
  const y2 = drawField(doc, x + halfWidth, y, halfWidth - 3, label2, value2)
  return Math.max(y1, y2)
}

export const drawGridCell = (doc, x, y, w, h, label, value) => {
  doc.setDrawColor(210, 210, 210)
  doc.rect(x, y, w, h)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(label.toUpperCase(), x + 3, y + 4.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(20, 20, 20)
  const lines = doc.splitTextToSize(sanitizeForPdf(value) || '—', w - 6)
  doc.text(lines.slice(0, 2), x + 3, y + 9.5)
}
