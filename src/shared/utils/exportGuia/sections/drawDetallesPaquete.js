import { MARGIN, CONTENT_W, ensureSpace, drawGrowingBox, drawGridCell } from '../pdfDrawHelpers.js'
import { formatCurrency } from '../empresaConfig.js'

// Caja de contenido del paquete + las 3 grillas de valores (dimensiones del
// paquete, valores de la venta, método/estado de pago) + observaciones opcionales.
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

  // ── Grid de valores de la venta (igual en todas las páginas: es el mismo envío) ──
  y = ensureSpace(doc, y, 14)
  const gridColsVenta = [
    ['Valor servicio', formatCurrency(venta.valorServicio)],
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

  return y
}
