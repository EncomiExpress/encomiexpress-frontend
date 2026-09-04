import { PAGE_W, MARGIN, CONTENT_W, sanitizeForPdf, generateBarcodeDataUrl } from '../pdfDrawHelpers.js'
import { EMPRESA } from '../empresaConfig.js'

// Encabezado de la guía: logo + datos de la empresa, indicador "Paquete X de Y"
// (cuando la venta tiene varios paquetes), caja de número de guía + código de
// barras, y la fila de fecha emisión / fecha estimada / estado del envío.
export const drawEncabezado = (doc, venta, pkg, index, totalPaginas, assets) => {
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
  doc.text(`Fecha est. entrega en sede: ${sanitizeForPdf(venta.fechaEstimadaEntrega) || '—'}`, MARGIN + infoColW, y)
  doc.text(`Estado envío: ${sanitizeForPdf(venta.estado) || '—'}`, MARGIN + infoColW * 2, y)
  y += 4
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 6

  return y
}
