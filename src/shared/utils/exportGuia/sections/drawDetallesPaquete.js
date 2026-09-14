import { MARGIN, CONTENT_W, ensureSpace, drawGrowingBox, drawGridCell } from '../pdfDrawHelpers.js'
import { formatCurrency } from '../empresaConfig.js'

// Caja de contenido del paquete + las 2 grillas de valores (dimensiones del
// paquete, valor total/modalidad de recaudo) + observaciones opcionales.
export const drawDetallesPaquete = (doc, y, venta, pkg) => {
  y = drawGrowingBox(doc, y, 'Contenido del paquete', pkg?.descripcionContenido)

  y = ensureSpace(doc, y, 14)
  const dim = pkg && [pkg.alto, pkg.ancho, pkg.profundidad].every(v => v != null)
    ? `${pkg.alto}×${pkg.ancho}×${pkg.profundidad} cm`
    : '—'
  const gridColsPaquete = [
    ['Peso', pkg?.peso != null ? `${pkg.peso} kg` : '—'],
    ['Dimensiones', dim],
  ]
  const cellWPaquete = CONTENT_W / gridColsPaquete.length
  gridColsPaquete.forEach(([label, value], j) => drawGridCell(doc, MARGIN + cellWPaquete * j, y, cellWPaquete, 14, label, value))
  y += 16

  // ── Grid de valores de la venta + modalidad de recaudo (igual en todas las
  // páginas: es el mismo envío). "Estado de pago" se quitó (2026-09-13): es un
  // dato de conciliación interna, no algo que el remitente/destinatario
  // necesiten leer en la guía física.
  y = ensureSpace(doc, y, 14)
  const gridColsVenta = [
    [venta.modalidadRecaudo === 'Contraentrega' ? 'Valor a cobrar' : 'Total a pagar', formatCurrency(venta.total)],
    ['Modalidad de recaudo', venta.modalidadRecaudo],
  ]
  const cellWVenta = CONTENT_W / gridColsVenta.length
  gridColsVenta.forEach(([label, value], i) => drawGridCell(doc, MARGIN + cellWVenta * i, y, cellWVenta, 14, label, value))
  y += 16

  if (venta.observaciones) {
    y = drawGrowingBox(doc, y, 'Observaciones', venta.observaciones)
  }

  return y
}
