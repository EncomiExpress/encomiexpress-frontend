// Por qué una Venta terminó "Cancelada" — dos productores posibles:
// encomiendaService.toggleHabilitado() al REHABILITAR, cuando la ruta asociada ya no
// "sigue sirviendo" (ver LOGICA.md, "Ventas — Cancelada e inhabilitar/habilitar"); y
// rutaService.update(), cuando se edita el destino final o las paradas de la ruta y el
// municipio de esta venta queda fuera del recorrido nuevo (2026-09-13, ver LOGICA.md,
// "Ventas huérfanas al editar paradas/destino de una ruta"). No se guarda el motivo en
// la venta en sí — se resuelve acá, en el momento de mostrar la fila, mirando el
// estado ACTUAL de `venta.ruta`. Mismo criterio que rutaSigueSirviendo() del backend
// (`!!ruta && ruta.estado === 'Programada' && ruta.habilitado !== false`), descompuesto
// en sus causas posibles para un mensaje específico — mismo patrón que
// motivoSalidaVencida() en rutas/utils/rutaResolvers.js.
export const motivoVentaCancelada = (venta) => {
    const ruta = venta?.ruta
    if (!ruta) return 'sinRuta'
    if (ruta.habilitado === false) return 'rutaInhabilitada'
    if (ruta.estado === 'Cancelada') return 'rutaCancelada'
    if (ruta.estado === 'En Ruta' || ruta.estado === 'Completada') return 'rutaAvanzo'
    // La ruta sigue Programada y habilitada, pero puede que ya no llegue al
    // municipio de esta venta -- se le quitó como parada o como destino final
    // en una edición posterior a que la venta se registrara. A propósito NO se
    // trata como una cancelación real de cara a la usuaria (ver
    // LABEL_VENTA_CANCELADA más abajo): la venta sigue siendo válida, solo la
    // ruta dejó de cubrir su destino.
    const idDestinoVenta = venta?.destinatario?.idDestino
    const municipiosCubiertos = new Set([ruta.destino?.idDestino, ...(ruta.paradas || []).map(p => p.idDestino)])
    if (idDestinoVenta != null && !municipiosCubiertos.has(idDestinoVenta)) return 'destinoFueraDeRuta'
    // La ruta sigue sirviendo (Programada + habilitada) — típicamente porque se
    // canceló y ya se reprogramó de nuevo. No hace falta asignarle una ruta
    // DISTINTA, así que este caso tiene su propio mensaje (ver MENSAJE_VENTA_CANCELADA)
    // en vez de cualquiera de los anteriores.
    return 'rutaYaSirve'
}

export const MENSAJE_VENTA_CANCELADA = {
    rutaCancelada: 'La ruta de esta venta fue cancelada. Edítala para asignarle una ruta nueva.',
    rutaInhabilitada: 'La ruta de esta venta fue inhabilitada. Edítala para asignarle una ruta nueva.',
    rutaAvanzo: 'La ruta de esta venta ya inició mientras la venta estaba inhabilitada. Edítala para asignarle una ruta nueva.',
    sinRuta: 'Esta venta quedó sin una ruta válida. Edítala para asignarle una.',
    destinoFueraDeRuta: 'El destino de esta venta ya no está en el recorrido de esta ruta. Edítala para asignarle otra, o vuelve a agregarlo aquí para que se reactive sola.',
    // La ruta ya vuelve a servir (ej. se canceló y se reprogramó, o volvió a cubrir
    // el destino de esta venta) — no hay ningún dato que corregir, un clic en
    // "Programada" alcanza (ver EstadoVentaCancelada.jsx, puedeReactivar). Texto
    // corregido 2026-09-13: describía el diseño viejo (abrir Editar y guardar sin
    // cambiar nada), de antes de que existiera la reactivación directa de un clic.
    rutaYaSirve: 'La ruta de esta venta ya está disponible de nuevo. Dale clic a "Programada" para reactivarla.',
}

// Por dentro esta venta sigue "Cancelada" (necesario para que ninguna cascada de la
// ruta la arrastre — ver rutaService.update()), pero para este motivo puntual la
// usuaria pidió explícitamente que NO se vea como una cancelación real: la venta
// sigue siendo válida, solo quedó momentáneamente sin una ruta que la cubra. El resto
// de los motivos sí se muestran como "Cancelada" tal cual (son cancelaciones reales).
export const LABEL_VENTA_CANCELADA = {
    destinoFueraDeRuta: 'Reasignar ruta',
}
