import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const ConfirmRow = ({ label, value }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.9, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary}
                sx={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                {value || '—'}
            </Typography>
        </Box>
    )
}

export default ConfirmRow
