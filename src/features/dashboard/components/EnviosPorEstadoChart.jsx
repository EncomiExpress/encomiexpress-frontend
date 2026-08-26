import { Box, Paper, Typography } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import SectionHeader from './SectionHeader.jsx'

const EnviosPorEstadoChart = ({ theme, enviosEstado, totalEnvios }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <SectionHeader
            icon={<BarChartOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
            title="Envíos por Estado"
        />
        {enviosEstado.length > 0 ? (
            <>
                <Box sx={{ position: 'relative', width: 190, height: 190, maxWidth: '100%', mx: 'auto', mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={enviosEstado}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                outerRadius={88}
                                paddingAngle={2}
                                stroke="none"
                            >
                                {enviosEstado.map((e) => <Cell key={e.label} fill={e.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                        <Typography sx={{ fontSize: '1.85rem', fontWeight: 800, color: theme.palette.text.dark, lineHeight: 1 }}>
                            {totalEnvios}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
                            envíos
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                    {enviosEstado.map((e) => (
                        <Box key={e.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: theme.palette.text.medium, fontWeight: 500, fontSize: '0.82rem' }}>
                                    {e.label}
                                </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: e.color, fontSize: '0.85rem' }}>
                                {e.count.toLocaleString('es-CO')}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                Sin envíos registrados en este período.
            </Typography>
        )}
    </Paper>
)

export default EnviosPorEstadoChart
