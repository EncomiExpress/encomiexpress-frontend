import { alpha } from '@mui/material/styles'

// compact: ListarRutaProgramacion.jsx usa una variante más chica (height:18, ancho
// ajustado al contenido) para que el chip quepa debajo del vehículo/conductor en la
// celda de la tabla; ModalConsultarRutaProgramacion.jsx usa el tamaño normal (height:20).
const baseChipSx = (theme, color, { height = 20, compact = false } = {}) => ({
    fontWeight: 600,
    backgroundColor: alpha(theme.palette[color].main, 0.12),
    color: theme.palette[color].dark,
    border: `1px solid ${alpha(theme.palette[color].main, 0.35)}`,
    fontSize: '0.65rem',
    height,
    ...(compact ? { width: 'fit-content', '& .MuiChip-label': { px: 0.8 } } : {}),
})

export const warningChipSx = (theme, opts) => baseChipSx(theme, 'warning', opts)
export const errorChipSx = (theme, opts) => baseChipSx(theme, 'error', opts)
