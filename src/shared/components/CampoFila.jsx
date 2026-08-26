import { useTheme } from '@mui/material/styles'
import { Box, Chip, Typography } from '@mui/material'

const CampoFila = ({ label, value, esChip, chipVariant = 'filled', valueColor }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            {esChip ? (
                chipVariant === 'outlined-pill' ? (
                    <Chip
                        label={value}
                        size="small"
                        variant="outlined"
                        sx={{
                            backgroundColor: 'transparent',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 22,
                            borderRadius: 10,
                            borderColor: theme.palette.divider,
                        }}
                    />
                ) : (
                    <Chip
                        label={value || '—'}
                        size="small"
                        sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                    />
                )
            ) : (
                <Typography variant="body2" fontWeight={500} color={valueColor || theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}

export default CampoFila
