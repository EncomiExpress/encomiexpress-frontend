import { Box, Paper, Typography } from '@mui/material'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import SectionHeader from './SectionHeader.jsx'

const TopDestinosList = ({ theme, topDestinos }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <SectionHeader
            icon={<RouteOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
            title="Top 5 Destinos más Utilizados"
        />
        {topDestinos.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                {topDestinos.map((d, i) => {
                    const max = topDestinos[0]?.envios || 1
                    const pct = (d.envios / max) * 100
                    return (
                        <Box key={d.destino} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{
                                width: { xs: 88, sm: 118 }, flexShrink: 0, fontSize: '0.8rem', fontWeight: 600,
                                color: theme.palette.text.medium, lineHeight: 1.25,
                            }}>
                                {d.destino}
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
                                {d.envios}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
                Sin destinos registrados en este período.
            </Typography>
        )}
    </Paper>
)

export default TopDestinosList
