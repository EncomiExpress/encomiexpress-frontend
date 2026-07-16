import { useTheme } from '@mui/material/styles'
import { useState, useMemo, useEffect } from 'react'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getEncomiendas } from '../../shared/services/ventaService'
import {
  Box, Typography, Paper, Button, TextField,
  LinearProgress, Divider, CircularProgress
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import { formatRutaDestino } from '../../shared/utils/formatters.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'

const STATUS_LABEL = {
  'Programada':  'Programada',
  'En Tránsito': 'En Tránsito',
  'Entregada':   'Entregada',
  'Cancelada':   'Cancelada',
}

const formatCOP = (n) => '$' + n.toLocaleString('es-CO')

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const normalizeMonth = (dateString) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const label = capitalize(date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))
  const shortLabel = capitalize(date.toLocaleDateString('es-CO', { month: 'short' })).replace('.', '')
  return { key: `${year}-${month}`, label, shortLabel, date }
}

const isWithinRange = (dateString, desde, hasta) => {
  const fecha = new Date(dateString)
  if (Number.isNaN(fecha.getTime())) return false
  const inicio = new Date(desde)
  const fin = new Date(hasta)
  return fecha >= inicio && fecha <= fin
}

const KpiCard = ({ icon, label, main, sub, height = '100%', minHeight = 0 }) => {
  const theme = useTheme()
  return (
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
}

const IngresosTooltip = ({ active, payload }) => {
  const theme = useTheme()
  if (!active || !payload?.length) return null
  const { mes, valor } = payload[0].payload
  return (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2, px: 1.5, py: 1,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.3 }}>
        {mes}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
        {formatCOP(valor)}
      </Typography>
    </Box>
  )
}

const SectionHeader = ({ icon, title }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ p: 0.6, borderRadius: 1.5, backgroundColor: theme.palette.primary.light, display: 'flex' }}>
        {icon}
      </Box>
      <Typography fontWeight={600} fontSize="0.9rem" color={theme.palette.text.primary}>
        {title}
      </Typography>
    </Box>
  )
}

