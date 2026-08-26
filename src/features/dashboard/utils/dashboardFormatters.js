export const STATUS_LABEL = {
    'Programada': 'Programada',
    'En Ruta': 'En Ruta',
    'Entregada': 'Entregada',
    'Completada con novedades': 'Completada con novedades',
    'Cancelada': 'Cancelada',
}

export const formatCOP = (n) => '$' + n.toLocaleString('es-CO')

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// venta.fechaRegistro/desde/hasta son DATEONLY ("YYYY-MM-DD") — new Date(string) los
// interpreta como medianoche UTC, no medianoche local, y en Colombia (UTC-5) eso corre
// el punto de corte varias horas hacia atrás (mismo bug ya corregido en isVencido/
// mananaISO/hoyISO). Sin este fix, una venta registrada el día 1 de cualquier mes caía
// en el mes anterior en la gráfica. Se arma la fecha con componentes locales.
export const parseFechaLocal = (dateString) => {
    if (!dateString) return new Date(NaN)
    const [y, m, d] = dateString.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export const normalizeMonth = (dateString) => {
    const date = parseFechaLocal(dateString)
    if (Number.isNaN(date.getTime())) return null
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const label = capitalize(date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))
    const shortLabel = capitalize(date.toLocaleDateString('es-CO', { month: 'short' })).replace('.', '')
    return { key: `${year}-${month}`, label, shortLabel, date }
}

export const isWithinRange = (dateString, desde, hasta) => {
    const fecha = parseFechaLocal(dateString)
    if (Number.isNaN(fecha.getTime())) return false
    const inicio = parseFechaLocal(desde)
    const fin = parseFechaLocal(hasta)
    return fecha >= inicio && fecha <= fin
}

export const hoyISO = () => {
    const d = new Date()
    const pad2 = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
