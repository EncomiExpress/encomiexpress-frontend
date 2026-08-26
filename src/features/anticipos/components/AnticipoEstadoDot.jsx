import { Box, Typography } from '@mui/material'
import { getAnticipoEstadoDot } from '../../../shared/utils/estadoColors.js'

const AnticipoEstadoDot = ({ estado }) => {
    const info = getAnticipoEstadoDot(estado)
    if (info.type === 'symbol') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
                <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>
                    {info.char}
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color, whiteSpace: 'nowrap' }}>{info.label}</Typography>
            </Box>
        )
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color, whiteSpace: 'nowrap' }}>{info.label}</Typography>
        </Box>
    )
}

export default AnticipoEstadoDot
