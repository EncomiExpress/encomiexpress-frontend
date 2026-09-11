import { Box, Paper, Typography } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import SectionHeader from './SectionHeader.jsx'

const VentasPorEstadoChart = ({ theme, ventasPorEstado, totalVentas }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <SectionHeader
            icon={<BarChartOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
            title="Ventas por Estado"
        />
        {ventasPorEstado.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ventasPorEstado}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={47}
                                outerRadius={70}
                                paddingAngle={2}
                                stroke="none"
                            >
                                {ventasPorEstado.map((e) => <Cell key={e.label} fill={e.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.palette.text.dark, lineHeight: 1 }}>
                            {totalVentas}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
                            ventas
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1, flex: 1, minWidth: 160 }}>
                    {ventasPorEstado.map((e) => (
                        <Box key={e.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: theme.palette.text.medium, fontWeight: 500, fontSize: '0.82rem' }} noWrap>
                                    {e.label}
                                </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: e.color, fontSize: '0.85rem', flexShrink: 0 }}>
                                {e.count.toLocaleString('es-CO')}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                Sin ventas registradas en este período.
            </Typography>
        )}
    </Paper>
)

export default VentasPorEstadoChart
