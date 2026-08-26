import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { formatCOP } from '../utils/dashboardFormatters.js'

const IngresosTooltip = ({ active, payload }) => {
    const theme = useTheme()
    if (!active || !payload?.length) return null
    const { mes, valor } = payload[0].payload
    return (
        <Box sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2, px: 1.5, py: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.3 }}>
                {mes}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                {formatCOP(valor)}
            </Typography>
        </Box>
    )
}

export default IngresosTooltip
