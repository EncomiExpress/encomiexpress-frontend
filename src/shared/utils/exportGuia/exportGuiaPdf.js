import { jsPDF } from 'jspdf'
import logoOsvaldoC from '../../../assets/logoOsvaldoC.png'
import { PAGE_W, PAGE_H, loadImageAsDataUrl } from './pdfDrawHelpers.js'
import { drawGuiaPage } from './drawGuiaPage.js'

const cargarLogo = async () => {
  try {
    const { dataUrl, ratio } = await loadImageAsDataUrl(logoOsvaldoC)
    return { logoDataUrl: dataUrl, logoRatio: ratio }
  } catch {
    // si el logo no carga, se continúa sin él
    return { logoDataUrl: null, logoRatio: 1 }
  }
}

// Descarga el documento de guía completo de una venta: un solo PDF con una
// página por cada paquete físico (todas comparten el mismo numeroGuia de la
// venta, P12, y el mismo remitente/destinatario/valores; solo cambia el
// contenido específico de cada paquete). Es el único punto de descarga de guía
// hoy — tanto el botón rápido del Listar como el del modal Consultar Venta
// generan este mismo documento completo, ya no uno separado por paquete.
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

  doc.save(`guia-${venta.numeroGuia || venta.idEncomiendaVenta}.pdf`)
}
