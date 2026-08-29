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
