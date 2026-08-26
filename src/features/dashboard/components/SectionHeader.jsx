import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

const SectionHeader = ({ icon, title }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ p: 0.6, borderRadius: 1.5, backgroundColor: theme.palette.primary.light, display: 'flex' }}>
                {icon}
            </Box>
            <Typography fontWeight={600} fontSize="0.9rem" color={theme.palette.text.primary}>
                {title}
            </Typography>
        </Box>
    )
}

export default SectionHeader
