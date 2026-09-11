import { Box, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'

// Aro de progreso simple en SVG — para Conductores/Vehículos Disponibles, donde el
// dato ya es una proporción (X/Y) y no hace falta compararlo con el período anterior.
const RingProgress = ({ pct, color, track }) => {
    const size = 44
    const stroke = 4.5
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const offset = c * (1 - Math.min(Math.max(pct, 0), 100) / 100)
    return (
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
                <circle
                    cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                    strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
                />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color }}>
                    {Math.round(pct)}%
                </Typography>
            </Box>
        </Box>
    )
}

// Variación % vs. el período anterior (mismo número de días, justo antes del "Desde"
// elegido) — se calcula en el cliente a partir de las mismas ventas ya cargadas, sin
// pedir nada nuevo al backend. `pct` null cuando el período anterior no tiene datos
// con qué comparar (ej. recién se limpió la base de datos).
const DeltaBadge = ({ pct, theme }) => {
    const positivo = pct >= 0
    const color = positivo ? theme.palette.status.activeText : theme.palette.status.inactiveText
    const Icon = positivo ? TrendingUpOutlinedIcon : TrendingDownOutlinedIcon
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Icon sx={{ fontSize: 15, color }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                    {Math.abs(pct)}%
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
                vs. anterior
            </Typography>
        </Box>
    )
}

// Tarjeta KPI neutral: ícono en chip de color + número + etiqueta, con un dato
// complementario a la derecha (separado por una línea divisoria) — un aro con el %
// de disponibilidad para las tarjetas que ya son una proporción (Conductores/
// Vehículos), o la variación % vs. el período anterior para las que son un
// acumulado (Ingresos/Paquetes). Reemplaza el bloque de color sólido de
// VividKpiCard, que la usuaria pidió aligerar. Se oculta en mobile (xs) para no
// amontonar la tarjeta angosta de la grilla de 2 columnas.
const KpiCard = ({ theme, icon, iconColor, label, main, ring, delta }) => {
    const hasRing = ring !== undefined && ring !== null
    const hasDelta = delta !== undefined && delta !== null

    return (
        <Paper elevation={0} sx={{
            p: { xs: 1.75, md: 2.25 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 0,
        }}>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 } }}>
                <Box sx={{
                    width: { xs: 32, md: 38 }, height: { xs: 32, md: 38 }, borderRadius: 2.5,
                    backgroundColor: alpha(iconColor, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.55rem' }, fontWeight: 800, lineHeight: 1.15, color: theme.palette.text.dark }}>
                        {main}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' }, color: theme.palette.text.secondary, mt: 0.3 }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
            {(hasRing || hasDelta) && (
                <Box sx={{
                    display: { xs: 'none', md: 'flex' }, alignItems: 'center',
                    pl: 1.5, borderLeft: `1px solid ${theme.palette.divider}`, flexShrink: 0,
                }}>
                    {hasRing
                        ? <RingProgress pct={ring} color={iconColor} track={theme.palette.background.subtle} />
                        : <DeltaBadge pct={delta} theme={theme} />}
                </Box>
            )}
        </Paper>
    )
}

export default KpiCard
