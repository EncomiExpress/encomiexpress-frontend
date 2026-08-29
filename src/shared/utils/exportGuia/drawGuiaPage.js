import { drawEncabezado } from './sections/drawEncabezado.js'
import { drawRemitenteDestinatario } from './sections/drawRemitenteDestinatario.js'
import { drawDetallesPaquete } from './sections/drawDetallesPaquete.js'
import { drawFirmasYPie } from './sections/drawFirmasYPie.js'

// Dibuja una página completa de guía para UN paquete. Cuando la venta tiene
// varios paquetes, se llama una vez por paquete (una página por paquete) —
// cada página comparte guía/remitente/destinatario/valores, y solo cambia el
// contenido específico del paquete. Así cada paquete queda con su propia guía
// físicamente separable, en vez de mezclarlos en un único documento continuo.
export const drawGuiaPage = (doc, venta, pkg, index, totalPaginas, assets) => {
  let y = drawEncabezado(doc, venta, pkg, index, totalPaginas, assets)
  y = drawRemitenteDestinatario(doc, y, venta)
  y = drawDetallesPaquete(doc, y, venta, pkg)
  drawFirmasYPie(doc, y, venta, pkg)
}
