import { useTheme } from '@mui/material/styles'
import { useState, useMemo, useEffect } from 'react'
import { useVentas } from '../ventas/context/VentaContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
  Box, Typography, Paper, Button, TextField,
  Divider, CircularProgress, Skeleton
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import { formatRutaDestino } from '../../shared/utils/formatters.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { getRangoFechasVentas } from '../ventas/services/ventaService.js'

const STATUS_LABEL = {
  'Programada': 'Programada',
  'En Ruta': 'En Ruta',
  'Entregada': 'Entregada',
  'Completada con novedades': 'Completada con novedades',
  'Cancelada': 'Cancelada',
}

const formatCOP = (n) => '$' + n.toLocaleString('es-CO')

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// venta.fechaRegistro/desde/hasta son DATEONLY ("YYYY-MM-DD") — new Date(string) los
// interpreta como medianoche UTC, no medianoche local, y en Colombia (UTC-5) eso corre
// el punto de corte varias horas hacia atrás (mismo bug ya corregido en isVencido/
// mananaISO/hoyISO). Sin este fix, una venta registrada el día 1 de cualquier mes caía
// en el mes anterior en la gráfica. Se arma la fecha con componentes locales.
const parseFechaLocal = (dateString) => {
  if (!dateString) return new Date(NaN)
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const normalizeMonth = (dateString) => {
  const date = parseFechaLocal(dateString)
  if (Number.isNaN(date.getTime())) return null
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const label = capitalize(date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))
  const shortLabel = capitalize(date.toLocaleDateString('es-CO', { month: 'short' })).replace('.', '')
  return { key: `${year}-${month}`, label, shortLabel, date }
}

const isWithinRange = (dateString, desde, hasta) => {
  const fecha = parseFechaLocal(dateString)
  if (Number.isNaN(fecha.getTime())) return false
  const inicio = parseFechaLocal(desde)
  const fin = parseFechaLocal(hasta)
  return fecha >= inicio && fecha <= fin
}

const hoyISO = () => {
  const d = new Date()
  const pad2 = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

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
  const [hasta, setHasta] = useState(hoyISO)
  const [filtroActivo, setFiltroActivo] = useState(() => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return {
      desde: firstDay.toISOString().split('T')[0],
      hasta: hoyISO()
    };
  });

  const { ventas, fetchVentas } = useVentas()
  const { conductores } = useConductor()
  const { getVehiculos, fetchVehiculos } = useVehiculo()
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

  // VehiculoContext se carga una sola vez al montar la app y nunca se refresca — si el
  // estado de un vehículo cambió (ej. otra ruta arrancó) durante la sesión del navegador,
  // el KPI quedaba con el valor viejo. Se refresca cada vez que se entra al Dashboard.
  useEffect(() => {
    const abortController = new AbortController()
    fetchVehiculos(abortController.signal, { limit: 1000 })
    return () => abortController.abort()
  }, [fetchVehiculos])

  const hoy = hoyISO()
  // Límites reales del filtro de período: la fecha de la primera y la última venta
  // registrada, calculadas con MIN/MAX directo en la BD (no sobre las ventas ya
  // cargadas arriba, que se limitan a 1000 y podrían no incluir la más antigua).
  const [rangoFechas, setRangoFechas] = useState({ primerRegistro: undefined, ultimoRegistro: undefined, loading: true })
  useEffect(() => {
    let cancelado = false
    getRangoFechasVentas()
      .then(res => {
        if (cancelado || !res?.success) return
        const primerRegistro = res.data?.primerRegistro || undefined
        setRangoFechas({ primerRegistro, ultimoRegistro: res.data?.ultimoRegistro || undefined, loading: false })
        // El "Desde"/"Hasta" iniciales (primer día del mes actual / hoy) se eligen antes
        // de saber cuál es la venta más antigua real — si esa venta es más reciente que
        // el primer día del mes, el valor inicial queda por debajo del mínimo real.
        if (primerRegistro) {
          setDesde(prev => prev < primerRegistro ? primerRegistro : prev)
          setFiltroActivo(prev => prev.desde < primerRegistro ? { ...prev, desde: primerRegistro } : prev)
        }
      })
      .catch(() => { if (!cancelado) setRangoFechas(prev => ({ ...prev, loading: false })) })
    return () => { cancelado = true }
  }, [])
  const primerRegistroISO = rangoFechas.primerRegistro
  // "Hasta" siempre puede llegar hasta hoy, sin importar cuándo fue la última venta
  // registrada — taparlo con la última venta (como se hacía antes) dejaba el rango casi
  // sin días elegibles cuando los datos son recientes o de un solo día (ej. datos de
  // prueba), y de todos modos "hoy" siempre es una fecha válida para filtrar.
  const hastaMaxISO = hoy

  // Por si el navegador permite escribir una fecha fuera de min/max a mano (los atributos
  // nativos min/max del <input type="date"> bloquean el selector pero no siempre el tecleo).
  const clamp = (valor, min, max) => {
    if (min && valor < min) return min
    if (max && valor > max) return max
    return valor
  }
  const aplicarFiltro = () => {
    const desdeClamp = clamp(desde, primerRegistroISO, hastaMaxISO)
    const hastaClamp = clamp(hasta, desdeClamp, hastaMaxISO)
    setDesde(desdeClamp)
    setHasta(hastaClamp)
    setFiltroActivo({ desde: desdeClamp, hasta: hastaClamp })
  }

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
    const orden = ['Entregada', 'Completada con novedades', 'En Ruta', 'Programada', 'Cancelada']
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

  // Total real de envíos del período — la suma de enviosEstado, no un conteo aparte de
  // ventas, para que el KPI y las porciones de la dona siempre sumen lo mismo.
  const totalEnvios = enviosEstado.reduce((s, e) => s + e.count, 0)
  const totalIngresos = ingresosMes.reduce((s, m) => s + m.valor, 0)
  const totalIngresosLabel = totalIngresos >= 1000000
    ? `$${(totalIngresos / 1000000).toFixed(1)}M`
    : formatCOP(totalIngresos)
  const maxIngresoValor = ingresosMes.length ? Math.max(...ingresosMes.map(m => m.valor)) : 0

  // Exporta lo que el dashboard realmente muestra (no las ventas) — un libro
  // con una hoja por sección, usando los mismos datos ya calculados arriba
  // (ingresosMes/enviosEstado/topDestinos), filtrados por el mismo período activo.
  const handleExportar = async () => {
    setExportando(true)
    try {
      const sheets = [
        {
          name: 'Resumen',
          rows: [{
            'Período': `${filtroActivo.desde} — ${filtroActivo.hasta}`,
            'Conductores disponibles': conductoresDisponibles,
            'Conductores totales': conductoresTotales,
            'Vehículos disponibles': vehiculosDisponibles,
            'Vehículos totales': vehiculosTotales,
          }],
        },
        {
          name: 'Ingresos por Mes',
          rows: ingresosMes.map(m => ({ 'Mes': m.mes, 'Ingresos': m.valor })),
        },
        {
          name: 'Envíos por Estado',
          rows: enviosEstado.map(e => ({ 'Estado': e.label, 'Cantidad': e.count })),
        },
        {
          name: 'Top Destinos',
          rows: topDestinos.map((d, i) => ({ 'Puesto': i + 1, 'Destino': d.destino, 'Envíos': d.envios })),
        },
      ]

      await exportToExcel({ sheets, fileName: 'Dashboard', themeColor: theme.palette.primary.main })
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
          {rangoFechas.loading ? (
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
          {rangoFechas.loading ? (
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
          onClick={aplicarFiltro}
          disabled={rangoFechas.loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 2 }}
        >
          Aplicar
        </Button>
        <Button
          variant="outlined" size="small"
          disabled={rangoFechas.loading}
          onClick={() => {
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const firstDayISO = clamp(firstDay.toISOString().split('T')[0], primerRegistroISO, hastaMaxISO);
            setDesde(firstDayISO);
            setHasta(hastaMaxISO);
            setFiltroActivo({ desde: firstDayISO, hasta: hastaMaxISO });
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

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
        gap: { xs: 1.5, md: 2.5 },
      }}>
        <VividKpiCard
          icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />}
          label="Ingresos del Período"
          main={totalIngresosLabel}
          bg={theme.palette.gradient.primary}
          shadow={`${theme.palette.primary.main}40`}
        />
        <VividKpiCard
          icon={<PersonOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />}
          label="Conductores Disponibles"
          main={`${conductoresDisponibles} / ${conductoresTotales}`}
          bg={theme.palette.gradient.primaryHover}
          shadow={`${theme.palette.primary.dark}40`}
        />
        <VividKpiCard
          icon={<DirectionsCarOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />}
          label="Vehículos Disponibles"
          main={`${vehiculosDisponibles} / ${vehiculosTotales}`}
          bg={theme.palette.gradient.primaryHover}
          shadow={`${theme.palette.primary.dark}40`}
        />
        <VividKpiCard
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />}
          label="Envíos Totales"
          main={`${totalEnvios}`}
          bg={theme.palette.gradient.primary}
          shadow={`${theme.palette.primary.main}40`}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: { xs: 'stretch', md: 'flex-start' } }}>

        <Box sx={{ flex: { md: 1.35 }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

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

        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

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

        </Box>
      </Box>

    </Box>
  )
}

export default Dashboard
