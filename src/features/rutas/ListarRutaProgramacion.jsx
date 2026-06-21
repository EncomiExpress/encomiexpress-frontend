import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, CircularProgress, Pagination, TableSortLabel, Tabs, Tab
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import * as ventaService from '../../shared/services/ventaService'
import * as anticipoService from '../../shared/services/anticipoService'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
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

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'Programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'En Curso':   return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'Completada': return { bg: '#D1FAE5', color: '#065F46' }
        case 'Cancelada':  return { bg: '#FEE2E2', color: '#991B1B' }
        default:           return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

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
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const [searchTerm, setSearchTerm]         = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [rutaVer, setRutaVer]               = useState(null)
    const [snackbar, setSnackbar]             = useState({ open: false, message: '', severity: 'success' })
    const [modalBloqueo, setModalBloqueo]     = useState({ open: false, dependencias: [], mensaje: '' })
    const [confirmEstado, setConfirmEstado]   = useState({ open: false, id: null, nuevoEstado: null, info: '' })
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
    const [tabRutaIndex, setTabRutaIndex] = useState(0)
    const [tabRutaEncomiendas, setTabRutaEncomiendas] = useState({ data: [], loading: false })
    const [tabRutaAnticipos, setTabRutaAnticipos] = useState({ data: [], loading: false })

    const [localLoading, setLocalLoading] = useState(false)
    const initialLoad = useRef(true)

    const { rutasProgramadas, total, fetchRutasProgramadas, updateEstado, toggleHabilitado, loading } = useRutaProgramacion()
    const effectiveLoading = loading || localLoading
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
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setLocalLoading(true) }, 300)
        return () => clearTimeout(t)
    }, [searchTerm])

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
        if (!loading) { setLocalLoading(false); initialLoad.current = false }
    }, [loading])

    useEffect(() => {
        if (!rutaVer || tabRutaIndex !== 1) return
        setTabRutaEncomiendas({ data: [], loading: true })
        ventaService.getEncomiendas(undefined, { idRuta: rutaVer.idRuta, limit: 100 })
            .then(res => setTabRutaEncomiendas({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutaEncomiendas({ data: [], loading: false }))
    }, [rutaVer, tabRutaIndex])

    useEffect(() => {
        if (!rutaVer || tabRutaIndex !== 2) return
        setTabRutaAnticipos({ data: [], loading: true })
        anticipoService.getAnticipos(undefined, { idRuta: rutaVer.idRuta, limit: 100 })
            .then(res => setTabRutaAnticipos({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutaAnticipos({ data: [], loading: false }))
    }, [rutaVer, tabRutaIndex])

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
    const paginatedRutas = rutasProgramadas
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

        if (rutaActual?.estado === 'Completada') {
            setSnackbar({ open: true, message: 'No se puede cambiar el estado de una ruta completada.', severity: 'warning' })
            return
        }

        const INFO_ESTADOS = {
            'En Curso': 'El vehículo quedará marcado como "Ocupado". Si ya está en otra ruta activa, el cambio será bloqueado.',
            'Completada': 'Una vez completada, el estado es irreversible y el vehículo quedará disponible.',
            'Cancelada': `Si la ruta está en curso, el vehículo quedará disponible nuevamente.`,
        }

        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info })
    }

    const handleToggleHabilitado = async (id) => {
        const rutaActual = rutasProgramadas.find(r => getId(r) === id)
        try {
            await toggleHabilitado(id)
            setSnackbar({
                open: true,
                message: `Ruta ${rutaActual?.habilitado ? 'inhabilitada' : 'habilitada'} correctamente.`,
                severity: 'success'
            })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({ open: true, message: err.message || 'Error al cambiar habilitado', severity: 'error' })
            }
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

                    {tienePermiso(PERMISOS.REGISTRAR_RUTA_PROGRAMACION) && (
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
                            Nueva ruta
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
                            {effectiveLoading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando rutas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : !effectiveLoading && rutasProgramadas.length === 0 ? (
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
                                paginatedRutas.map((ruta) => {
                                    const id = getId(ruta)
                                    return (
                                        <TableRow
                                            key={id}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: ruta.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                                {ruta.nombreRuta || '—'}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.fechaSalida || '—'}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.horaSalida || '—'}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={resolveVehiculo(ruta)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor: '#FEF2F2',
                                                        color: theme.palette.primary.main,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{resolveConductor(ruta)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{resolveDestino(ruta)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                                    <Select
                                                        value={ruta.estado || 'Programada'}
                                                        onChange={(e) => handleEstadoChange(id, e.target.value)}
                                                        IconComponent={KeyboardArrowDownOutlinedIcon}
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            py: 0.5,
                                                            color: ruta.estado === 'Programada' ? '#3730A3' :
                                                                   ruta.estado === 'En Curso'   ? '#1E40AF' :
                                                                   ruta.estado === 'Completada' ? '#065F46' : '#991B1B',
                                                            fontWeight: 600,
                                                        }}
                                                        MenuProps={filterMenuProps}
                                                    >
                                                        {ESTADOS_RUTA.map(estado => (
                                                            <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_RUTA_PROGRAMACION) && (
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
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA_PROGRAMACION) && (
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
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_RUTA_PROGRAMACION) && (
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
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
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Dialog Ver Detalle */}
            {rutaVer && (
                <Dialog open onClose={() => { setRutaVer(null); setTabRutaIndex(0) }} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, backgroundColor: theme.palette.background.subtle } } }}>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>
                                {rutaVer.nombreRuta?.[0] || 'R'}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                                    {rutaVer.nombreRuta || 'Ruta Programada'}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary}>{rutaVer.fechaSalida}</Typography>
                            </Box>
                        </Box>
                        <Tabs value={tabRutaIndex} onChange={(_, v) => setTabRutaIndex(v)} textColor="primary" indicatorColor="primary">
                            <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label="Encomiendas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                        </Tabs>
                    </Box>

                    {tabRutaIndex === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Vehículo y Conductor</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vehículo</Typography><Typography variant="body2" fontWeight={500}>{resolveVehiculo(rutaVer)}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Conductor</Typography><Typography variant="body2" fontWeight={500}>{resolveConductor(rutaVer)}</Typography></Box>
                                    </Box>
                                </Paper>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationOnOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Ruta y Horarios</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Destino</Typography><Typography variant="body2" fontWeight={500}>{resolveDestino(rutaVer)}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Fecha Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.fechaSalida}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Hora Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.horaSalida || '—'}</Typography></Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                            <Typography variant="body2" fontWeight={500}
                                                color={rutaVer.estado === 'Programada' ? '#3730A3' : rutaVer.estado === 'En Curso' ? '#1E40AF' : rutaVer.estado === 'Completada' ? '#065F46' : '#991B1B'}>
                                                {rutaVer.estado}
                                            </Typography>
                                        </Box>
                                        {rutaVer.observaciones && (
                                            <Box sx={{ gridColumn: '1 / -1' }}>
                                                <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Observaciones</Typography>
                                                <Typography variant="body2" fontWeight={500}>{rutaVer.observaciones}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}

                    {tabRutaIndex === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Encomiendas registradas en esta ruta</Typography>
                            {tabRutaEncomiendas.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabRutaEncomiendas.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin encomiendas registradas</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Guía</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Cliente</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabRutaEncomiendas.data.map(v => (
                                                <TableRow key={v.idEncomiendaVenta} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.numeroGuia || `#${v.idEncomiendaVenta}`}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>${Number(v.valorServicio || 0).toLocaleString('es-CO')}</TableCell>
                                                    <TableCell>
                                                        <Chip label={v.estado} size="small" sx={{
                                                            backgroundColor: v.estado === 'pendiente' ? '#FFF3E0' : v.estado === 'entregado' ? '#E8F5E9' : '#E3F2FD',
                                                            color: v.estado === 'pendiente' ? '#E65100' : v.estado === 'entregado' ? '#2E7D32' : '#1565C0',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    {tabRutaIndex === 2 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Anticipos asociados a esta ruta</Typography>
                            {tabRutaAnticipos.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabRutaAnticipos.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin anticipos registrados</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gastado</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabRutaAnticipos.data.map(a => (
                                                <TableRow key={a.idAnticipoExcedente} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.idAnticipoExcedente}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
                                                    <TableCell>
                                                        <Chip label={a.estado} size="small" sx={{
                                                            backgroundColor: a.estado === 'pendiente' ? '#FFF3E0' : a.estado === 'liquidado' ? '#E8F5E9' : '#E3F2FD',
                                                            color: a.estado === 'pendiente' ? '#E65100' : a.estado === 'liquidado' ? '#2E7D32' : '#1565C0',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                        <Button onClick={() => { setRutaVer(null); setTabRutaIndex(0) }} variant="contained" sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark },
                        }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
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

            <Dialog
                open={confirmEstado.open}
                onClose={() => setConfirmEstado(c => ({ ...c, open: false }))}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
                    Confirmar cambio de estado
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: confirmEstado.info ? 1.5 : 0 }}>
                        ¿Cambiar el estado a <strong>"{confirmEstado.nuevoEstado}"</strong>?
                    </Typography>
                    {confirmEstado.info && (
                        <Typography variant="body2" color="text.secondary">
                            {confirmEstado.info}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmEstado(c => ({ ...c, open: false }))}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            const { id, nuevoEstado } = confirmEstado
                            setConfirmEstado({ open: false, id: null, nuevoEstado: null, info: '' })
                            ejecutarCambioEstado(id, nuevoEstado)
                        }}
                        variant="contained"
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="ruta"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

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

