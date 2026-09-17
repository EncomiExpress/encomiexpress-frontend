import { drawEncabezado } from './sections/drawEncabezado.js'
import { drawRemitenteDestinatario } from './sections/drawRemitenteDestinatario.js'
import { drawDetallesPaquete } from './sections/drawDetallesPaquete.js'
import { drawFirmasYPie } from './sections/drawFirmasYPie.js'

// Dibuja una página completa de guía para UN paquete físico. Cuando la venta
// tiene varios paquetes, se llama una vez por paquete (una página por paquete)
// — todas comparten el mismo numeroGuia de la venta (P12) y el mismo
// remitente/destinatario/valores, y solo cambia el contenido específico de ese
// paquete (peso, dimensiones, descripción). Así cada paquete físico sigue
// teniendo su propia página imprimible/separable para pegar en la caja, aunque
// ya no tenga un número de guía propio.
export const drawGuiaPage = (doc, venta, pkg, index, totalPaginas, assets) => {
  let y = drawEncabezado(doc, venta, pkg, index, totalPaginas, assets)
  y = drawRemitenteDestinatario(doc, y, venta)
  y = drawDetallesPaquete(doc, y, venta, pkg)
  drawFirmasYPie(doc, y, venta, pkg)
}
