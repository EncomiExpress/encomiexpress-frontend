import { MARGIN, CONTENT_W, ensureSpace, sanitizeForPdf } from '../pdfDrawHelpers.js'
import { EMPRESA } from '../empresaConfig.js'

// Cajas de firma (entrega/recibe), la línea de referencia operativa
// (ruta/vehículo/conductor de ESTE paquete) y el pie de página legal.
export const drawFirmasYPie = (doc, y, venta, pkg) => {
  y = ensureSpace(doc, y, 20)
  const boxGap = 4
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
  // en sí, solo un respaldo interno de quién lo transportó). El vehículo/conductor
  // salen de la asignación de ESTE paquete específico, no de la ruta en general —
  // una misma venta puede repartir sus paquetes entre varios vehículos del convoy.
  const conductorNombre = pkg?.asignacion?.conductor?.usuario
    ? `${pkg.asignacion.conductor.usuario.nombre || ''} ${pkg.asignacion.conductor.usuario.apellido || ''}`.trim()
    : ''
  const refOperativa = [
    venta.ruta?.origen && `Ruta: ${venta.ruta.origen}`,
    pkg?.asignacion?.vehiculo?.placa && `Vehículo: ${pkg.asignacion.vehiculo.placa}`,
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
