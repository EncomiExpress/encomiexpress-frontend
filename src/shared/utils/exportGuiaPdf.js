import { jsPDF } from 'jspdf'
import JsBarcode from 'jsbarcode'
import logoOsvaldoC from '../../assets/logoOsvaldoC.png'

const PAGE_W = 280
const PAGE_H = 205
const MARGIN = 8
const CONTENT_W = PAGE_W - MARGIN * 2

const EMPRESA = {
  nombre: 'Osvaldoc Mensajería y Logística S.A.S.',
  nit: '901.515.251-1',
  direccion: 'Calle 45A # 60-50',
  ciudad: 'Medellín',
  departamento: 'Antioquia',
  telefono: '(604) 423 6529',
  actividad: 'Actividades de mensajería (CIIU 5320)',
}

const formatCurrency = (value) =>
  value !== null && value !== undefined && value !== ''
    ? `$${Number(value).toLocaleString('es-CO')}`
    : '—'

// La fuente "helvetica" de jsPDF solo soporta WinAnsi (Latin-1); cualquier
// carácter fuera de ese rango (ej. flechas → de datos antiguos) se renderiza
// corrupto. Se normalizan los símbolos más comunes y se descarta el resto.
const sanitizeForPdf = (value) => {
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

const loadImageAsDataUrl = (src) =>
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

const generateBarcodeDataUrl = (value) => {
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

const ensureSpace = (doc, y, needed) => {
  if (y + needed <= PAGE_H - MARGIN) return y
  doc.addPage([PAGE_W, PAGE_H], 'landscape')
  return MARGIN
}

const drawSectionTitle = (doc, x, y, text) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text(text.toUpperCase(), x, y)
}

const drawField = (doc, x, y, maxWidth, label, value) => {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 120, 120)
  doc.text(label, x, y)

  const lines = doc.splitTextToSize(sanitizeForPdf(value) || '—', maxWidth)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(20, 20, 20)
  doc.text(lines, x, y + 4)

  return y + 4 + lines.length * 3.6
}

const drawFieldPair = (doc, x, y, halfWidth, label1, value1, label2, value2) => {
  const y1 = drawField(doc, x, y, halfWidth - 3, label1, value1)
  const y2 = drawField(doc, x + halfWidth, y, halfWidth - 3, label2, value2)
  return Math.max(y1, y2)
}

