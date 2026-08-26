import { Box, Paper, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import SectionHeader from './SectionHeader.jsx'
import IngresosTooltip from './IngresosTooltip.jsx'

const IngresosPorMesChart = ({ theme, ingresosMes, maxIngresoValor, periodoLabel }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <SectionHeader
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
                title="Ingresos por Mes"
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
                {periodoLabel}
            </Typography>
        </Box>
        {ingresosMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ingresosMes} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                        <linearGradient id="ingresosBarFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.palette.primary.main} />
                            <stop offset="100%" stopColor={theme.palette.primary.dark} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={theme.palette.divider} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="mesCorto" tickLine={false} axisLine={{ stroke: theme.palette.divider }}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    />
                    <YAxis
                        tickLine={false} axisLine={false} width={54}
                        tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                        tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                    />
                    <Tooltip content={<IngresosTooltip />} cursor={{ fill: theme.palette.background.subtle }} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {ingresosMes.map((entry) => (
                            <Cell
                                key={entry.key}
                                fill={entry.valor === maxIngresoValor ? 'url(#ingresosBarFill)' : theme.palette.primary.light}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                Sin ventas registradas en este período.
            </Typography>
        )}
    </Paper>
)

export default IngresosPorMesChart
