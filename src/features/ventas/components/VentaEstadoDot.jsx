import { Box, Typography } from '@mui/material'
import { getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'

const VentaEstadoDot = ({ estado }) => {
    const info = getVentaEstadoDot(estado)
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                {info.label}
            </Typography>
        </Box>
    )
}

export default VentaEstadoDot
