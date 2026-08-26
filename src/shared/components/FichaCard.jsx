import { useTheme } from '@mui/material/styles'
import { Box, Paper, Typography } from '@mui/material'

const FichaCard = ({ icon: Icon, title, subtitle, children, sx }) => {
    const theme = useTheme()
    return (
        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1, ...sx }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {Icon && <Icon sx={{ fontSize: 20, color: theme.palette.text.primary }} />}
                <Typography fontWeight={700} fontSize="0.95rem" color={theme.palette.text.primary}>{title}</Typography>
            </Box>
            {subtitle && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>{subtitle}</Typography>
            )}
            {children}
        </Paper>
    )
}

export default FichaCard
