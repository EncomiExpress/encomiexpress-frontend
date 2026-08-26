import { Box, Typography, Paper, Button, TextField, Divider, Skeleton } from '@mui/material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'

const FiltroPeriodo = ({
    theme, desde, setDesde, hasta, setHasta, primerRegistroISO, hastaMaxISO,
    loading, clamp, onAplicar, onLimpiar,
}) => (
    <Paper elevation={0} sx={{
        p: 1.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`,
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 17, color: theme.palette.primary.main }} />
            <Typography fontWeight={600} fontSize="0.83rem" color={theme.palette.text.secondary} sx={{ letterSpacing: 0.5 }}>
                Filtro de Período
            </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary}>Desde:</Typography>
            {loading ? (
                <Skeleton variant="rounded" width={150} height={36} sx={{ borderRadius: 2 }} />
            ) : (
                <TextField
                    type="date" size="small" value={desde}
                    onChange={e => setDesde(clamp(e.target.value, primerRegistroISO, hastaMaxISO))}
                    slotProps={{ htmlInput: { min: primerRegistroISO, max: hastaMaxISO } }}
                    sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }}
                />
            )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary}>Hasta:</Typography>
            {loading ? (
                <Skeleton variant="rounded" width={150} height={36} sx={{ borderRadius: 2 }} />
            ) : (
                <TextField
                    type="date" size="small" value={hasta}
                    onChange={e => setHasta(clamp(e.target.value, desde || primerRegistroISO, hastaMaxISO))}
                    slotProps={{ htmlInput: { min: desde || primerRegistroISO, max: hastaMaxISO } }}
                    sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }}
                />
            )}
        </Box>
        <Button
            variant="contained" size="small"
            onClick={onAplicar}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 2 }}
        >
            Aplicar
        </Button>
        <Button
            variant="outlined" size="small"
            disabled={loading}
            onClick={onLimpiar}
            sx={{
                borderRadius: 2, textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', px: 2,
                borderColor: theme.palette.divider, color: theme.palette.text.primary,
                '&:hover': { backgroundColor: theme.palette.background.muted },
            }}
        >
            Limpiar
        </Button>
    </Paper>
)

export default FiltroPeriodo
