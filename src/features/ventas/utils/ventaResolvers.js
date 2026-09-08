// Por qué una Venta terminó "Cancelada" — único productor posible:
// encomiendaService.toggleHabilitado() al REHABILITAR, cuando la ruta asociada ya no
// "sigue sirviendo" (ver LOGICA.md, "Ventas — Cancelada e inhabilitar/habilitar"). No
// se guarda el motivo en la venta en sí — se resuelve acá, en el momento de mostrar la
// fila, mirando el estado ACTUAL de `venta.ruta`. Mismo criterio que
// rutaSigueSirviendo() del backend (`!!ruta && ruta.estado === 'Programada' &&
// ruta.habilitado !== false`), descompuesto en sus causas posibles para un mensaje
// específico — mismo patrón que motivoSalidaVencida() en rutas/utils/rutaResolvers.js.
export const motivoVentaCancelada = (venta) => {
    const ruta = venta?.ruta
    if (!ruta) return 'sinRuta'
    if (ruta.habilitado === false) return 'rutaInhabilitada'
    if (ruta.estado === 'Cancelada') return 'rutaCancelada'
    if (ruta.estado === 'En Ruta' || ruta.estado === 'Completada') return 'rutaAvanzo'
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
    // La ruta ya vuelve a servir (ej. se canceló y se reprogramó) — no hay ningún
    // dato que corregir, solo falta el guardado que la reactiva.
    rutaYaSirve: 'La ruta de esta venta ya está disponible de nuevo. Ábrela en Editar y guarda (sin cambiar nada) para reactivarla.',
}
