import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Si se pasa previousValue y difiere de value, la fila se marca como modificada
const ConfirmRow = ({ label, value, previousValue }) => {
    const theme = useTheme()
    const huboCambio = previousValue !== undefined && String(previousValue ?? '') !== String(value ?? '')
    const colorCambio = theme.palette.primary.main

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                {huboCambio && (
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colorCambio, flexShrink: 0 }} />
                )}
                {label}
            </Typography>
            <Box sx={{ textAlign: 'right', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value || '—'}
                </Typography>
                {huboCambio && (
                    <Typography variant="caption" sx={{
                        color: theme.palette.text.disabled, textDecoration: 'line-through',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                    }}>
                        antes: {previousValue || '—'}
                    </Typography>
                )}
            </Box>
        </Box>
    )
}

export default ConfirmRow
