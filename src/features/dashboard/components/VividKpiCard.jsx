import { Box, Paper, Typography } from '@mui/material'

// Tarjeta KPI en bloque de color sólido (degradado de un solo tono, no arcoíris) —
// solo usa el primary.main/dark/darker que ya expone el tema, alternando entre las dos
// variantes tonales (gradient.primary / gradient.primaryHover) para diferenciar las 4
// tarjetas sin salirse nunca del color activo (rojo o azul, según la paleta elegida).
const VividKpiCard = ({ icon, label, main, bg, shadow }) => (
    <Paper elevation={0} sx={{
        p: { xs: 1.75, md: 2.5 },
        borderRadius: 3,
        background: bg,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, md: 1.5 },
        boxShadow: `0 10px 24px ${shadow}`,
        minWidth: 0,
    }}>
        <Box sx={{
            width: { xs: 28, md: 34 }, height: { xs: 28, md: 34 }, borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.7rem' }, fontWeight: 800, lineHeight: 1.15 }}>
                {main}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' }, opacity: 0.85, mt: 0.3 }}>
                {label}
            </Typography>
        </Box>
    </Paper>
)

export default VividKpiCard
