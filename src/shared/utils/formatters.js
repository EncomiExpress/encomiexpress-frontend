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
    // "fecha" es un DATEONLY del backend ("YYYY-MM-DD") — new Date(fecha) lo interpreta
    // como medianoche UTC, no medianoche local. En Colombia (UTC-5) eso corre el punto de
    // corte varias horas hacia atrás y hace que un documento "venza" antes de que termine
    // su propio día local (mismo tipo de bug ya corregido en mananaISO/hoyISO). Se arma la
    // fecha con componentes locales y se compara por día calendario. Un documento que
    // vence hoy ya se considera vencido desde hoy mismo (no hasta que termine el día) —
    // igual que el backend (validarDocumentosVehiculo en rutaService.js).
    const [y, m, d] = fecha.split('-').map(Number)
    const venc = new Date(y, m - 1, d)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return venc <= hoy
}

// Formatea un valor en pesos colombianos con puntos de miles para MOSTRAR en pantalla
// (ej. "25.000") — el valor real que se guarda/envía nunca lleva puntos ni decimales,
// es solo dígitos. Mismo patrón que la raya automática de la placa de vehículo: se ve
// formateado en el campo, pero por dentro es un string limpio.
export const formatearMoneda = (raw) => {
    const limpio = String(raw ?? '').replace(/[^0-9]/g, '')
    if (!limpio) return ''
    return Number(limpio).toLocaleString('es-CO')
}

// Filtra el input en vivo de un campo de dinero: solo dígitos, nada de puntos ni
// decimales — los puntos que se ven en pantalla los pone formatearMoneda(), nunca se
// escriben a mano.
export const limpiarMonedaInput = (value) => String(value ?? '').replace(/[^0-9]/g, '')

// Filtra el input en vivo de un campo decimal físico (peso, capacidad, dimensiones):
// dígitos + como máximo UN punto decimal. El regex simple `[^0-9.]` que se usaba antes
// solo bloqueaba letras, pero dejaba escribir cualquier cantidad de puntos seguidos
// (ej. "0.0.08") — acá se descarta cualquier punto adicional después del primero,
// carácter por carácter, en vez de rechazar todo el input.
export const limpiarDecimalInput = (value) => {
    let yaHuboPunto = false
    return String(value ?? '')
        .replace(/[^0-9.]/g, '')
        .split('')
        .filter((ch) => {
            if (ch !== '.') return true
            if (yaHuboPunto) return false
            yaHuboPunto = true
            return true
        })
        .join('')
}

// El número de guía ahora vive en cada paquete (uno por paquete físico), no en la
// venta — esto da "la" guía representativa de una venta para vistas que solo
// necesitan mostrar/exportar un identificador (listados de dependencias, Excel,
// dashboard). Para la vista detallada de una venta con varios paquetes, usar el
// selector de paquete en vez de este helper.
export const getGuiaPrincipal = (venta) => venta?.paquetes?.[0]?.numeroGuia || venta?.paquete?.numeroGuia || null
