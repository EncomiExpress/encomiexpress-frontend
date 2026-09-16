// Construye el link "ver esta salida" usado por los modales de detalle/bloqueo de
// Vehículos, Conductores, Destinos, Ventas, Anticipos y Salidas (deep-link a un
// registro concreto). Desde la Fase 4 de la migración Ruta/SalidaProgramada ya no
// existe una vista global `/transporte/salidas` — cuelga de
// `/transporte/rutas/:idRuta/salidas` (ver salidas.routes.jsx), así que hace falta
// el idRuta además del idSalida. Algunos endpoints devuelven `idRuta` plano sobre
// la propia salida, otros solo lo anidan vía `salida.ruta.idRuta` (la PK de un
// modelo incluido en Sequelize se añade siempre al select, aunque su `attributes`
// no la liste explícito) — por eso se prueban ambas formas. Si por algún motivo
// falta el dato, cae al listado general de Rutas en vez de armar un link roto.
export const buildSalidaHighlightUrl = (salida) => {
  const idRuta = salida?.ruta?.idRuta ?? salida?.idRuta
  const idSalida = salida?.idSalida
  if (!idRuta || !idSalida) return '/transporte/rutas'
  return `/transporte/rutas/${idRuta}/salidas?highlight=${idSalida}`
}