const Dashboard = () => {
  const [desde, setDesde] = useState(() => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [hasta, setHasta] = useState(() => {
    const date = new Date();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  });
  const [filtroActivo, setFiltroActivo] = useState(() => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      desde: firstDay.toISOString().split('T')[0],
      hasta: lastDay.toISOString().split('T')[0]
    };
  });

  const { ventas, fetchVentas } = useVentas()
  const { conductores } = useConductor()
  const { getVehiculos } = useVehiculo()
  const transportes = getVehiculos()
  const { showToast } = useToast()
  const [exportando, setExportando] = useState(false)

  const theme = useTheme()

  // El dashboard necesita el histórico completo de ventas para calcular
  // ingresos/envíos por estado, no la página parcial que deja ListarVenta en el contexto.
  useEffect(() => {
    const abortController = new AbortController()
    fetchVentas(abortController.signal, { limit: 1000 })
    return () => abortController.abort()
  }, [fetchVentas])

  const ingresosMes = useMemo(() => {
    const meses = new Map()
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta)) return
      const fecha = normalizeMonth(venta.fechaRegistro)
      if (!fecha || venta.total == null) return
      const valor = Number(venta.total) || 0
      const current = meses.get(fecha.key) || { key: fecha.key, mes: fecha.label, mesCorto: fecha.shortLabel, valor: 0 }
      meses.set(fecha.key, { ...current, valor: current.valor + valor })
    })
    return Array.from(meses.values()).sort((a, b) => a.key.localeCompare(b.key))
  }, [ventas, filtroActivo])

  const enviosEstado = useMemo(() => {
    const contador = {}
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta)) return
      const estadoKey = String(venta.estado || '').trim()
      if (!estadoKey) return
      contador[estadoKey] = (contador[estadoKey] || 0) + 1
    })
    const orden = ['Entregada', 'En Tránsito', 'Programada', 'Cancelada']
    return orden
      .filter(key => contador[key])
      .map(key => ({
        label: STATUS_LABEL[key] || key.charAt(0).toUpperCase() + key.slice(1),
        count: contador[key],
        color: getVentaEstadoDot(key).color,
      }))
  }, [ventas, filtroActivo])

  const topDestinos = useMemo(() => {
    const contador = {}
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta)) return
      const destino = formatRutaDestino(venta.ruta?.destino)
      if (!destino || destino === '—') return
      contador[destino] = (contador[destino] || 0) + 1
    })
    return Object.entries(contador)
      .map(([destino, envios]) => ({ destino, envios }))
      .sort((a, b) => b.envios - a.envios)
      .slice(0, 5)
  }, [ventas, filtroActivo])

  const conductoresTotales = conductores.length
  const conductoresDisponibles = conductores.filter(c => c.habilitado).length
  const vehiculosTotales = transportes.length
  const vehiculosDisponibles = transportes.filter(t => t.habilitado && t.estado === 'Disponible').length

  const maxEnvios = enviosEstado.length > 0 ? Math.max(...enviosEstado.map(e => e.count)) : 1

  const handleExportar = async () => {
    setExportando(true)
    try {
      // El dashboard no tiene filtros propios — se trae el histórico completo,
      // sin el tope de 1000 que usa la carga inicial del panel.
      const res = await getEncomiendas(undefined, { limit: 100000 })
      const rows = (res?.data || []).map(venta => ({
        'ID': venta.idEncomiendaVenta || venta.idVenta,
        'Guía': venta.numeroGuia,
        'Cliente': `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || venta.idCliente || '-',
        'Estado': venta.estado,
        'Estado de pago': venta.estadoPago,
        'Total': venta.total,
        'Fecha': venta.fechaRegistro,
      }))

      await exportToExcel({ data: rows, fileName: 'dashboard', sheetName: 'Dashboard', themeColor: theme.palette.primary.main })
    } catch (err) {
      showToast(err.message || 'Error al exportar.', 'error')
    } finally {
      setExportando(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>

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
          onClick={handleExportar}
          disabled={exportando}
          variant="contained"
          startIcon={exportando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.activeBg,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
            },
          }}
        >
          {exportando ? 'Exportando...' : 'Exportar'}
        </Button>
      </Box>

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
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            setDesde(firstDay.toISOString().split('T')[0]);
            setHasta(lastDay.toISOString().split('T')[0]);
            setFiltroActivo({ desde: firstDay.toISOString().split('T')[0], hasta: lastDay.toISOString().split('T')[0] });
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

      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <SectionHeader
                icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
                title="Ingresos por Mes"
              />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem' }}>
                {filtroActivo.desde} — {filtroActivo.hasta}
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
                  <Bar dataKey="valor" fill="url(#ingresosBarFill)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                Sin ventas registradas en este período.
              </Typography>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <SectionHeader
              icon={<BarChartOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
              title="Envíos por Estado"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              {enviosEstado.map((e) => (
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
                      height: 6, borderRadius: 4, backgroundColor: theme.palette.background.subtle,
                      '& .MuiLinearProgress-bar': { backgroundColor: e.color, borderRadius: 4 },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'stretch', width: '100%' }}>
            <KpiCard
              icon={<PersonOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.darker }} />}
              label="Conductores Disponibles"
              main={`${conductoresDisponibles} / ${conductoresTotales}`}
              sub="disponibles / total"
              height="165px"
            />
            <KpiCard
              icon={<DirectionsCarOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.darker }} />}
              label="Vehículos Disponibles"
              main={`${vehiculosDisponibles} / ${vehiculosTotales}`}
              sub="disponibles / total"
              height="165px"
            />
          </Box>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <SectionHeader
              icon={<RouteOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
              title="Top 5 Destinos más Utilizados"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {topDestinos.map((d, i) => (
                <Box key={d.destino} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: 1.2, borderRadius: 2,
                  backgroundColor: i === 0 ? theme.palette.primary.light : theme.palette.background.muted,
                  border: `1px solid ${i === 0 ? theme.palette.primary.main + '30' : theme.palette.divider}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{
                      width: 20, height: 20, borderRadius: '50%',
                      backgroundColor: i === 0 ? theme.palette.primary.main : theme.palette.primary.light,
                      color: i === 0 ? theme.palette.primary.contrastText : theme.palette.primary.darker, fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ color: i === 0 ? theme.palette.primary.darker : theme.palette.text.medium, fontWeight: 500, fontSize: '0.82rem' }}>
                      {d.destino}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, fontSize: '0.82rem', whiteSpace: 'nowrap', ml: 1 }}>
                    {d.envios} envíos
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
