import { jsPDF } from 'jspdf'
import JsBarcode from 'jsbarcode'
import logoOsvaldoC from '../../assets/logoOsvaldoC.png'

const PAGE_W = 320
// 240 (no 205): el peor caso real (campos cerca del máximo) necesita ~231mm de alto.
const PAGE_H = 240
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

// jsPDF mide el ancho de línea con la fuente activa al llamar a splitTextToSize —
// hay que fijar bold/9 ANTES de partir el texto, o el cálculo sale con una fuente
// más angosta y el texto se sale del ancho real.
const wrapValue = (doc, value, maxWidth) => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  return doc.splitTextToSize(sanitizeForPdf(value) || '—', maxWidth)
}

const drawField = (doc, x, y, maxWidth, label, value) => {
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
const measureFieldHeight = (doc, maxWidth, value) => {
  const lines = wrapValue(doc, value, maxWidth)
  return 4 + lines.length * 3.6
}

// Caja cuyo alto se calcula según cuántas líneas necesite el texto (no un alto fijo)
// — así "Contenido del paquete" y "Observaciones" nunca se desbordan del recuadro.
const drawGrowingBox = (doc, y, label, value, minHeight = 12) => {
  const lines = wrapValue(doc, value, CONTENT_W - 6)
  // 10 en vez de 7.5: con descendentes (g, j, p, q, y) la última línea se salía por abajo.
  const boxH = Math.max(minHeight, 10 + lines.length * 3.6)
  y = ensureSpace(doc, y, boxH)
  doc.setDrawColor(180, 180, 180)
  doc.rect(MARGIN, y, CONTENT_W, boxH)
  drawField(doc, MARGIN + 3, y + 5.5, CONTENT_W - 6, label, value)
  return y + boxH + 2
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

// Dibuja una página completa de guía para UN paquete. Cuando la venta tiene
// varios paquetes, se llama una vez por paquete (una página por paquete) —
// cada página comparte guía/remitente/destinatario/valores, y solo cambia el
// contenido específico del paquete. Así cada paquete queda con su propia guía
// físicamente separable, en vez de mezclarlos en un único documento continuo.
const drawGuiaPage = (doc, venta, pkg, index, totalPaginas, assets) => {
  let y = MARGIN

  const logoW = assets.logoDataUrl ? 19 * assets.logoRatio : 0
  if (assets.logoDataUrl) {
    doc.addImage(assets.logoDataUrl, 'PNG', MARGIN, y - 5, logoW, 19)
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

  if (totalPaginas > 1) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(90, 90, 90)
    doc.text(`Paquete ${index + 1} de ${totalPaginas}`, PAGE_W - MARGIN, y - 4, { align: 'right' })
  }

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
  doc.text(sanitizeForPdf(pkg?.numeroGuia) || '—', guiaBoxX + 3, y + 8.5)

  // El código de barras es del PAQUETE (no de la venta) — cada paquete físico
  // tiene su propio número de guía único, así que cada página necesita el suyo.
  const barcodeDataUrl = generateBarcodeDataUrl(pkg?.numeroGuia)
  doc.addImage(barcodeDataUrl, 'PNG', guiaBoxX, y + 11, guiaBoxW, 12)

  y += 26
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 5

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

  // Mismo cálculo de alto que drawGrowingBox (ver arriba) — evita que el texto se salga del recuadro.
  const nombreRemitente = `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || '—'
  const idRemitente = venta.cliente?.numeroIdentificacion
    ? `${venta.cliente?.tipoIdentificacion || ''} ${venta.cliente.numeroIdentificacion}`.trim()
    : '—'
  const telRemitente = venta.cliente?.telefono
  const emailRemitente = venta.cliente?.email
  const dirRemitente = venta.cliente?.direccion

  const nombreDestinatario = venta.destinatario?.nombreDestinatario
  const telDestinatario = venta.destinatario?.telefonoDestinatario
  const ciudadDestino = venta.ruta?.destino?.ciudad
    ? `${venta.ruta.destino.ciudad}${venta.ruta.destino.departamento ? ' / ' + venta.ruta.destino.departamento : ''}`
    : '—'
  const dirDestinatario = venta.destinatario?.direccionDestinatario

  const boxGap = 4
  const boxW = (CONTENT_W - boxGap) / 2
  const halfW = (boxW - 6) / 2 - 3
  const leftContentH = 5
    + measureFieldHeight(doc, boxW - 6, nombreRemitente)
    + Math.max(measureFieldHeight(doc, halfW, idRemitente), measureFieldHeight(doc, halfW, telRemitente))
    + measureFieldHeight(doc, boxW - 6, emailRemitente)
    + measureFieldHeight(doc, boxW - 6, dirRemitente)
  const rightContentH = 5
    + measureFieldHeight(doc, boxW - 6, nombreDestinatario)
    + Math.max(measureFieldHeight(doc, halfW, telDestinatario), measureFieldHeight(doc, halfW, ciudadDestino))
    + measureFieldHeight(doc, boxW - 6, dirDestinatario)
  const boxH = Math.max(40, leftContentH + 10, rightContentH + 10)

  y = ensureSpace(doc, y, boxH)
  const boxY = y

  doc.setDrawColor(180, 180, 180)
  doc.rect(MARGIN, boxY, boxW, boxH)
  doc.rect(MARGIN + boxW + boxGap, boxY, boxW, boxH)

  let leftY = boxY + 6
  drawSectionTitle(doc, MARGIN + 3, leftY, 'Remitente')
  leftY += 5
  leftY = drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Nombre', nombreRemitente)
  leftY = drawFieldPair(doc, MARGIN + 3, leftY, (boxW - 6) / 2,
    'Identificación', idRemitente, 'Teléfono', telRemitente)
  leftY = drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Email', emailRemitente)
  drawField(doc, MARGIN + 3, leftY, boxW - 6, 'Dirección', dirRemitente)

  let rightY = boxY + 6
  const rightX = MARGIN + boxW + boxGap + 3
  drawSectionTitle(doc, rightX, rightY, 'Destinatario')
  rightY += 5
  rightY = drawField(doc, rightX, rightY, boxW - 6, 'Nombre', nombreDestinatario)
  rightY = drawFieldPair(doc, rightX, rightY, (boxW - 6) / 2,
    'Teléfono', telDestinatario, 'Ciudad / Depto. destino', ciudadDestino)
  drawField(doc, rightX, rightY, boxW - 6, 'Dirección', dirDestinatario)

  y = boxY + boxH + 6

  y = drawGrowingBox(doc, y, 'Contenido del paquete', pkg?.descripcionContenido)

  y = ensureSpace(doc, y, 14)
  const dim = pkg && [pkg.alto, pkg.ancho, pkg.profundidad].every(v => v != null)
    ? `${pkg.alto}×${pkg.ancho}×${pkg.profundidad} cm`
    : '—'
  const gridColsPaquete = [
    ['Peso', pkg?.peso != null ? `${pkg.peso} kg` : '—'],
    ['Dimensiones', dim],
    ['Valor declarado', formatCurrency(pkg?.valorDeclarado)],
  ]
  const cellWPaquete = CONTENT_W / gridColsPaquete.length
  gridColsPaquete.forEach(([label, value], j) => drawGridCell(doc, MARGIN + cellWPaquete * j, y, cellWPaquete, 14, label, value))
  y += 16

  // ── Grid de valores de la venta (igual en todas las páginas: es el mismo envío) ──
  y = ensureSpace(doc, y, 14)
  const gridColsVenta = [
    ['Valor servicio', formatCurrency(venta.valorServicio)],
    ['Impuestos', formatCurrency(venta.impuestos)],
    [venta.metodoPago === 'Contraentrega' ? 'Valor a cobrar' : 'Total', formatCurrency(venta.total)],
  ]
  const cellWVenta = CONTENT_W / gridColsVenta.length
  gridColsVenta.forEach(([label, value], i) => drawGridCell(doc, MARGIN + cellWVenta * i, y, cellWVenta, 14, label, value))
  y += 16

  // ── Grid de método de pago / estado de pago ──
  y = ensureSpace(doc, y, 14)
  const gridColsB = [
    ['Método de pago', venta.metodoPago],
    ['Estado de pago', venta.estadoPago],
  ]
  const cellWB = CONTENT_W / gridColsB.length
  gridColsB.forEach(([label, value], i) => drawGridCell(doc, MARGIN + cellWB * i, y, cellWB, 14, label, value))
  y += 16

  if (venta.observaciones) {
    y = drawGrowingBox(doc, y, 'Observaciones', venta.observaciones)
  }

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
  y = firmaY + 22

  // Ruta/vehículo/conductor van como referencia secundaria (no es info del envío
  // en sí, solo un respaldo interno de quién lo transportó).
  const conductorNombre = venta.ruta?.conductor?.usuario
    ? `${venta.ruta.conductor.usuario.nombre || ''} ${venta.ruta.conductor.usuario.apellido || ''}`.trim()
    : ''
  const refOperativa = [
    venta.ruta?.nombreRuta && `Ruta: ${venta.ruta.nombreRuta}`,
    venta.ruta?.vehiculo?.placa && `Vehículo: ${venta.ruta.vehiculo.placa}`,
    conductorNombre && `Conductor: ${conductorNombre}`,
  ].filter(Boolean).join(' · ')
  if (refOperativa) {
    y = ensureSpace(doc, y, 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(140, 140, 140)
    doc.text(sanitizeForPdf(refOperativa), MARGIN, y)
    y += 4
  }

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
}

const cargarLogo = async () => {
  try {
    const { dataUrl, ratio } = await loadImageAsDataUrl(logoOsvaldoC)
    return { logoDataUrl: dataUrl, logoRatio: ratio }
  } catch {
    // si el logo no carga, se continúa sin él
    return { logoDataUrl: null, logoRatio: 1 }
  }
}

// Descarga la guía completa de una venta: una página por cada paquete, cada una
// con su propio número de guía y código de barras (mismo remitente/destinatario/
// valores en todas). Es la que se usa desde el botón rápido del Listar.
export const descargarGuiaPdf = async (venta) => {
  if (!venta) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W, PAGE_H] })
  const assets = await cargarLogo()

  const paquetes = venta.paquetes?.length > 0 ? venta.paquetes : [venta.paquete].filter(Boolean)
  const paginas = paquetes.length > 0 ? paquetes : [null]

  paginas.forEach((pkg, index) => {
    if (index > 0) doc.addPage([PAGE_W, PAGE_H], 'landscape')
    drawGuiaPage(doc, venta, pkg, index, paginas.length, assets)
  })

  doc.save(`guia-${paquetes[0]?.numeroGuia || venta.idEncomiendaVenta}.pdf`)
}

// Descarga la guía de UN solo paquete (una sola página, con su propio número de
// guía y código de barras) — la usa el botón "Descargar guía" del modal Consultar,
// que ya está enfocado en un paquete específico (el que se esté viendo ahí).
export const descargarGuiaPaquete = async (venta, paquete) => {
  if (!venta || !paquete) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W, PAGE_H] })
  const assets = await cargarLogo()

  drawGuiaPage(doc, venta, paquete, 0, 1, assets)

  doc.save(`guia-${paquete.numeroGuia || venta.idEncomiendaVenta}.pdf`)
}
