import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Select, MenuItem, FormControl, Menu,
    Tooltip, Button,
    CircularProgress,
    Dialog, DialogContent
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import DataTable, { FiltroEstadoTabs, BuscadorField } from '../../shared/components/DataTable.jsx'
import { useRutaProgramacion } from './context/RutaProgramacionContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'
import ModalConsultarRutaProgramacion from './ModalConsultarRutaProgramacion'
import ModalConfirmarEstado from './ModalConfirmarEstado'
import ModalInhabilitarRuta from './ModalInhabilitarRuta'
import { getPageOfRuta, getAniosDisponiblesRuta, getRutas, getDisponibilidadRuta } from './services/rutaService.js'
import { getEncomiendas } from '../ventas/services/ventaService.js'
import { formatFecha, getGuiaPrincipal } from '../../shared/utils/formatters.js'
import { getDocumentoVehiculoVencido, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'
import { getEstadoColorRuta as getEstadoColor, getVehiculoEstadoDot, getConductorEstadoDot } from '../../shared/utils/estadoColors.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'

const renderEstadoDot = (estado, getEstadoColor) => {
    const color = getEstadoColor(estado).color
    if (estado === 'Cancelada') {
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    }
    if (estado === 'Completada') {
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    }
    if (estado === 'Programada') {
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    }
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

const formatHora12 = (hora) => {
    if (!hora) return null
    const [h, m] = hora.split(':').map(Number)
    const periodo = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${periodo}`
}

const ESTADOS_RUTA = ['Programada', 'En Ruta', 'Completada', 'Cancelada']

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const MESES = [
    { value: '1',  label: 'Enero' },   { value: '2',  label: 'Febrero' },
    { value: '3',  label: 'Marzo' },   { value: '4',  label: 'Abril' },
    { value: '5',  label: 'Mayo' },    { value: '6',  label: 'Junio' },
    { value: '7',  label: 'Julio' },   { value: '8',  label: 'Agosto' },
    { value: '9',  label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

const ListarRutaProgramacion = () => {
    const theme = useTheme()
    const filterMenuProps = getFilterMenuProps(theme)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const highlightId = searchParams.get('highlight')
    const highlightRef = useRef(null)
    const hasScrolled = useRef(false)
    const hasNavigated = useRef(false)
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const [searchTerm, setSearchTerm]         = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [rutaVer, setRutaVer]               = useState(null)
    const { showToast } = useToast()
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idRuta: null, origen: '', habilitadoActual: null, estadoRuta: null })
    const [confirmEstado, setConfirmEstado]   = useState({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, pares: [] })
    const [alertaBloqueo, setAlertaBloqueo]   = useState({ open: false, tipo: 'conflicto', titulo: '', entidades: [] })
    const [estadoMenu, setEstadoMenu]         = useState({ anchor: null, id: null, estadoActual: null })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const filtroContainerRef = useRef(null)
    const filtroBtnRefs = useRef([])
    const [filtroPillStyle, setFiltroPillStyle] = useState({ left: 0, width: 0 })

    useLayoutEffect(() => {
        const FILTROS_VALORES = ['todo', 'habilitado', 'inhabilitado']
        const activeIndex = FILTROS_VALORES.findIndex(v => v === filtroHabilitado)
        const btn = filtroBtnRefs.current[activeIndex]
        const container = filtroContainerRef.current
        if (btn && container) {
            setFiltroPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
        }
    }, [filtroHabilitado])
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('')
    const [filtroAnio, setFiltroAnio]         = useState('')
    const [filtroMes, setFiltroMes]           = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar]         = useState(null)
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [sortBy, setSortBy] = useState({ field: '', dir: '' })
    const initialLoad = useRef(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [exportando, setExportando] = useState(false)

    const { rutasProgramadas, total, fetchRutasProgramadas, updateEstado, toggleHabilitado } = useRutaProgramacion()
    const { getVehiculos, fetchVehiculos } = useVehiculo()
    const { getConductores, fetchConductores } = useConductor()
    const { destinos } = useDestino()

    useEffect(() => {
      if (!usuario) {
        navigate('/login')
      }
    }, [usuario, navigate])

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    useEffect(() => {
        if (highlightId && highlightRef.current && !hasScrolled.current) {
            hasScrolled.current = true
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
        }
    })

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfRuta(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])

    const buildRutasParams = () => ({
        page,
        limit: rowsPerPage,
        sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        estado: filtroEstadoRuta || undefined,
        anio: filtroAnio || undefined,
        mes: filtroMes || undefined,
        q: debouncedSearch.trim() || undefined,
    })

    useEffect(() => {
        if (!usuario) return
        const controller = new AbortController()
        let cancelled = false

        const cargar = async () => {
            setLoading(true)
            setError(null)
            try {
                await fetchRutasProgramadas(buildRutasParams(), controller.signal)
            } catch (err) {
                if (!cancelled && err.name !== 'AbortError') setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        cargar()
        return () => {
            cancelled = true
            controller.abort()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchRutasProgramadas, page, rowsPerPage, debouncedSearch, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, sortBy, usuario])

    useEffect(() => {
        if (!loading) { initialLoad.current = false }
    }, [loading])

    const handleSort = (field) => {
        setSortBy(prev => {
            if (prev.field !== field) return { field, dir: 'asc' }
            if (prev.dir === 'asc') return { field, dir: 'desc' }
            return { field: '', dir: '' }
        })
        setPage(1)
    }

    // Años disponibles para el filtro — se traen del backend (todas las rutas),
    // no solo de la página actualmente cargada, para que el dropdown esté completo
    // sin importar la paginación.
    useEffect(() => {
        getAniosDisponiblesRuta()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    // Helpers para mostrar datos relacionados (ya están en los contextos)
    const getVehiculoPlaca = (id) => {
        const v = getVehiculos().find(v => v.idVehiculo === id)
        return v ? v.placa : 'N/A'
    }
    const getConductorNombre = (id) => {
        const c = getConductores().find(c => c.idConductor === id)
        return c ? `${c.nombre} ${c.apellido}` : 'N/A'
    }
    const getDestinoNombre = (id) => {
        const d = destinos.find(d => d.idDestino === id)
        return d ? (d.nombre || `${d.ciudad}, ${d.departamento}`) : 'N/A'
    }

    // Una ruta ahora puede tener varios vehículos+conductor (convoy) — se expone el
    // array completo de pares, con respaldo a los contextos si la API no trae embebido
    // el vehículo/conductor de algún par.
    const resolvePares = (ruta) => (ruta.paresVehiculoConductor || []).map(par => ({
        idRutaVehiculoConductor: par.idRutaVehiculoConductor,
        placa: par.vehiculo?.placa ?? getVehiculoPlaca(par.idVehiculo),
        vehiculoInhabilitado: getVehiculos().find(v => v.idVehiculo === par.idVehiculo)?.habilitado === false,
        // Igual que "inhabilitado" arriba: el backend solo revalida documentos/licencia
        // al crear la ruta, al cambiar el par, o al pasar a "En Ruta" — nunca de forma
        // continua — así que un documento puede vencerse mientras la ruta ya está
        // Programada sin que nada lo marque. Esto lo hace visible en el listado.
        documentoVencido: par.vehiculo ? getDocumentoVehiculoVencido(par.vehiculo) : null,
        conductorNombre: par.conductor?.usuario
            ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}`
            : getConductorNombre(par.idConductor),
        conductorInhabilitado: getConductores().find(c => c.idConductor === par.idConductor)?.habilitado === false,
        licenciaVencida: par.conductor ? !conductorLicenciaVigente(par.conductor.categoriasLicencia) : false,
    }))

    const resolveDestino = (ruta) =>
        ruta.destino
            ? `${ruta.destino.ciudad}, ${ruta.destino.departamento}`
            : getDestinoNombre(ruta.idDestino)

    const getId = (ruta) => ruta.idRuta ?? ruta.idRutaProgramada

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getRutas({ ...buildRutasParams(), page: 1, limit: 100000 })
            const rows = (res?.data || []).map(ruta => {
                const pares = resolvePares(ruta)
                return {
                    'ID': getId(ruta),
                    'Origen': ruta.origen || `Ruta ${getId(ruta)}`,
                    'Destino': resolveDestino(ruta),
                    'Vehículo': pares.map(p => p.placa).filter(Boolean).join(', ') || 'N/A',
                    'Conductor': pares.map(p => p.conductorNombre).filter(Boolean).join(', ') || 'N/A',
                    'Fecha salida': ruta.fechaSalida,
                    'Hora salida': formatHora12(ruta.horaSalida),
                    'Estado': ruta.estado,
                    'Habilitado': ruta.habilitado === false ? 'No' : 'Sí',
                }
            })
            await exportToExcel({ data: rows, fileName: 'Rutas', sheetName: 'Rutas', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    const ejecutarCambioEstado = async (id, nuevoEstado) => {
        try {
            await updateEstado(id, nuevoEstado)
            // updateEstado del contexto solo parcha el campo "estado" en memoria — los
            // indicadores "pendienteLegalizacion"/"paquetesPendientes" salen de una
            // consulta agregada aparte (rutaService.getAll) y quedarían desactualizados
            // (ej. al pasar a "En Ruta" recién ahí nace el anticipo "En Legalización" y
            // los paquetes "Por entregar", pero la fila seguiría mostrando el selector
            // normal hasta el próximo refresco). Se refresca la lista completa para que
            // el selector dividido de bloqueo aparezca de inmediato si corresponde.
            fetchRutasProgramadas(buildRutasParams())
            showToast(`Estado actualizado a "${nuevoEstado}".`, 'success')
        } catch (err) {
            if (err.errorCode === 'MISSING_DELIVERY_DATE') {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'ventas',
                    titulo: 'No se puede iniciar la ruta',
                    entidades: err.details || [],
                })
                return
            }
            showToast(err.message || 'Error al actualizar estado', 'error')
        }
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        const paresActual = rutaActual?.paresVehiculoConductor || []

        let disponibilidad = []
        if (nuevoEstado === 'En Ruta') {
            // Refresca vehículos/conductores y consulta disponibilidad real contra TODAS
            // las rutas En Ruta — antes este chequeo solo miraba `rutasProgramadas`
            // (limitada por la paginación de la tabla) y podía dejar pasar conflictos
            // reales que estuvieran fuera de la página cargada.
            const idVehiculos = paresActual.map(p => p.idVehiculo).filter(Boolean)
            const idConductores = paresActual.map(p => p.idConductor).filter(Boolean)
            try {
                const [, , disp] = await Promise.all([
                    fetchVehiculos(),
                    fetchConductores(),
                    getDisponibilidadRuta({ idVehiculos, idConductores, idRutaExcluir: id }).then(res => res.data || []),
                ])
                disponibilidad = disp
            } catch (err) {
                // Si el chequeo previo falla (ej. sin conexión), no se bloquea el flujo —
                // el backend igual revalida VEHICLE_IN_USE/CONDUCTOR_IN_USE al confirmar.
                showToast(err.message || 'No se pudo verificar disponibilidad, se validará al confirmar.', 'warning')
            }
        }

        // Vehículo/conductor "en vivo" desde los contextos (recién refrescados arriba
        // si el nuevo estado es En Ruta), con respaldo a los datos de la propia ruta.
        const paresResueltos = paresActual.map(par => ({
            idRutaVehiculoConductor: par.idRutaVehiculoConductor,
            idVehiculo: par.idVehiculo,
            idConductor: par.idConductor,
            vehiculo: getVehiculos().find(v => v.idVehiculo === par.idVehiculo) || (par.vehiculo ? { ...par.vehiculo } : null),
            conductor: getConductores().find(c => c.idConductor === par.idConductor) || (par.conductor?.usuario ? { idConductor: par.idConductor, ...par.conductor.usuario } : null),
        }))

        if (nuevoEstado === 'En Ruta') {
            const entidades = []
            let vehiculoBlocked = false
            let conductorBlocked = false

            for (const par of paresResueltos) {
                const conflictoVehiculo = disponibilidad.find(d => d.idVehiculo === par.idVehiculo && d.estado === 'En Ruta')
                const conflictoConductor = disponibilidad.find(d => d.idConductor === par.idConductor && d.estado === 'En Ruta')

                if (par.vehiculo?.estado === 'Mantenimiento') {
                    vehiculoBlocked = true
                    entidades.push({ tipo: 'vehiculo', etiqueta: par.vehiculo.placa || '', estado: par.vehiculo.estado, id: par.vehiculo.idVehiculo, mensaje: 'está en Mantenimiento y no puede asignarse a una ruta En Ruta.', rutaConflicto: null })
                } else if (conflictoVehiculo) {
                    vehiculoBlocked = true
                    entidades.push({
                        tipo: 'vehiculo', etiqueta: par.vehiculo?.placa || '', estado: par.vehiculo?.estado, id: par.vehiculo?.idVehiculo,
                        mensaje: 'ya está asignado a la ruta', mensajeFin: 'que se encuentra En Ruta.',
                        rutaConflicto: { idRuta: conflictoVehiculo.idRuta, label: conflictoVehiculo.origen ? `${conflictoVehiculo.origen} → ${conflictoVehiculo.destino?.ciudad || 'Sin destino'}` : `#${conflictoVehiculo.idRuta}` },
                    })
                }

                if (conflictoConductor) {
                    conductorBlocked = true
                    const nombre = par.conductor?.nombre ? `${par.conductor.nombre} ${par.conductor.apellido || ''}`.trim() : 'Conductor'
                    entidades.push({
                        tipo: 'conductor', etiqueta: nombre, estado: par.conductor?.estado || 'en_ruta', id: par.conductor?.idConductor,
                        mensaje: 'ya está asignado a la ruta', mensajeFin: 'que se encuentra En Ruta.',
                        rutaConflicto: { idRuta: conflictoConductor.idRuta, label: conflictoConductor.origen ? `${conflictoConductor.origen} → ${conflictoConductor.destino?.ciudad || 'Sin destino'}` : `#${conflictoConductor.idRuta}` },
                    })
                }
            }

            if (entidades.length > 0) {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'conflicto',
                    titulo: vehiculoBlocked && conductorBlocked
                        ? 'Vehículo y conductor no disponibles'
                        : vehiculoBlocked ? 'Vehículo no disponible'
                        : 'Conductor no disponible',
                    entidades,
                })
                return
            }

            // Mismo chequeo que hace el backend al confirmar (updateEstado) — se
            // adelanta acá para no dejar que el modal normal de "cambiar a En Ruta"
            // (que ya dice que vehículo/conductor pasarán a ocupados, dando a entender
            // que todo está bien) se muestre primero y recién al confirmar salga este
            // bloqueo. Si algo bloquea, se avisa antes de llegar a ese modal.
            try {
                const ventasRes = await getEncomiendas(undefined, { idRuta: id, habilitado: 'true', limit: 1000 })
                const ventasSinFecha = (ventasRes?.data || []).filter(v => v.estado !== 'Cancelada' && !v.fechaEstimadaEntrega)
                if (ventasSinFecha.length > 0) {
                    setAlertaBloqueo({
                        open: true,
                        tipo: 'ventas',
                        titulo: 'No se puede iniciar la ruta',
                        entidades: ventasSinFecha.map(v => ({ id: v.idEncomiendaVenta, guia: getGuiaPrincipal(v) })),
                    })
                    return
                }
            } catch (err) {
                // Si el chequeo previo falla, no se bloquea el flujo — el backend
                // igual revalida MISSING_DELIVERY_DATE al confirmar.
                showToast(err.message || 'No se pudo verificar las fechas de entrega, se validará al confirmar.', 'warning')
            }
        }

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta ruta. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': 'El vehículo y el conductor quedarán disponibles y las ventas asociadas pasarán a "Entregada".',
            'Cancelada': 'El vehículo y el conductor quedarán disponibles, el anticipo pasará a "Excedente pendiente" y las ventas asociadas quedarán pendientes de reasignación a otra ruta.',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, ruta: rutaActual, pares: paresResueltos })
    }

    const handleToggleHabilitado = (id) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        setConfirmInhabilitar({
            open: true,
            idRuta: id,
            origen: rutaActual?.origen || '',
            habilitadoActual: rutaActual?.habilitado !== false,
            estadoRuta: rutaActual?.estado || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idRuta, habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(idRuta)
            showToast(`Ruta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar habilitado', 'error')
            throw err
        }
    }

    const handleRegistrarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        showToast('Ruta registrada correctamente', 'success')
    }

    const handleActualizarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        showToast('Ruta actualizada correctamente', 'success')
    }

    const emptyMessage = filtroHabilitado !== 'todo' || filtroEstadoRuta !== '' || filtroAnio !== '' || filtroMes !== ''
        ? 'No se encontraron rutas que coincidan con los filtros aplicados.'
        : debouncedSearch.trim()
            ? 'No se encontraron rutas que coincidan con la búsqueda.'
            : 'No hay rutas programadas en el sistema.'

    const columns = [
        { key: 'origen', label: 'Origen', sortField: 'origen', cellSx: { py: 1.5, fontSize: '0.85rem' }, render: (ruta) => ruta.origen || '—' },
        { key: 'destino', label: 'Destino', cellSx: { py: 1.5, fontSize: '0.85rem' }, render: (ruta) => resolveDestino(ruta) },
        {
            key: 'fechaHora', label: 'Fecha y hora salida', cellSx: { py: 1.5 },
            render: (ruta) => (
                <>
                    <Typography sx={{ fontSize: '0.875rem' }}>{formatFecha(ruta.fechaSalida)}</Typography>
                    {ruta.horaSalida && (
                        <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{formatHora12(ruta.horaSalida)}</Typography>
                    )}
                </>
            ),
        },
        {
            key: 'vehiculo', label: 'Vehículo', cellSx: { py: 1.5 },
            render: (ruta) => {
                const pares = resolvePares(ruta)
                const adicionales = Math.max(0, pares.length - 1)
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <PlacaDisplay placa={pares[0]?.placa} theme={theme} />
                            {adicionales > 0 && (
                                <Chip
                                    label={`+${adicionales} ${adicionales === 1 ? 'vehículo' : 'vehículos'}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            )}
                        </Box>
                        {pares.some(p => p.vehiculoInhabilitado) && ruta.estado === 'Programada' && (
                            <Chip
                                label="Reasignar vehículo"
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`, width: 'fit-content', '& .MuiChip-label': { px: 0.8 } }}
                            />
                        )}
                        {pares.some(p => p.documentoVencido) && ['Programada', 'En Ruta'].includes(ruta.estado) && (
                            <Tooltip title={[...new Set(pares.filter(p => p.documentoVencido).map(p => `${p.placa || 'Vehículo'}: ${p.documentoVencido} vencido`))].join(' · ')}>
                                <Chip
                                    label={`${pares.find(p => p.documentoVencido)?.documentoVencido} vencido`}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.dark, border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`, width: 'fit-content', '& .MuiChip-label': { px: 0.8 } }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                )
            },
        },
        {
            key: 'conductor', label: 'Conductor', cellSx: { py: 1.5 },
            render: (ruta) => {
                const pares = resolvePares(ruta)
                const adicionales = Math.max(0, pares.length - 1)
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '0.875rem' }}>{pares[0]?.conductorNombre || 'N/A'}</Typography>
                            {adicionales > 0 && (
                                <Chip
                                    label={`+${adicionales} ${adicionales === 1 ? 'conductor' : 'conductores'}`}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.65rem', borderRadius: '2px', height: 18 }}
                                />
                            )}
                        </Box>
                        {pares.some(p => p.conductorInhabilitado) && ruta.estado === 'Programada' && (
                            <Chip
                                label="Reasignar conductor"
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`, width: 'fit-content', '& .MuiChip-label': { px: 0.8 } }}
                            />
                        )}
                        {pares.some(p => p.licenciaVencida) && ['Programada', 'En Ruta'].includes(ruta.estado) && (
                            <Tooltip title={[...new Set(pares.filter(p => p.licenciaVencida).map(p => `${p.conductorNombre || 'Conductor'}: licencia vencida`))].join(' · ')}>
                                <Chip
                                    label="Licencia vencida"
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.dark, border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`, width: 'fit-content', '& .MuiChip-label': { px: 0.8 } }}
                                />
                            </Tooltip>
                        )}
                    </Box>
                )
            },
        },
        {
            key: 'estado', label: 'Estado', width: 150, cellSx: { py: 1.5, minWidth: 150 },
            render: (ruta) => {
                const id = getId(ruta)
                return ruta.estado === 'Completada' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                        {renderEstadoDot('Completada', getEstadoColor)}
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                    </Box>
                ) : ruta.estado === 'En Ruta' && (ruta.pendienteLegalizacion || ruta.paquetesPendientes) ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                                {renderEstadoDot('En Ruta', getEstadoColor)}
                                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Ruta').color }}>
                                    En Ruta
                                </Typography>
                            </Box>
                            <Box sx={{ width: '1px', height: 28, backgroundColor: theme.palette.divider, flexShrink: 0 }} />
                            <Box
                                onClick={() => handleEstadoChange(id, 'Cancelada')}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, cursor: 'pointer' }}
                            >
                                {renderEstadoDot('Cancelada', getEstadoColor)}
                                <Typography variant="body2" sx={{ fontSize: '0.72rem', fontWeight: 500, color: getEstadoColor('Cancelada').color }}>
                                    Cancelada
                                </Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, px: 0.5 }}>
                            {ruta.pendienteLegalizacion && ruta.paquetesPendientes
                                ? 'Legalización y paquetes pendientes'
                                : ruta.pendienteLegalizacion
                                    ? 'Legalización pendiente'
                                    : 'Paquetes pendientes de entrega'}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        onClick={(e) => setEstadoMenu({ anchor: e.currentTarget, id, estadoActual: ruta.estado || 'Programada' })}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                    >
                        {renderEstadoDot(ruta.estado || 'Programada', getEstadoColor)}
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor(ruta.estado).color }}>
                            {ruta.estado || 'Programada'}
                        </Typography>
                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                    </Box>
                )
            },
        },
        {
            key: 'acciones', label: 'Acciones', width: 130, cellSx: { py: 1.5 },
            render: (ruta) => {
                const id = getId(ruta)
                return (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                            <Tooltip title="Ver detalle">
                                <IconButton size="small" onClick={() => setRutaVer(ruta)}
                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                            ruta.habilitado === false ? (
                                <Tooltip title="Habilita el registro para poder editarlo">
                                    <span>
                                        <IconButton size="small" disabled>
                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            ) : !['Programada', 'Cancelada'].includes(ruta.estado) ? (
                                <Tooltip title="Solo se puede editar una ruta Programada o Cancelada">
                                    <span>
                                        <IconButton size="small" disabled>
                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Editar">
                                    <IconButton size="small" onClick={() => { setRutaEditar(ruta); setModalActualizarOpen(true) }}
                                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            )
                        )}
                        {tienePermiso(PERMISOS.INHABILITAR_RUTA) && (
                            <ToggleSwitch id={id} checked={ruta.habilitado !== false} onChange={() => handleToggleHabilitado(id)} />
                        )}
                    </Box>
                )
            },
        },
    ]

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Programación de Rutas
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las rutas programadas en el sistema.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                    {tienePermiso(PERMISOS.REGISTRAR_RUTA) && (
                        <Button
                            onClick={() => setModalRegistrarOpen(true)}
                            variant="contained"
                            startIcon={<AddOutlinedIcon sx={{ fontSize: 20 }} />}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                    boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}`,
                                },
                            }}
                        >
                            Nuevo
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FiltroEstadoTabs
                            value={filtroHabilitado}
                            onChange={(v) => { setFiltroHabilitado(v); setPage(1) }}
                            containerRef={filtroContainerRef}
                            btnRefs={filtroBtnRefs}
                            pillStyle={filtroPillStyle}
                        />

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                displayEmpty
                                value={filtroEstadoRuta}
                                onChange={e => { setFiltroEstadoRuta(e.target.value); setPage(1) }}
                                renderValue={v => v || 'Estado'}
                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                sx={{
                                    fontSize: '0.82rem', borderRadius: 4,
                                    color: filtroEstadoRuta ? theme.palette.text.primary : theme.palette.text.secondary,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                    '& .MuiTouchRipple-root': { display: 'none' },
                                }}
                                MenuProps={filterMenuProps}>
                                <MenuItem value="">Todos</MenuItem>
                                {ESTADOS_RUTA.map(e => (
                                    <MenuItem key={e} value={e}>
                                        {e}
                                        {filtroEstadoRuta === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroAnio}
                                onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                                displayEmpty
                                renderValue={v => v || 'Año'}
                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                sx={{
                                    fontSize: '0.82rem', borderRadius: 4,
                                    color: filtroAnio ? theme.palette.text.primary : theme.palette.text.secondary,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                    '& .MuiTouchRipple-root': { display: 'none' },
                                }}
                                MenuProps={filterMenuProps}>
                                <MenuItem value="">Año</MenuItem>
                                {aniosDisponibles.map(anio => (
                                    <MenuItem key={anio} value={String(anio)}>
                                        {anio}
                                        {filtroAnio === String(anio) && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Tooltip title={filtroAnio ? '' : 'Primero elige un año'}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={filtroMes}
                                    onChange={(e) => { setFiltroMes(e.target.value); setPage(1) }}
                                    displayEmpty
                                    disabled={!filtroAnio}
                                    renderValue={v => v ? (MESES.find(m => m.value === v)?.label || v) : (filtroAnio ? 'Todos' : 'Mes')}
                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                    sx={{
                                        fontSize: '0.82rem', borderRadius: 4,
                                        color: filtroMes ? theme.palette.text.primary : theme.palette.text.secondary,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                        '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                        '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                        '& .MuiTouchRipple-root': { display: 'none' },
                                    }}
                                    MenuProps={filterMenuProps}>
                                    <MenuItem value="">{filtroAnio ? 'Todos' : 'Mes'}</MenuItem>
                                    {MESES.map(m => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.label}
                                            {filtroMes === m.value && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Box>

                </Box>

                <BuscadorField
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setPage(1) }}
                    placeholder="Buscar rutas..."
                />
            </Box>

            <DataTable
                columns={columns}
                rows={rutasProgramadas}
                rowKey={getId}
                loading={loading}
                initialLoad={initialLoad}
                error={error}
                sortBy={sortBy}
                onSort={handleSort}
                highlightId={highlightId}
                highlightRef={highlightRef}
                rowSx={(ruta) => ({ opacity: ruta.habilitado !== false ? 1 : 0.55 })}
                emptyMessage={emptyMessage}
                loadingMessage="Cargando rutas..."
                errorMessage="No se pudieron cargar las rutas. Verifica la conexión con el servidor."
            />

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
            />

            {rutaVer && (
                <ModalConsultarRutaProgramacion ruta={rutaVer} onClose={() => setRutaVer(null)} />
            )}

            <RegistrarRutaProgramacion
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={handleRegistrarSuccess}
            />

            <ActualizarRutaProgramacion
                open={modalActualizarOpen}
                onClose={() => setModalActualizarOpen(false)}
                ruta={rutaEditar}
                onSuccess={handleActualizarSuccess}
            />

            <ModalConfirmarEstado
                open={confirmEstado.open}
                nuevoEstado={confirmEstado.nuevoEstado}
                info={confirmEstado.info}
                ruta={confirmEstado.ruta}
                pares={confirmEstado.pares}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                onConfirm={async () => {
                    const { id, nuevoEstado } = confirmEstado
                    await ejecutarCambioEstado(id, nuevoEstado)
                    setConfirmEstado(c => ({ ...c, open: false }))
                }}
                onExited={() => setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, pares: [] })}
            />

            <ModalInhabilitarRuta
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, idRuta: null, origen: '', habilitadoActual: null, estadoRuta: null })}
                onConfirm={onConfirmarInhabilitar}
            />

            <Dialog open={alertaBloqueo.open} onClose={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
                maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
                    <IconButton onClick={() => setAlertaBloqueo(a => ({ ...a, open: false }))}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: `${theme.palette.primary.main}22`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                                {alertaBloqueo.titulo}
                            </Typography>
                            {alertaBloqueo.tipo === 'ventas' ? (
                                <Box sx={{ width: '100%', mt: 0.5 }}>
                                    <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1.5, textAlign: 'center' }}>
                                        {alertaBloqueo.entidades.length === 1 ? 'Esta venta no tiene' : 'Estas ventas no tienen'} fecha estimada de entrega asignada. Asígnales una fecha antes de continuar.
                                    </Typography>
                                    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                        <TableContainer sx={{ maxHeight: 220 }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Guía</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {alertaBloqueo.entidades.map((e) => (
                                                        <TableRow key={e.id}
                                                            onClick={() => e.id && window.open(`/ventas/listar?highlight=${e.id}`, '_blank')}
                                                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{e.guia || `#${e.id}`}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>
                            ) : alertaBloqueo.entidades.map((e, i) => {
                                const dot = e.tipo === 'vehiculo' ? getVehiculoEstadoDot(e.estado) : getConductorEstadoDot(e.estado)
                                return (
                                    <Box key={i} sx={{ width: '100%', mt: i > 0 ? 1.5 : 0.5, textAlign: 'left' }}>
                                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1, textAlign: 'center' }}>
                                            {e.tipo === 'vehiculo' ? <>El vehículo <strong>{e.etiqueta}</strong> </> : <><strong>{e.etiqueta}</strong> </>}
                                            {e.mensaje}
                                            {e.rutaConflicto && (
                                                <>
                                                    {' '}
                                                    <Box component="span"
                                                        onClick={() => window.open(`/transporte/rutas?highlight=${e.rutaConflicto.idRuta}`, '_blank')}
                                                        sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', fontWeight: 600, '&:hover': { opacity: 0.75 } }}>
                                                        {e.rutaConflicto.label}
                                                    </Box>
                                                    {' '}
                                                </>
                                            )}
                                            {e.mensajeFin}
                                        </Typography>
                                        <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                            <Box
                                                onClick={() => e.id && window.open(`${e.tipo === 'vehiculo' ? '/vehiculos/listar' : '/transporte/conductores'}?highlight=${e.id}`, '_blank')}
                                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: e.id ? 'pointer' : 'default', '&:hover': e.id ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {e.tipo === 'vehiculo'
                                                        ? <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                        : <PersonOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                                    }
                                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{e.etiqueta}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
                    <Button onClick={() => setAlertaBloqueo(a => ({ ...a, open: false }))} variant="contained" disableRipple
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': { backgroundColor: theme.palette.primary.main, filter: 'brightness(0.88)' } }}>
                        Entendido
                    </Button>
                </Box>
            </Dialog>

            <Menu
                anchorEl={estadoMenu.anchor}
                open={Boolean(estadoMenu.anchor)}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
            >
                {ESTADOS_RUTA.filter(op => {
                    if (op === estadoMenu.estadoActual) return false
                    if (estadoMenu.estadoActual === 'Programada') return op === 'En Ruta'
                    if (estadoMenu.estadoActual === 'Cancelada') return op === 'Programada'
                    if (estadoMenu.estadoActual === 'En Ruta' && op === 'Programada') return false
                    return true
                }).map(op => (
                    <MenuItem key={op} onClick={() => {
                        setEstadoMenu(prev => ({ ...prev, anchor: null }))
                        handleEstadoChange(estadoMenu.id, op)
                    }} sx={{ fontSize: '0.82rem', gap: 1 }}>
                        {renderEstadoDot(op, getEstadoColor)}
                        {op}
                    </MenuItem>
                ))}
            </Menu>

        </Box>
    )
}

export default ListarRutaProgramacion
