export const getEstadoColorVenta = (estado, theme) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente de recogida': return theme.palette.status.ventaPendiente
        case 'en recogida':           return theme.palette.status.ventaEnRecogida
        case 'programada':            return theme.palette.status.ventaProgramada
        case 'en tránsito':           return theme.palette.status.ventaEnTransito
        case 'entregado':             return theme.palette.status.ventaEntregadaAlt
        case 'devuelto':              return theme.palette.status.ventaDevueltaAlt
        default:                      return theme.palette.status.neutral
    }
}

export const getEstadoColorVentaHex = (estado) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente de recogida': return { bg: '#FEF3C7', color: '#92400E' }
        case 'en recogida':           return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'programada':            return { bg: '#E0E7FF', color: '#3730A3' }
        case 'en tránsito':           return { bg: '#CFFAFE', color: '#155E75' }
        case 'entregado':             return { bg: '#D1FAE5', color: '#065F46' }
        case 'devuelto':              return { bg: '#FEE2E2', color: '#991B1B' }
        default:                      return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

export const getEstadoColorRuta = (estado) => {
    switch (estado) {
        case 'Programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'En Curso':   return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'Completada': return { bg: '#D1FAE5', color: '#065F46' }
        case 'Cancelada':  return { bg: '#FEE2E2', color: '#991B1B' }
        default:           return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

export const ESTADO_ANTICIPO_COLORS = {
    'pendiente':           { bg: '#F3F4F6', color: '#6B7280' },
    'entregado':           { bg: '#E3F2FD', color: '#1565C0' },
    'en legalización':     { bg: '#FFF8E1', color: '#F57F17' },
    'legalizado':          { bg: '#E8F5E9', color: '#2E7D32' },
    'excedente pendiente': { bg: '#FFF3E0', color: '#E65100' },
    'cerrado':             { bg: '#F3E5F5', color: '#6A1B9A' },
}

export const getEstadoColorAnticipo = (estado) => {
    if (!estado) return { bg: '#F5F5F5', color: '#757575' }
    return ESTADO_ANTICIPO_COLORS[estado.toLowerCase()] || { bg: '#F5F5F5', color: '#757575' }
}
