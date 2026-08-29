import { MARGIN, CONTENT_W, ensureSpace, drawSectionTitle, drawField, measureFieldHeight, drawFieldPair } from '../pdfDrawHelpers.js'

// Dos cajas lado a lado (remitente/destinatario); el alto de la caja se calcula
// con measureFieldHeight ANTES de dibujar, midiendo el lado que más texto tenga,
// para que ambas cajas queden con el mismo alto y ninguna se desborde.
export const drawRemitenteDestinatario = (doc, y, venta) => {
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

  return boxY + boxH + 6
}
