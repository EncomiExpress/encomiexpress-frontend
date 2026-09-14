import { Box, Typography } from '@mui/material'
import { getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'

// `label` (opcional) sobreescribe el texto que trae `getVentaEstadoDot(estado)` sin
// tocar el color/símbolo — usado por Ventas cuando `estado === 'Cancelada'` por dentro
// pero el motivo puntual no debe leerse como una cancelación real (ver
// ventaResolvers.js, LABEL_VENTA_CANCELADA).
const VentaEstadoDot = ({ estado, label }) => {
    const info = getVentaEstadoDot(estado)
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            {info.type === 'circle' ? (
                <Box sx={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: info.fill ? info.color : 'transparent',
                    border: `2px solid ${info.color}`,
                }} />
            ) : (
                <Box sx={{
                    width: 14, height: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    fontSize: info.char === '✓' ? '0.75rem' : '1rem',
                    fontWeight: 700, color: info.color, lineHeight: 1,
                }}>
                    {info.char}
                </Box>
            )}
            <Typography variant="body2" noWrap sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color, minWidth: 0 }}>
                {label || info.label}
            </Typography>
        </Box>
    )
}

export default VentaEstadoDot
