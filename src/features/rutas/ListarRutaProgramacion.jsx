import theme from '../../shared/styles/theme.js'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useTransporte } from '../../shared/contexts/TransporteContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'

const COLORS = theme.palette

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const ESTADOS_RUTA = ['Programada', 'En Curso', 'Completada', 'Cancelada']

const filterMenuProps = {
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    '&:hover': { backgroundColor: '#FFF5F5' },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                },
            },
        },
    },
}

const FILTROS_HABILITADO = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'Programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'En Curso': return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'Completada': return { bg: '#D1FAE5', color: '#065F46' }
        case 'Cancelada': return { bg: '#FEE2E2', color: '#991B1B' }
        default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

const ListarRutaProgramacion = () => {
    const navigate = useNavigate()
    const { tienePermiso, PERMISOS } = useAuth()
    const [rutasProgramadas, setRutasProgramadas] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [rutaVer, setRutaVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoRuta, setFiltroEstadoRuta] = useState('todo')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar] = useState(null)

    const { getRutasProgramadas, updateEstado, toggleHabilitado } = useRutaProgramacion()
    const { getTransportes } = useTransporte()
    const { getConductores } = useConductor()
    const { getDestinos } = useDestino()
    const { usuario } = useAuth()

    const ahora = new Date()
    const anioActual = ahora.getFullYear()

    const MESES = [
      { value: '1', label: 'Enero' },
      { value: '2', label: 'Febrero' },
      { value: '3', label: 'Marzo' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Mayo' },
      { value: '6', label: 'Junio' },
      { value: '7', label: 'Julio' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Septiembre' },
      { value: '10', label: 'Octubre' },
      { value: '11', label: 'Noviembre' },
      { value: '12', label: 'Diciembre' },
    ]

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setRutasProgramadas(getRutasProgramadas())
        }
    }, [usuario, navigate, getRutasProgramadas])

    // Obtener IDs de vehículos que están en rutas en curso
    const vehiculosOcupadosIds = useMemo(() => {
        return new Set(
            rutasProgramadas
                .filter(r => r.estado === 'En Curso' && r.habilitado !== false)
                .map(r => r.idVehiculo)
        )
    }, [rutasProgramadas])

    // Generar años únicos desde las rutas
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

    // Auto-seleccionar el año actual si no hay filtro
    useEffect(() => {
        if (!filtroAnio && aniosDisponibles.length > 0) {
            setFiltroAnio(String(anioActual))
        }
    }, [aniosDisponibles])

    const mesMasActual = useMemo(() => {
        if (!filtroAnio) return ''
        const meses = rutasProgramadas
            .filter(r => r.fechaSalida && r.fechaSalida.startsWith(filtroAnio))
            .map(r => {
                const parts = r.fechaSalida.split('-')
                return parts[1]
            })
        if (meses.length === 0) return ''
        const maxMes = Math.max(...meses.map(m => parseInt(m)))
        return String(maxMes)
    }, [rutasProgramadas, filtroAnio])

    useEffect(() => {
        if (filtroAnio && mesMasActual && !filtroMes) {
            setFiltroMes(mesMasActual)
        }
    }, [filtroAnio, mesMasActual])

    const filteredRutas = rutasProgramadas.filter(r => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            (r.nombreRuta || '').toLowerCase().includes(q) ||
            (r.fechaSalida || '').includes(q) ||
            getVehiculoPlaca(r.idVehiculo).toLowerCase().includes(q) ||
            getConductorNombre(r.idConductor).toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && r.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && r.habilitado === false)

        const coincideEstado = filtroEstadoRuta === 'todo' || r.estado === filtroEstadoRuta

        let coincideFecha = true
        if (filtroAnio || filtroMes) {
            if (!r.fechaSalida) {
                coincideFecha = false
            } else {
                const [anioR, mesR] = r.fechaSalida.split('-')
                if (filtroAnio && anioR !== filtroAnio) coincideFecha = false
                if (filtroMes && mesR !== filtroMes) coincideFecha = false
            }
        }

        return coincideBusqueda && coincideHabilitado && coincideEstado && coincideFecha
    })

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroHabilitado('todo')
        setFiltroEstadoRuta('todo')
        setFiltroAnio('')
        setFiltroMes('')
        setPage(1)
    }

    const limpiarBusqueda = () => {
        setSearchTerm('')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoRuta !== 'todo' || filtroAnio || filtroMes

    const handleEstadoChange = (id, nuevoEstado) => {
        const rutaActual = rutasProgramadas.find(r => r.idRutaProgramada === id)

        if (rutaActual && rutaActual.estado === 'Completada') {
            setSnackbar({
                open: true,
                message: 'No se puede cambiar el estado de una ruta completada.',
                severity: 'warning',
            })
            return
        }

        if (nuevoEstado === 'En Curso' && rutaActual && vehiculosOcupadosIds.has(rutaActual.idVehiculo)) {
            setSnackbar({
                open: true,
                message: `No se puede cambiar a "En Curso": el vehículo ya está asignado a otra ruta en curso.`,
                severity: 'error',
            })
            return
        }

        updateEstado(id, nuevoEstado)
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
            severity: 'success',
        })
    }

    const handleToggleHabilitado = (id) => {
        toggleHabilitado(id)
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({
            open: true,
            message: `Ruta ${toggleHabilitado ? 'habilitada' : 'inhabilitada'} correctamente.`,
            severity: 'success',
        })
    }

    const getVehiculoPlaca = (id) => {
        const vehiculos = getTransportes()
        const vehiculo = vehiculos.find(v => v.idVehiculo === id)
        return vehiculo ? vehiculo.placa : 'N/A'
    }

    const getConductorNombre = (id) => {
        const conductores = getConductores()
        const conductor = conductores.find(c => c.idConductor === id)
        return conductor ? `${conductor.nombre} ${conductor.apellido}` : 'N/A'
    }

    const getDestinoNombre = (id) => {
        const destinos = getDestinos()
        const destino = destinos.find(d => d.idDestino === id)
        return destino ? destino.nombre : 'N/A'
    }

    const handleRegistrarSuccess = () => {
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({ open: true, message: 'Ruta registrada correctamente', severity: 'success' })
    }

    const handleActualizarSuccess = () => {
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({ open: true, message: 'Ruta actualizada correctamente', severity: 'success' })
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Programación de Rutas
                        </Typography>
                        <Chip
                            label={`${rutasProgramadas.length} registrada${rutasProgramadas.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#F3F4F6',
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                                fontSize: '0.72rem',
                                height: 22,
                                borderRadius: 10,
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las rutas programadas en el sistema.
                    </Typography>
                 </Box>
                 {tienePermiso(PERMISOS.REGISTRAR_RUTA_PROGRAMACION) && (
                     <Button
                         onClick={() => setModalRegistrarOpen(true)}
                         variant="contained"
                         startIcon={<AddOutlinedIcon />}
                         sx={{
                             backgroundColor: theme.palette.primary.main,
                             borderRadius: 2,
                             textTransform: 'none',
                             fontWeight: 600,
                             boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                             '&:hover': {
                                 backgroundColor: theme.palette.primary.dark,
                                 boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                             },
                         }}
                     >
                         Nueva ruta
                     </Button>
                 )}
             </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Buscar rutas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main, borderWidth: '1px',
                            },
                        },
                    }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={limpiarBusqueda}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filtroAnio}
                        onChange={(e) => { setFiltroAnio(e.target.value); setPage(1) }}
                        displayEmpty
                        sx={{ borderRadius: 2 }}
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
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="">Mes</MenuItem>
                        {MESES.map(m => (
                            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {hayFiltrosActivos && (
                    <Chip
                        label="Limpiar"
                        size="small"
                        icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                    />
                )}
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>Fecha</TableCell>
                                <TableCell sx={thStyle}>Hora Salida</TableCell>
                                <TableCell sx={thStyle}>Vehículo</TableCell>
                                <TableCell sx={thStyle}>Conductor</TableCell>
                                <TableCell sx={thStyle}>Destino</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRutas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {rutasProgramadas.length === 0
                                                ? 'No hay rutas programadas en el sistema.'
                                                : 'No se encontraron rutas que coincidan con la búsqueda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRutas.map((ruta) => {
                                    const estadoStyles = getEstadoColor(ruta.estado)
                                    return (
                                        <TableRow
                                            key={ruta.idRutaProgramada}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: ruta.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                                {ruta.nombreRuta}
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.fechaSalida}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{ruta.horaSalida || '-'}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={getVehiculoPlaca(ruta.idVehiculo)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor: '#FEF2F2',
                                                        color: theme.palette.primary.main,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{getConductorNombre(ruta.idConductor)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{getDestinoNombre(ruta.idDestino)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                                    <Select
                                                        value={ruta.estado}
                                                        onChange={(e) => handleEstadoChange(ruta.idRutaProgramada, e.target.value)}
                                                        IconComponent={KeyboardArrowDownOutlinedIcon}
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            py: 0.5,
                                                            color: ruta.estado === 'Programada' ? '#3730A3' :
                                                                   ruta.estado === 'En Curso' ? '#1E40AF' :
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
                                                                onClick={() => {
                                                                    setRutaEditar(ruta)
                                                                    setModalActualizarOpen(true)
                                                                }}
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
                                                                onClick={() => handleToggleHabilitado(ruta.idRutaProgramada)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                {ruta.habilitado !== false ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status.disabled2.color }} />}
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
                    Total de rutas: {filteredRutas.length}
                </Typography>
            </Box>

            {rutaVer && (
                <Dialog open onClose={() => setRutaVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <RouteIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles de la Ruta</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                            Información de la ruta programada
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {rutaVer.nombreRuta?.[0] || 'R'}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {rutaVer.nombreRuta || 'Ruta Programada'}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    {rutaVer.fechaSalida}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Vehículo y Conductor</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos del vehículo y conductor asignados
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vehículo</Typography><Typography variant="body2" fontWeight={500}>{getVehiculoPlaca(rutaVer.idVehiculo)}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Conductor</Typography><Typography variant="body2" fontWeight={500}>{getConductorNombre(rutaVer.idConductor)}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Ruta y Horarios</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Destino y programación de la ruta
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Destino</Typography><Typography variant="body2" fontWeight={500}>{getDestinoNombre(rutaVer.idDestino)}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Fecha Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.fechaSalida}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Hora Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.horaSalida || '—'}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={rutaVer.estado === 'Programada' ? '#3730A3' : rutaVer.estado === 'En Curso' ? '#1E40AF' : rutaVer.estado === 'Completada' ? '#065F46' : '#991B1B'}>{rutaVer.estado}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setRutaVer(null)} variant="contained" sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ 
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontSize: '0.85rem',
                    }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarRutaProgramacion