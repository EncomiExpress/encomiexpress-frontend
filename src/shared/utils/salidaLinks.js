// Construye el link "ver esta salida" usado por los modales de detalle/bloqueo de
// Vehículos, Conductores, Destinos, Ventas, Anticipos y Salidas (deep-link a un
// registro concreto). Desde la Fase 4 de la migración Ruta/SalidaProgramada ya no
// existe una vista global `/transporte/salidas` — cuelga de
// `/transporte/rutas/:idRuta/salidas` (ver salidas.routes.jsx), así que hace falta
// el idRuta además del idSalida. Algunos endpoints devuelven `idRuta` plano sobre
// la propia salida, otros solo lo anidan vía `salida.ruta.idRuta` — por eso se
// prueban ambas formas. OJO: a diferencia del modelo raíz de una consulta, Sequelize
// NO agrega solo la PK de un modelo INCLUIDO cuando ese include restringe su propio
// `attributes` -- hay que pedir `idRuta` a mano en cada include de Ruta que alimente
// este link (2026-09-17: bug real, un `attributes:['idDestino']` sin `idRuta` dejaba
// este link cayendo siempre al fallback pese a que el resto del dato sí llegaba).
// Si por algún motivo falta el dato, cae al listado general de Rutas en vez de armar
// un link roto.
export const buildSalidaHighlightUrl = (salida) => {
  const idRuta = salida?.ruta?.idRuta ?? salida?.idRuta
  const idSalida = salida?.idSalida
  if (!idRuta || !idSalida) return '/transporte/rutas'
  return `/transporte/rutas/${idRuta}/salidas?highlight=${idSalida}`
}
