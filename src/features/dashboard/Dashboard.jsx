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
import { exportToExcel } from '../../shared/utils/exportExcel.js'
import { formatFecha } from '../../shared/utils/formatters.js'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { conductorLicenciaVigente, vehiculoDocumentosVigentes } from '../../shared/utils/vigenciaDocumentos.js'
import { getRangoFechasVentas } from '../ventas/services/ventaService.js'
import { STATUS_LABEL, formatCOP, normalizeMonth, isWithinRange, hoyISO, addDiasISO, parseFechaLocal } from './utils/dashboardFormatters.js'
import KpiCard from './components/KpiCard.jsx'
import FiltroPeriodo from './components/FiltroPeriodo.jsx'
import IngresosPorMesChart from './components/IngresosPorMesChart.jsx'
import TopRutasList from './components/TopRutasList.jsx'
import VentasPorEstadoChart from './components/VentasPorEstadoChart.jsx'
import UltimasVentasList from './components/UltimasVentasList.jsx'

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
  // ingresos/ventas por estado, no la página parcial que deja ListarVenta en el contexto.
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

  const ventasPorEstado = useMemo(() => {
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

  // Ruta = corredor origen → destino de la Ruta asociada a la venta (Ruta.origen +
  // Ruta.destino), no el destino del destinatario -- una misma ruta puede repartir
  // paquetes a destinatarios de distintos municipios cercanos, así que agrupar por
  // destinatario no reflejaba qué corredores se usan más.
  const topRutas = useMemo(() => {
    const contador = {}
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta)) return
      if (!venta.ruta?.origen) return
      // Solo municipio, sin departamento -- mismo criterio que la columna "Destino"
      // de Listar Ventas (venta.destinatario.destino.municipio), no formatRutaDestino
      // (que agrega " — Departamento").
      const ruta = `${venta.ruta.origen} → ${venta.ruta.destino?.municipio || '—'}`
      contador[ruta] = (contador[ruta] || 0) + 1
    })
    return Object.entries(contador)
      .map(([ruta, cantidad]) => ({ ruta, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
  }, [ventas, filtroActivo])

  // Últimas 5 ventas registradas dentro del período activo (mismo orden por defecto
  // que Listar Ventas: fechaRegistro DESC, desempatado por id) -- reemplaza la idea
  // de "Actividad Reciente" por algo estático, ver UltimasVentasList.jsx.
  const ultimasVentas = useMemo(() => {
    return ventas
      .filter((venta) => isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta))
      .sort((a, b) => {
        if (a.fechaRegistro !== b.fechaRegistro) return b.fechaRegistro.localeCompare(a.fechaRegistro)
        return b.idEncomiendaVenta - a.idEncomiendaVenta
      })
      .slice(0, 5)
  }, [ventas, filtroActivo])

  // "Disponible" real = habilitado, en estado Disponible (ni En Ruta ni, para
  // vehículo, Mantenimiento), EN BASE (idDestinoActual null -- no varado fuera tras
  // una ruta que no volvió) y con documentos vigentes (licencia del conductor / SOAT
  // + tecnomecánica + seguro del vehículo) -- exactamente el mismo criterio que ya
  // usan los wizards de Ruta para decidir quién es asignable (ver ubicacionOk +
  // conductorLicenciaVigente/vehiculoDocumentosVigentes en RegistrarRutaProgramacion).
  // El total también se acota a habilitados: un conductor/vehículo inhabilitado
  // (baja/retirado) no debería contar en el denominador de "disponibilidad".
  const conductoresHabilitados = conductores.filter(c => c.habilitado)
  const conductoresTotales = conductoresHabilitados.length
  const conductoresDisponibles = conductoresHabilitados.filter(c =>
    c.estado === 'Disponible' &&
    (c.idDestinoActual === null || c.idDestinoActual === undefined) &&
    conductorLicenciaVigente(c.categoriasLicencia)
  ).length
  const conductoresDisponiblesPct = conductoresTotales > 0 ? (conductoresDisponibles / conductoresTotales) * 100 : 0

  const vehiculosHabilitados = transportes.filter(v => v.habilitado)
  const vehiculosTotales = vehiculosHabilitados.length
  const vehiculosDisponibles = vehiculosHabilitados.filter(v =>
    v.estado === 'Disponible' &&
    (v.idDestinoActual === null || v.idDestinoActual === undefined) &&
    vehiculoDocumentosVigentes(v)
  ).length
  const vehiculosDisponiblesPct = vehiculosTotales > 0 ? (vehiculosDisponibles / vehiculosTotales) * 100 : 0

  // Paquetes Entregados -- reemplaza "Envíos Totales" (contaba VENTAS por estado, no
  // paquetes; y "envío" no es un término que use el sistema). Cuenta paquetes en
  // estado 'Entregado' dentro de las ventas del período -- el paquete es la unidad
  // real que se entrega, una venta puede tener varios. La venta que los contiene
  // sigue siendo el criterio de período (mismo campo fechaRegistro que el resto del
  // dashboard), no la fecha del último cambio de estado del paquete.
  const paquetesEntregados = useMemo(() => {
    let count = 0
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, filtroActivo.desde, filtroActivo.hasta)) return
      ;(venta.paquetes || []).forEach((p) => { if (p.estado === 'Entregado') count++ })
    })
    return count
  }, [ventas, filtroActivo])

  // Período anterior comparable: mismo número de días, justo antes del "Desde"
  // activo -- para las tarjetas de variación % (Ingresos/Paquetes Entregados), sin
  // pedir nada nuevo al backend (se recalcula sobre las mismas ventas ya cargadas).
  const periodoAnteriorRango = useMemo(() => {
    const dias = Math.round(
      (parseFechaLocal(filtroActivo.hasta) - parseFechaLocal(filtroActivo.desde)) / 86400000
    ) + 1
    return {
      hasta: addDiasISO(filtroActivo.desde, -1),
      desde: addDiasISO(filtroActivo.desde, -dias),
    }
  }, [filtroActivo])

  const ingresosAnterior = useMemo(() => {
    let total = 0
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, periodoAnteriorRango.desde, periodoAnteriorRango.hasta)) return
      total += Number(venta.total) || 0
    })
    return total
  }, [ventas, periodoAnteriorRango])

  const paquetesEntregadosAnterior = useMemo(() => {
    let count = 0
    ventas.forEach((venta) => {
      if (!isWithinRange(venta.fechaRegistro, periodoAnteriorRango.desde, periodoAnteriorRango.hasta)) return
      ;(venta.paquetes || []).forEach((p) => { if (p.estado === 'Entregado') count++ })
    })
    return count
  }, [ventas, periodoAnteriorRango])

  // null cuando el período anterior no tiene con qué comparar (ej. recién se limpió
  // la base de datos) -- la tarjeta simplemente no muestra variación en ese caso.
  const deltaPct = (actual, anterior) => (anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : null)

  const totalVentas = ventasPorEstado.reduce((s, e) => s + e.count, 0)
  const totalIngresos = ingresosMes.reduce((s, m) => s + m.valor, 0)
  const totalIngresosLabel = totalIngresos >= 1000000
    ? `$${(totalIngresos / 1000000).toFixed(1)}M`
    : formatCOP(totalIngresos)
  const maxIngresoValor = ingresosMes.length ? Math.max(...ingresosMes.map(m => m.valor)) : 0
  const ingresosDelta = deltaPct(totalIngresos, ingresosAnterior)
  const paquetesEntregadosDelta = deltaPct(paquetesEntregados, paquetesEntregadosAnterior)
  // dd/mm/yyyy en vez de las fechas ISO crudas de filtroActivo -- se usa tanto en el
  // subtítulo de "Ingresos por Mes" como en la hoja "Resumen" del Excel exportado.
  const periodoLabel = `${formatFecha(filtroActivo.desde)} — ${formatFecha(filtroActivo.hasta)}`

  // Exporta lo que el dashboard realmente muestra (no las ventas) — un libro
  // con una hoja por sección, usando los mismos datos ya calculados arriba
  // (ingresosMes/ventasPorEstado/topRutas), filtrados por el mismo período activo.
  const handleExportar = async () => {
    setExportando(true)
    try {
      const sheets = [
        {
          name: 'Resumen',
          rows: [{
            'Período': periodoLabel,
            'Conductores disponibles': conductoresDisponibles,
            'Conductores totales': conductoresTotales,
            'Vehículos disponibles': vehiculosDisponibles,
            'Vehículos totales': vehiculosTotales,
            'Paquetes entregados': paquetesEntregados,
          }],
        },
        {
          name: 'Ingresos por Mes',
          rows: ingresosMes.map(m => ({ 'Mes': m.mes, 'Ingresos': formatCOP(m.valor) })),
        },
        {
          name: 'Ventas por Estado',
          rows: ventasPorEstado.map(e => ({ 'Estado': e.label, 'Cantidad': e.count })),
        },
        {
          name: 'Top Rutas',
          rows: topRutas.map((r, i) => ({ 'Puesto': i + 1, 'Ruta': r.ruta, 'Cantidad': r.cantidad })),
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
        <KpiCard
          theme={theme}
          icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 19, color: theme.palette.primary.main }} />}
          iconColor={theme.palette.primary.main}
          label="Ingresos del Período"
          main={totalIngresosLabel}
          delta={ingresosDelta}
        />
        <KpiCard
          theme={theme}
          icon={<PersonOutlinedIcon sx={{ fontSize: 19, color: theme.palette.accent.main }} />}
          iconColor={theme.palette.accent.main}
          label="Conductores Disponibles"
          main={`${conductoresDisponibles} / ${conductoresTotales}`}
          ring={conductoresDisponiblesPct}
        />
        <KpiCard
          theme={theme}
          icon={<DirectionsCarOutlinedIcon sx={{ fontSize: 19, color: theme.palette.status.success.color }} />}
          iconColor={theme.palette.status.success.color}
          label="Vehículos Disponibles"
          main={`${vehiculosDisponibles} / ${vehiculosTotales}`}
          ring={vehiculosDisponiblesPct}
        />
        <KpiCard
          theme={theme}
          icon={<Inventory2OutlinedIcon sx={{ fontSize: 19, color: theme.palette.status.warningAmber.color }} />}
          iconColor={theme.palette.status.warningAmber.color}
          label="Paquetes Entregados"
          main={`${paquetesEntregados}`}
          delta={paquetesEntregadosDelta}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: { xs: 'stretch', md: 'flex-start' } }}>

        <Box sx={{ flex: { md: 1.35 }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <IngresosPorMesChart
            theme={theme} ingresosMes={ingresosMes} maxIngresoValor={maxIngresoValor}
            periodoLabel={periodoLabel}
          />
          <TopRutasList theme={theme} topRutas={topRutas} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <VentasPorEstadoChart theme={theme} ventasPorEstado={ventasPorEstado} totalVentas={totalVentas} />
          <UltimasVentasList theme={theme} ultimasVentas={ultimasVentas} />
        </Box>
      </Box>

    </Box>
  )
}

export default Dashboard
