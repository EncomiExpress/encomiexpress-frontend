import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl, Menu,
    Snackbar, Alert, Tooltip, Button,
    Avatar, CircularProgress, Pagination, TableSortLabel,
    Dialog, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'
import ModalConsultarRutaProgramacion from './ModalConsultarRutaProgramacion'
import ModalConfirmarEstado from './ModalConfirmarEstado'
import ModalInhabilitarRuta from './ModalInhabilitarRuta'
import { getPageOfRuta } from '../../shared/services/rutaService'
import { getEstadoColorRuta as getEstadoColor, getVehiculoEstadoDot, getConductorEstadoDot } from '../../shared/utils/estadoColors.js'

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

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const ESTADOS_RUTA = ['Programada', 'En Curso', 'Completada', 'Cancelada']

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    '&:hover': { backgroundColor: theme.palette.primary.light },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
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
    const thStyle = getThStyle(theme)
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
    const [snackbar, setSnackbar]             = useState({ open: false, message: '', severity: 'success' })
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, idRuta: null, nombreRuta: '', habilitadoActual: null, estadoRuta: null })
    const [confirmEstado, setConfirmEstado]   = useState({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, vehiculo: null, conductor: null, confirmed: false })
    const [alertaBloqueo, setAlertaBloqueo]   = useState({ open: false, titulo: '', entidades: [] })
    const [estadoMenu, setEstadoMenu]         = useState({ anchor: null, id: null, estadoActual: null })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('todo')
    const [filtroAnio, setFiltroAnio]         = useState('')
    const [filtroMes, setFiltroMes]           = useState('')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar]         = useState(null)
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [sortBy, setSortBy] = useState({ field: 'fechaSalida', dir: 'desc' })
    const initialLoad = useRef(true)

    const { rutasProgramadas, total, fetchRutasProgramadas, updateEstado, toggleHabilitado, loading, error } = useRutaProgramacion()
    const { getVehiculos } = useVehiculo()
    const { getConductores } = useConductor()
    const { destinos } = useDestino()

    const ahora      = new Date()
    const anioActual = ahora.getFullYear()

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
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        estado: filtroEstadoRuta === 'todo' ? undefined : filtroEstadoRuta,
        anio: filtroAnio || undefined,
        mes: filtroMes || undefined,
        q: debouncedSearch.trim() || undefined,
    })

    useEffect(() => {
        if (!usuario) return
        fetchRutasProgramadas(buildRutasParams())
    }, [fetchRutasProgramadas, page, rowsPerPage, debouncedSearch, filtroHabilitado, filtroEstadoRuta, filtroAnio, filtroMes, sortBy, usuario])

    useEffect(() => {
        if (!loading) { initialLoad.current = false }
    }, [loading])

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    // Años disponibles desde fechaSalida
    const aniosDisponibles = useMemo(() => {
        const anios = new Set()
        rutasProgramadas.forEach(r => {
            if (r.fechaSalida) {
                const [anio] = r.fechaSalida.split('-')
                if (anio) anios.add(anio)
            }
        })
        return Array.from(anios).sort((a, b) => b - a)
    }, [rutasProgramadas])

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
  const d = destinos.find(d => d.idDestino === id);
  return d ? (d.nombre || `${d.departamento} - ${d.ciudad}`) : 'N/A';
};

    // Si la API devuelve los datos relacionados embebidos, los usamos directamente
    const resolveVehiculo = (ruta) =>
        ruta.vehiculo?.placa ?? getVehiculoPlaca(ruta.idVehiculo)

    const resolveConductor = (ruta) => {
        if (ruta.conductor?.usuario) {
            return `${ruta.conductor.usuario.nombre} ${ruta.conductor.usuario.apellido}`
        }
        return getConductorNombre(ruta.idConductor)
    }

