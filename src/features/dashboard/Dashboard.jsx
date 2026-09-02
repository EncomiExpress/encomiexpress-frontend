import { useTheme } from '@mui/material/styles'
import { useState, useMemo, useEffect } from 'react'
import { useVentas } from '../ventas/context/VentaContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { formatRutaDestino } from '../../shared/utils/formatters.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { getRangoFechasVentas } from '../ventas/services/ventaService.js'
import { STATUS_LABEL, formatCOP, normalizeMonth, isWithinRange, hoyISO } from './utils/dashboardFormatters.js'
import VividKpiCard from './components/VividKpiCard.jsx'
import FiltroPeriodo from './components/FiltroPeriodo.jsx'
import IngresosPorMesChart from './components/IngresosPorMesChart.jsx'
import TopDestinosList from './components/TopDestinosList.jsx'
import EnviosPorEstadoChart from './components/EnviosPorEstadoChart.jsx'

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
  const limpiarFiltro = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayISO = clamp(firstDay.toISOString().split('T')[0], primerRegistroISO, hastaMaxISO);
    setDesde(firstDayISO);
    setHasta(hastaMaxISO);
    setFiltroActivo({ desde: firstDayISO, hasta: hastaMaxISO });
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
  const conductoresDisponibles = conductores.filter(c => c.habilitado && c.estado === 'Disponible').length
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

      <FiltroPeriodo
        theme={theme}
        desde={desde} setDesde={setDesde}
        hasta={hasta} setHasta={setHasta}
        primerRegistroISO={primerRegistroISO}
        hastaMaxISO={hastaMaxISO}
        loading={rangoFechas.loading}
        clamp={clamp}
        onAplicar={aplicarFiltro}
        onLimpiar={limpiarFiltro}
      />

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
          <IngresosPorMesChart
            theme={theme} ingresosMes={ingresosMes} maxIngresoValor={maxIngresoValor}
            periodoLabel={`${filtroActivo.desde} — ${filtroActivo.hasta}`}
          />
          <TopDestinosList theme={theme} topDestinos={topDestinos} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <EnviosPorEstadoChart theme={theme} enviosEstado={enviosEstado} totalEnvios={totalEnvios} />
        </Box>
      </Box>

    </Box>
  )
}

export default Dashboard
