import theme from '../../shared/styles/theme.js'
import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, Button, TextField,
  LinearProgress, Divider
} from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'

// ── Datos quemados ──────────────────────────────────────────────────────────
const STATS = {
  conductoresDisp: 12,
  conductoresTotal: 18,
  vehiculosDisp: 9,
  vehiculosTotal: 15,
}

const ENVIOS_ESTADO = [
  { label: 'Entregado',   count: 742, color: '#22c55e' },
  { label: 'En tránsito', count: 283, color: '#f59e0b' },
  { label: 'Pendiente',   count: 156, color: '#3b82f6' },
  { label: 'Cancelado',   count: 67,  color: '#ef4444' },
  { label: 'Devuelto',    count: 36,  color: '#9ca3af' },
]

const TOP_RUTAS = [
  { origen: 'Medellín', destino: 'Caucasia',            envios: 287 },
  { origen: 'Medellín', destino: 'Pereira',             envios: 214 },
  { origen: 'Medellín', destino: 'El Bagre',            envios: 176 },
  { origen: 'Pereira',  destino: 'Santa Rosa de Cabal', envios: 139 },
  { origen: 'Caucasia', destino: 'Zaragoza',            envios: 98  },
]

const INGRESOS_MES = [
  { mes: 'Enero 2025',   valor: 14200000 },
  { mes: 'Febrero 2025', valor: 17350000 },
  { mes: 'Marzo 2025',   valor: 17200000 },
]

const formatCOP = (n) => '$' + n.toLocaleString('es-CO')

const KpiCard = ({ icon, label, main, sub, height = '100%', minHeight = 0 }) => (
  <Paper elevation={0} sx={{
    p: 2.5,
    borderRadius: 3,
    border: `1px solid ${theme.palette.divider}`,
    width: '100%',
    height,
    minHeight,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 0.5,
    boxSizing: 'border-box',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Box sx={{ p: 0.8, borderRadius: 2, backgroundColor: theme.palette.primary.light, display: 'flex' }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{
        fontWeight: 600, color: theme.palette.text.secondary,
        fontSize: '0.82rem', letterSpacing: 0.5,
      }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', flex: 1, width: '100%' }}>
      <Typography variant="h4" sx={{ color: theme.palette.primary.dark, fontSize: '2rem', lineHeight: 1.1, fontWeight: 600 }}>
        {main}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Paper>
)

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Box sx={{ p: 0.6, borderRadius: 1.5, backgroundColor: theme.palette.primary.light, display: 'flex' }}>
      {icon}
    </Box>
    <Typography fontWeight={600} fontSize="0.9rem" color={theme.palette.text.primary}>
      {title}
    </Typography>
  </Box>
)

const Dashboard = () => {
  const [desde, setDesde] = useState('2025-01-01')
  const [hasta, setHasta] = useState('2025-03-31')
  const [filtroActivo, setFiltroActivo] = useState({ desde: '2025-01-01', hasta: '2025-03-31' })

  const maxEnvios = Math.max(...ENVIOS_ESTADO.map(e => e.count))
  const maxIngreso = Math.max(...INGRESOS_MES.map(m => m.valor))

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Encabezado con Exportar ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.dark, mb: 0.3 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Panel de control operativo — OsvaldoC Mensajería y Logística S.A.S.
          </Typography>
        </Box>
        <Button
          variant="outlined" size="small"
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{
            borderRadius: 2, textTransform: 'none', fontSize: '0.85rem',
            borderColor: theme.palette.divider, color: theme.palette.text.primary, fontWeight: 500,
            '&:hover': { backgroundColor: theme.palette.primary.light},
          }}
        >
          Exportar
        </Button>
      </Box>

      {/* ── Filtro de período ── */}
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
          <TextField
            type="date" size="small" value={desde}
            onChange={e => setDesde(e.target.value)}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary}>Hasta:</Typography>
          <TextField
            type="date" size="small" value={hasta}
            onChange={e => setHasta(e.target.value)}
            sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem' } }}
          />
        </Box>
        <Button
          variant="contained" size="small"
          onClick={() => setFiltroActivo({ desde, hasta })}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 2 }}
        >
          Aplicar
        </Button>
        <Button
          variant="outlined" size="small"
          onClick={() => {
            setDesde('2025-01-01'); setHasta('2025-03-31')
            setFiltroActivo({ desde: '2025-01-01', hasta: '2025-03-31' })
          }}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', px: 2,
            borderColor: theme.palette.divider, color: theme.palette.text.primary,
            '&:hover': { backgroundColor: theme.palette.background.muted },
          }}
        >
          Limpiar
        </Button>
      </Paper>

      {/* ── Layout principal: dos columnas independientes ── */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>

        {/* ── Columna izquierda: Ingresos + Envíos ── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Ingresos por mes */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <SectionHeader
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
                title="Ingresos por Mes"
              />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
                {filtroActivo.desde} — {filtroActivo.hasta}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {INGRESOS_MES.map((m) => (
                <Box key={m.mes}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.medium, fontWeight: 500, fontSize: '0.82rem' }}>
                      {m.mes}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, fontSize: '0.85rem' }}>
                      {formatCOP(m.valor)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(m.valor / maxIngreso) * 100}
                    sx={{
                      height: 7, borderRadius: 4, backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 45%, ${theme.palette.secondary.main} 100%)`,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Envíos por estado */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <SectionHeader
              icon={<BarChartOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
              title="Envíos por Estado"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              {ENVIOS_ESTADO.map((e) => (
                <Box key={e.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
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
                  <LinearProgress
                    variant="determinate"
                    value={(e.count / maxEnvios) * 100}
                    sx={{
                      height: 6, borderRadius: 4, backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': { backgroundColor: e.color, borderRadius: 4 },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

        </Box>

        {/* ── Columna derecha: KPIs + Rutas ── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* KPIs lado a lado */}
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'stretch', width: '100%' }}>
            <KpiCard
              icon={<PersonOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />}
              label="Conductores Disponibles"
              main={`${STATS.conductoresDisp} / ${STATS.conductoresTotal}`}
              sub="disponibles / total"
              height="165px"
            />
            <KpiCard
              icon={<DirectionsCarOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />}
              label="Vehículos Disponibles"
              main={`${STATS.vehiculosDisp} / ${STATS.vehiculosTotal}`}
              sub="disponibles / total"
              height="165px"
            />
          </Box>

          {/* Top 5 rutas — arranca justo debajo de los KPIs */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <SectionHeader
              icon={<RouteOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />}
              title="Top 5 Rutas más Utilizadas"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {TOP_RUTAS.map((r, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 1.2, borderRadius: 2,
                  backgroundColor: i === 0 ? theme.palette.primary.light : theme.palette.background.muted,
                  border: `1px solid ${i === 0 ? theme.palette.primary.main + '30' : theme.palette.divider}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{
                      width: 20, height: 20, borderRadius: '50%',
                      backgroundColor: i === 0 ? theme.palette.primary.main : theme.palette.primary.light,
                      color: i === 0 ? theme.palette.primary.contrastText : theme.palette.primary.main, fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.medium, fontWeight: 500, fontSize: '0.82rem' }}>
                      {r.origen} → {r.destino}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, fontSize: '0.82rem', whiteSpace: 'nowrap', ml: 1 }}>
                    {r.envios} envíos
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

        </Box>
      </Box>

    </Box>
  )
}

export default Dashboard