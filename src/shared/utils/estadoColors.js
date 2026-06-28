export const getVentaEstadoDot = (estado) => {
    switch (estado) {
        case 'Programada':  return { type: 'circle', fill: false, color: '#A855F7', label: 'Programada' }
        case 'En Tránsito': return { type: 'circle', fill: true,  color: '#3B82F6', label: 'En Tránsito' }
        case 'Entregada':   return { type: 'symbol', char: '✓',   color: '#059669', label: 'Entregada' }
        case 'Cancelada':   return { type: 'symbol', char: '−',   color: '#3F3F46', label: 'Cancelada' }
        default:            return { type: 'circle', fill: false, color: '#9CA3AF', label: estado || '—' }
    }
}

export const getEstadoColorVenta = (estado, theme) => {
    switch (estado) {
        case 'Programada':   return theme.palette.status.ventaProgramada
        case 'En Tránsito':  return theme.palette.status.ventaEnTransito
        case 'Entregada':    return theme.palette.status.ventaEntregadaAlt
        case 'Cancelada':    return theme.palette.status.ventaDevueltaAlt
        default:             return theme.palette.status.neutral
    }
}

export const getEstadoColorVentaHex = (estado) => {
    switch (estado) {
        case 'Programada':   return { bg: '#E0E7FF', color: '#3730A3' }
        case 'En Tránsito':  return { bg: '#CFFAFE', color: '#155E75' }
        case 'Entregada':    return { bg: '#D1FAE5', color: '#065F46' }
        case 'Cancelada':    return { bg: '#FEE2E2', color: '#991B1B' }
        default:             return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

export const getEstadoColorRuta = (estado) => {
    switch (estado) {
        case 'Programada': return { bg: '#F3E8FF', color: '#A855F7' }
        case 'En Curso':   return { bg: '#DBEAFE', color: '#3B82F6' }
        case 'Completada': return { bg: '#D1FAE5', color: '#059669' }
        case 'Cancelada':  return { bg: '#E4E4E7', color: '#3F3F46' }
        default:           return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

export const ESTADO_ANTICIPO_COLORS = {
    'Entregado':           { bg: '#F3E8FF', color: '#A855F7' },
    'En Legalización':     { bg: '#DBEAFE', color: '#3B82F6' },
    'Excedente pendiente': { bg: '#FEF3C7', color: '#F59E0B' },
    'Completado':          { bg: '#F3E5F5', color: '#6A1B9A' },
}

export const getEstadoColorAnticipo = (estado) => {
    if (!estado) return { bg: '#F5F5F5', color: '#757575' }
    return ESTADO_ANTICIPO_COLORS[estado] || { bg: '#F5F5F5', color: '#757575' }
}

export const getRutaEstadoDot = (estado) => {
    switch (estado) {
        case 'Programada':  return { type: 'circle', fill: false, color: '#A855F7', label: 'Programada' }
        case 'En Curso':    return { type: 'circle', fill: true,  color: '#3B82F6', label: 'En Curso' }
        case 'Completada':  return { type: 'symbol', char: '✓',  color: '#059669', label: 'Completada' }
        case 'Cancelada':   return { type: 'symbol', char: '−',  color: '#3F3F46', label: 'Cancelada' }
        default:            return { type: 'circle', fill: false, color: '#9CA3AF', label: estado || '—' }
    }
}

export const getVehiculoEstadoDot = (estado) => {
    switch (estado) {
        case 'En Ruta':       return { type: 'circle', fill: true,  color: '#3B82F6', label: 'En Ruta' }
        case 'Mantenimiento': return { type: 'circle', fill: true,  color: '#ea580c', label: 'Mantenimiento' }
        default:              return { type: 'circle', fill: false, color: '#10b981', label: 'Disponible' }
    }
}

export const getConductorEstadoDot = (estado) => {
    if (estado === 'en_ruta' || estado === 'En Ruta') return { type: 'circle', fill: true, color: '#3B82F6', label: 'En Ruta' }
    return { type: 'circle', fill: false, color: '#10b981', label: 'Disponible' }
}

export const getAnticipoEstadoDot = (estado) => {
    switch (estado) {
        case 'Entregado':          return { type: 'circle', fill: false, color: '#A855F7', label: 'Entregado' }
        case 'En Legalización':    return { type: 'circle', fill: true,  color: '#3B82F6', label: 'En Legalización' }
        case 'Excedente pendiente': return { type: 'symbol', char: '!',  color: '#F59E0B', label: 'Excedente pendiente' }
        case 'Completado':         return { type: 'symbol', char: '✓',  color: '#059669', label: 'Completado' }
        default:                   return { type: 'circle', fill: false, color: '#9CA3AF', label: estado || '—' }
    }
}
