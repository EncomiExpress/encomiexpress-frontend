import { Box, Paper, Typography } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import SectionHeader from './SectionHeader.jsx'

const TopRutasList = ({ theme, topRutas }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <SectionHeader
            icon={<RouteOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
            title="Top 5 Rutas más Utilizadas"
        />
        {topRutas.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                {topRutas.map((r, i) => {
                    const max = topRutas[0]?.cantidad || 1
                    const pct = (r.cantidad / max) * 100
                    return (
                        <Box key={r.ruta} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{
                                width: { xs: 110, sm: 150 }, flexShrink: 0, fontSize: '0.8rem', fontWeight: 600,
                                color: theme.palette.text.medium, lineHeight: 1.25,
                            }}>
                                {r.ruta}
                            </Typography>
                            <Box sx={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.palette.background.subtle }}>
                                <Box sx={{
                                    width: `${pct}%`, height: '100%', borderRadius: 4,
                                    backgroundColor: i === 0 ? theme.palette.primary.main : theme.palette.primary.light,
                                }} />
                            </Box>
                            <Typography sx={{
                                width: 34, flexShrink: 0, textAlign: 'right', fontSize: '0.8rem', fontWeight: 700,
                                color: theme.palette.primary.main,
                            }}>
                                {r.cantidad}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
                Sin rutas registradas en este período.
            </Typography>
        )}
    </Paper>
)

export default TopRutasList
