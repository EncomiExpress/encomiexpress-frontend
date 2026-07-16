export const formatRutaDestino = (destino) => {
    if (!destino) return '—'
    if (typeof destino === 'string') return destino
    if (typeof destino === 'object') {
        if (destino.ciudad || destino.departamento) {
            return `${destino.ciudad || ''}${destino.ciudad && destino.departamento ? ' — ' : ''}${destino.departamento || ''}`.trim() || '—'
        }
        return destino.nombre || String(destino.idDestino ?? destino.id ?? '—')
    }
    return String(destino)
}

export const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
}

export const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

// El número de guía ahora vive en cada paquete (uno por paquete físico), no en la
// venta — esto da "la" guía representativa de una venta para vistas que solo
// necesitan mostrar/exportar un identificador (listados de dependencias, Excel,
// dashboard). Para la vista detallada de una venta con varios paquetes, usar el
// selector de paquete en vez de este helper.
export const getGuiaPrincipal = (venta) => venta?.paquetes?.[0]?.numeroGuia || venta?.paquete?.numeroGuia || null