const drawGridCell = (doc, x, y, w, h, label, value) => {
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

export const descargarGuiaPdf = async (venta) => {
  if (!venta) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W, PAGE_H] })
  let y = MARGIN

  // ── Encabezado: logo + datos de la empresa + número de guía + código de barras ──
  let logoW = 0
  try {
    const { dataUrl, ratio } = await loadImageAsDataUrl(logoOsvaldoC)
    const logoH = 19
    logoW = logoH * ratio
    doc.addImage(dataUrl, 'PNG', MARGIN, y - 5, logoW, logoH)
  } catch {
    // si el logo no carga, se continúa sin él
  }

  const textX = MARGIN + logoW + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(20, 20, 20)
  doc.text(EMPRESA.nombre, textX, y + 3)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 120, 120)
  doc.text(`Mensajería y encomiendas · ${EMPRESA.ciudad}, ${EMPRESA.departamento}`, textX, y + 8)
  doc.setFontSize(6.5)
  doc.text(
    `NIT ${EMPRESA.nit} · Tel ${EMPRESA.telefono} · ${EMPRESA.direccion}`,
    textX, y + 12
  )

  const guiaBoxW = 68
  const guiaBoxX = PAGE_W - MARGIN - guiaBoxW
  doc.setDrawColor(180, 180, 180)
  doc.rect(guiaBoxX, y - 2, guiaBoxW, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text('GUÍA N°', guiaBoxX + 3, y + 2.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(20, 20, 20)
  doc.text(sanitizeForPdf(venta.numeroGuia) || '—', guiaBoxX + 3, y + 8.5)

  const barcodeDataUrl = generateBarcodeDataUrl(venta.numeroGuia)
  doc.addImage(barcodeDataUrl, 'PNG', guiaBoxX, y + 11, guiaBoxW, 12)

  y += 26
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 5

  // ── Fecha emisión / entrega / estado ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 90, 90)
  const infoColW = CONTENT_W / 3
  doc.text(`Fecha emisión: ${sanitizeForPdf(venta.fechaRegistro) || '—'}`, MARGIN, y)
  doc.text(`Fecha est. entrega: ${sanitizeForPdf(venta.fechaEstimadaEntrega) || '—'}`, MARGIN + infoColW, y)
  doc.text(`Estado envío: ${sanitizeForPdf(venta.estado) || '—'}`, MARGIN + infoColW * 2, y)
  y += 4
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 6

  // ── Cajas Remitente / Destinatario ──
  const boxGap = 4
  const boxW = (CONTENT_W - boxGap) / 2
  const boxY = y
  const boxH = 40

  doc.setDrawColor(180, 180, 180)
  doc.rect(MARGIN, boxY, boxW, boxH)
  doc.rect(MARGIN + boxW + boxGap, boxY, boxW, boxH)

  let leftY = boxY + 6
  drawSectionTitle(doc, MARGIN + 3, leftY, 'Remitente')
  leftY += 5
  leftY = drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Nombre',
    `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || '—')
  leftY = drawFieldPair(doc, MARGIN + 3, leftY, (boxW - 6) / 2,
    'Identificación', venta.cliente?.numeroIdentificacion
      ? `${venta.cliente?.tipoIdentificacion || ''} ${venta.cliente.numeroIdentificacion}`.trim()
      : '—',
    'Teléfono', venta.cliente?.telefono)
  leftY = drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Email', venta.cliente?.email)
  drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Dirección', venta.cliente?.direccion)

  let rightY = boxY + 6
  const rightX = MARGIN + boxW + boxGap + 3
  drawSectionTitle(doc, rightX, rightY, 'Destinatario')
  rightY += 5
  rightY = drawField(doc, rightX, rightY, boxW - 6, 'Nombre', venta.destinatario?.nombreDestinatario)
  rightY = drawFieldPair(doc, rightX, rightY, (boxW - 6) / 2,
    'Teléfono', venta.destinatario?.telefonoDestinatario,
    'Ciudad / Depto. destino',
    venta.ruta?.destino?.ciudad
      ? `${venta.ruta.destino.ciudad}${venta.ruta.destino.departamento ? ' / ' + venta.ruta.destino.departamento : ''}`
      : '—')
  drawField(doc, rightX, rightY, boxW - 6, 'Dirección', venta.destinatario?.direccionDestinatario)

  y = boxY + boxH + 6

  // ── Contenido del paquete ──
  y = ensureSpace(doc, y, 12)
  doc.setDrawColor(180, 180, 180)
  doc.rect(MARGIN, y, CONTENT_W, 12)
  drawField(doc, MARGIN + 3, y + 5.5, CONTENT_W - 6, 'Contenido del paquete', venta.paquete?.descripcionContenido)
  y += 16

  // ── Grid de peso / dimensiones / valores ──
  y = ensureSpace(doc, y, 14)
  const dim = venta.paquete && [venta.paquete.alto, venta.paquete.ancho, venta.paquete.profundidad].every(v => v != null)
    ? `${venta.paquete.alto}×${venta.paquete.ancho}×${venta.paquete.profundidad} cm`
    : '—'
  const gridColsA = [
    ['Peso', venta.paquete?.peso != null ? `${venta.paquete.peso} kg` : '—'],
    ['Dimensiones', dim],
    ['Valor declarado', formatCurrency(venta.paquete?.valorDeclarado)],
    ['Valor servicio', formatCurrency(venta.valorServicio)],
    ['Impuestos', formatCurrency(venta.impuestos)],
    [venta.metodoPago === 'Contraentrega' ? 'Valor a cobrar' : 'Total', formatCurrency(venta.total)],
  ]
  const cellWA = CONTENT_W / gridColsA.length
  gridColsA.forEach(([label, value], i) => drawGridCell(doc, MARGIN + cellWA * i, y, cellWA, 14, label, value))
  y += 18

  // ── Grid de método de pago / estado de pago / ruta / vehículo ──
  y = ensureSpace(doc, y, 14)
  const gridColsB = [
    ['Método de pago', venta.metodoPago],
    ['Estado de pago', venta.estadoPago],
    ['Ruta', venta.ruta?.nombreRuta],
    ['Vehículo (placa)', venta.ruta?.vehiculo?.placa],
  ]
  const cellWB = CONTENT_W / gridColsB.length
  gridColsB.forEach(([label, value], i) => drawGridCell(doc, MARGIN + cellWB * i, y, cellWB, 14, label, value))
  y += 18

  // ── Observaciones ──
  if (venta.observaciones) {
    y = ensureSpace(doc, y, 14)
    doc.rect(MARGIN, y, CONTENT_W, 14)
    drawField(doc, MARGIN + 3, y + 5.5, CONTENT_W - 6, 'Observaciones', venta.observaciones)
    y += 18
  }

  // ── Firmas ──
  y = ensureSpace(doc, y, 20)
  const firmaW = (CONTENT_W - boxGap) / 2
  const firmaY = y;
  [
    ['Firma quien entrega', MARGIN],
    ['Firma quien recibe', MARGIN + firmaW + boxGap],
  ].forEach(([label, x]) => {
    doc.setDrawColor(180, 180, 180)
    doc.rect(x, firmaY, firmaW, 20)
    doc.line(x + 4, firmaY + 12, x + firmaW - 4, firmaY + 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(90, 90, 90)
    doc.text(label, x + 4, firmaY + 16)
    doc.text('C.C.:', x + 4, firmaY + 18.8)
  })
  y = firmaY + 24

  // ── Pie legal ──
  y = ensureSpace(doc, y, 12)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(140, 140, 140)
  const pieEmpresa = `${EMPRESA.nombre} · NIT ${EMPRESA.nit} · ${EMPRESA.direccion}, ${EMPRESA.ciudad}, ${EMPRESA.departamento} · Tel ${EMPRESA.telefono} · ${EMPRESA.actividad}`
  const pieEmpresaLines = doc.splitTextToSize(pieEmpresa, CONTENT_W)
  doc.text(pieEmpresaLines, MARGIN, y)
  y += pieEmpresaLines.length * 3
  doc.text(
    'Documento generado electrónicamente. Al firmar, el destinatario certifica haber recibido el paquete en buen estado.',
    MARGIN, y
  )
  y += 3
  doc.text(
    `Generado el ${new Date().toLocaleString('es-CO')}`,
    MARGIN, y
  )

  doc.save(`guia-${venta.numeroGuia || venta.idEncomiendaVenta}.pdf`)
}