const resolveDestino = (ruta) =>
  ruta.destino
    ? `${ruta.destino.departamento} - ${ruta.destino.ciudad}`
    : getDestinoNombre(ruta.idDestino);

    const getId = (ruta) => ruta.idRuta ?? ruta.idRutaProgramada

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroHabilitado('todo')
        setFiltroEstadoRuta('todo')
        setFiltroAnio('')
        setFiltroMes('')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoRuta !== 'todo' || filtroAnio || filtroMes

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const ejecutarCambioEstado = async (id, nuevoEstado) => {
        try {
            await updateEstado(id, nuevoEstado)
            setSnackbar({ open: true, message: `Estado actualizado a "${nuevoEstado}".`, severity: 'success' })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({ open: true, message: err.message || 'Error al actualizar estado', severity: 'error' })
            }
        }
    }

    const handleEstadoChange = (id, nuevoEstado) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        const vehiculo = getVehiculos().find(v => v.idVehiculo === rutaActual?.idVehiculo)
        const conductor = getConductores().find(c => c.idConductor === rutaActual?.idConductor)

        if (nuevoEstado === 'En Curso') {
            const otraRutaVehiculo = rutasProgramadas.find(r =>
                getId(r) !== id &&
                r.idVehiculo === rutaActual?.idVehiculo &&
                r.estado === 'En Curso' &&
                r.habilitado !== false
            )
            const otraRutaConductor = rutasProgramadas.find(r =>
                getId(r) !== id &&
                r.idConductor === rutaActual?.idConductor &&
                r.estado === 'En Curso' &&
                r.habilitado !== false
            )

            const entidades = []
            let vehiculoBlocked = false
            let conductorBlocked = false

            if (vehiculo?.estado === 'Mantenimiento') {
                vehiculoBlocked = true
                entidades.push({ tipo: 'vehiculo', etiqueta: vehiculo.placa || '', estado: vehiculo.estado, id: vehiculo.idVehiculo, mensaje: 'está en Mantenimiento y no puede asignarse a una ruta En Curso.' })
            } else if (otraRutaVehiculo) {
                vehiculoBlocked = true
                entidades.push({ tipo: 'vehiculo', etiqueta: vehiculo?.placa || '', estado: vehiculo?.estado, id: vehiculo?.idVehiculo, mensaje: 'ya está asignado a otra ruta activa.' })
            }

            if (otraRutaConductor) {
                conductorBlocked = true
                const nombre = conductor?.nombre ? `${conductor.nombre} ${conductor.apellido || ''}`.trim() : 'Conductor'
                entidades.push({ tipo: 'conductor', etiqueta: nombre, estado: conductor?.estado || 'en_ruta', id: conductor?.idConductor, mensaje: 'ya está asignado a otra ruta activa.' })
            }

            if (entidades.length > 0) {
                setAlertaBloqueo({
                    open: true,
                    titulo: vehiculoBlocked && conductorBlocked
                        ? 'Vehículo y conductor no disponibles'
                        : vehiculoBlocked ? 'Vehículo no disponible'
                        : 'Conductor no disponible',
                    entidades,
                })
                return
            }
        }

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta ruta. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': 'El vehículo y el conductor quedarán disponibles y las ventas asociadas pasarán a "Entregada".',
            'Cancelada': 'El vehículo y el conductor quedarán disponibles, el anticipo pasará a "Excedente pendiente" y las ventas asociadas pasarán a "Cancelada".',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, ruta: rutaActual, vehiculo, conductor, confirmed: false })
    }

    const handleToggleHabilitado = (id) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        setConfirmInhabilitar({
            open: true,
            idRuta: id,
            nombreRuta: rutaActual?.nombreRuta || '',
            habilitadoActual: rutaActual?.habilitado !== false,
            estadoRuta: rutaActual?.estado || null,
        })
    }

    const onConfirmarInhabilitar = async () => {
        const { idRuta, habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(idRuta)
            setSnackbar({
                open: true,
                message: `Ruta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`,
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Error al cambiar habilitado', severity: 'error' })
            throw err
        }
    }

    const handleRegistrarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        setSnackbar({ open: true, message: 'Ruta registrada correctamente', severity: 'success' })
    }

    const handleActualizarSuccess = () => {
        fetchRutasProgramadas(buildRutasParams())
        setSnackbar({ open: true, message: 'Ruta actualizada correctamente', severity: 'success' })
    }

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
                        variant="contained"
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
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
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Exportar
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
                    <Box sx={{
                        display: 'inline-flex',
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: 4,
                        p: '4px',
                        gap: '5px',
                    }}>
                        {FILTROS.map(f => (
                            <Button
                                key={f.value}
                                onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
                                size="small"
                                disableElevation
                                disableRipple
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.5,
                                    minWidth: 0,
                                    fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                    backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                    color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                    boxShadow: filtroHabilitado === f.value
                                        ? '0 1px 4px rgba(0,0,0,0.12)'
                                        : 'none',
                                    border: 'none',
                                    '&:hover': {
                                        backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                        color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.medium,
                                        border: 'none',
                                    },
                                }}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroAnio}
                                onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                                displayEmpty
                                sx={{ borderRadius: 4 }}
                            >
                                <MenuItem value="">Año</MenuItem>
                                {aniosDisponibles.map(anio => (
                                    <MenuItem key={anio} value={anio}>{anio}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroMes}
                                onChange={(e) => { setFiltroMes(e.target.value); setPage(1) }}
                                displayEmpty
                                disabled={!filtroAnio}
                                sx={{ borderRadius: 4 }}
                            >
                                <MenuItem value="">Mes</MenuItem>
                                {MESES.map(m => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                </Box>

                <TextField
                    size="small"
                    placeholder="Buscar rutas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main, borderWidth: '1px',
                            },
                        },
                    }}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'fechaSalida'}
                                        direction={sortBy.field === 'fechaSalida' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('fechaSalida')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Fecha
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Hora Salida</TableCell>
                                <TableCell sx={thStyle}>Vehículo</TableCell>
                                <TableCell sx={thStyle}>Conductor</TableCell>
                                <TableCell sx={thStyle}>Destino</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando rutas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar las rutas. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && rutasProgramadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroEstadoRuta !== 'todo' || filtroAnio !== '' || filtroMes !== ''
                                                ? 'No se encontraron rutas que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron rutas que coincidan con la búsqueda.'
                                                    : 'No hay rutas programadas en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rutasProgramadas.map((ruta) => {
                                    const id = getId(ruta)
                                    const isHighlighted = highlightId && String(id) === String(highlightId)
                                    return (
                                        <TableRow
                                            key={id}
                                            ref={isHighlighted ? highlightRef : null}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: ruta.habilitado !== false ? 1 : 0.55,
                                                ...(isHighlighted && {
                                                    animation: 'highlightPulse 1.1s ease-in-out 4',
                                                    '@keyframes highlightPulse': {
                                                        '0%, 100%': { backgroundColor: 'transparent' },
                                                        '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                    },
                                                }),
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                                {ruta.nombreRuta || '—'}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.fechaSalida || '—'}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.horaSalida || '—'}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                                    <Chip
                                                        label={resolveVehiculo(ruta)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            backgroundColor: '#FEF2F2',
                                                            color: theme.palette.primary.main,
                                                            fontSize: '0.75rem',
                                                            width: 'fit-content',
                                                        }}
                                                    />
                                                    {getVehiculos().find(v => v.idVehiculo === ruta.idVehiculo)?.habilitado === false && ruta.estado === 'Programada' && (
                                                        <Chip
                                                            label="Reasignar vehículo"
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 600,
                                                                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                                                color: theme.palette.warning.dark,
                                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                                                                width: 'fit-content',
                                                                '& .MuiChip-label': { px: 0.8 },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                                    <Typography sx={{ fontSize: '0.875rem' }}>{resolveConductor(ruta)}</Typography>
                                                    {getConductores().find(c => c.idConductor === ruta.idConductor)?.habilitado === false && ruta.estado === 'Programada' && (
                                                        <Chip
                                                            label="Reasignar conductor"
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 600,
                                                                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                                                color: theme.palette.warning.dark,
                                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                                                                width: 'fit-content',
                                                                '& .MuiChip-label': { px: 0.8 },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{resolveDestino(ruta)}</TableCell>
                                            <TableCell sx={{ py: 1.5, minWidth: 150 }}>
                                                {ruta.estado === 'Completada' ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                                                        {renderEstadoDot('Completada', getEstadoColor)}
                                                        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Completada</Typography>
                                                    </Box>
                                                ) : ruta.estado === 'En Curso' && ruta.pendienteLegalizacion ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, overflow: 'hidden' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, flex: 1 }}>
                                                                {renderEstadoDot('En Curso', getEstadoColor)}
                                                                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: getEstadoColor('En Curso').color }}>
                                                                    En Curso
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
                                                            Legalización pendiente
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
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_RUTA) && (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setRutaVer(ruta)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => { setRutaEditar(ruta); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA) && (
                                                        <Tooltip title={ruta.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleHabilitado(id)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                {ruta.habilitado !== false
                                                                    ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color }} />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Mostrando {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                            Filas
                        </Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                            size="small"
                            renderValue={(value) => value}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem',
                                borderRadius: 2,
                                '& .MuiSelect-select': { py: 0.6, pl: 1.5, pr: '28px !important' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={{
                                slotProps: {
                                    paper: {
                                        sx: {
                                            borderRadius: 2,
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                            mt: 0.5,
                                            minWidth: 80,
                                            '& .MuiMenuItem-root': {
                                                fontSize: '0.82rem', py: 0.9, px: 2,
                                                display: 'flex', justifyContent: 'space-between', gap: 2,
                                                '&:hover': { backgroundColor: theme.palette.primary.light },
                                                '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                                                '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {[5, 10, 25].map(n => (
                                <MenuItem key={n} value={n}>{n}
                                    {rowsPerPage === n && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Pagination
                        count={totalPages}
                        page={safePage}
                        onChange={(_, val) => setPage(val)}
                        size="small"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '0.82rem',
                                borderRadius: '8px',
                                minWidth: 34,
                                height: 34,
                                mx: 0.2,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': { border: 'none' },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                borderColor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: theme.palette.primary.darker },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: theme.palette.background.subtle,
                                borderColor: theme.palette.divider,
                            },
                        }}
                    />
                </Box>
            </Box>

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
                vehiculo={confirmEstado.vehiculo}
                conductor={confirmEstado.conductor}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                onConfirm={() => setConfirmEstado(c => ({ ...c, open: false, confirmed: true }))}
                onExited={() => {
                    const { id, nuevoEstado, confirmed } = confirmEstado
                    setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, vehiculo: null, conductor: null, confirmed: false })
                    if (confirmed && id && nuevoEstado) ejecutarCambioEstado(id, nuevoEstado)
                }}
            />

            <ModalInhabilitarRuta
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, idRuta: null, nombreRuta: '', habilitadoActual: null, estadoRuta: null })}
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
                            {alertaBloqueo.entidades.map((e, i) => {
                                const dot = e.tipo === 'vehiculo' ? getVehiculoEstadoDot(e.estado) : getConductorEstadoDot(e.estado)
                                return (
                                    <Box key={i} sx={{ width: '100%', mt: i > 0 ? 1.5 : 0.5, textAlign: 'left' }}>
                                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ mb: 1, textAlign: 'center' }}>
                                            {e.tipo === 'vehiculo'
                                                ? <>El vehículo <strong>{e.etiqueta}</strong> {e.mensaje}</>
                                                : <><strong>{e.etiqueta}</strong> {e.mensaje}</>
                                            }
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
                    if (estadoMenu.estadoActual === 'Programada') return op === 'En Curso'
                    if (estadoMenu.estadoActual === 'Cancelada') return op === 'Programada'
                    if (estadoMenu.estadoActual === 'En Curso' && op === 'Programada') return false
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarRutaProgramacion

