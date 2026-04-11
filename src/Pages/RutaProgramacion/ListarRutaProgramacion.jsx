import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: '#1a0e0c',
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const ESTADOS = ['Programada', 'En Curso', 'Completada', 'Cancelada']

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
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: '#1a0e0c' },
                    '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                },
            },
        },
    },
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'Programada', label: 'Programada' },
    { value: 'En Curso', label: 'En Curso' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Cancelada', label: 'Cancelada' },
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
    const [rutasProgramadas, setRutasProgramadas] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [rutaVer, setRutaVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rutaEditar, setRutaEditar] = useState(null)
    
    const { getRutasProgramadas, updateEstado } = useRutaProgramacion()
    const { getTransportes } = useTransporte()
    const { getConductores } = useConductor()
    const { getDestinos } = useDestino()
    const { usuario } = useAuth()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setRutasProgramadas(getRutasProgramadas())
        }
    }, [usuario, navigate, getRutasProgramadas])

    const handleEstadoChange = (id, nuevoEstado) => {
        updateEstado(id, nuevoEstado)
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
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

    const filteredRutas = rutasProgramadas.filter(r => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            r.nombreRuta.toLowerCase().includes(q) ||
            r.fechaSalida.includes(q) ||
            getVehiculoPlaca(r.idVehiculo).toLowerCase().includes(q) ||
            getConductorNombre(r.idConductor).toLowerCase().includes(q)

        const coincideEstado =
            filtroEstado === 'todo' ||
            r.estado === filtroEstado

        return coincideBusqueda && coincideEstado
    })

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroEstado('todo')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroEstado !== 'todo'

    const handleActualizarSuccess = () => {
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({
            open: true,
            message: 'Ruta actualizada correctamente.',
            severity: 'success',
        })
    }

    const handleRegistrarSuccess = () => {
        setRutasProgramadas(getRutasProgramadas())
        setSnackbar({
            open: true,
            message: 'Ruta programada correctamente.',
            severity: 'success',
        })
    }

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Programación de Rutas
                        </Typography>
                        <Chip
                            label={`${rutasProgramadas.length} registrada${rutasProgramadas.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#F3F4F6',
                                color: COLORS.textMuted,
                                fontWeight: 500,
                                fontSize: '0.72rem',
                                height: 22,
                                borderRadius: 10,
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona las rutas programadas en el sistema.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setModalRegistrarOpen(true)}
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                        '&:hover': {
                            backgroundColor: '#b91c1c',
                            boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                        },
                    }}
                >
                    Nueva ruta
                </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            </Box>

            {/* ── Filtros de estado ── */}
            <Box sx={{
                display: 'inline-flex',
                backgroundColor: '#FFECEC',
                borderRadius: 4,
                p: '4px',
                mb: 2.5,
                gap: '5px',
            }}>
                {FILTROS.map(f => (
                    <Button
                        key={f.value}
                        onClick={() => { setFiltroEstado(f.value); setPage(1) }}
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
                            fontWeight: filtroEstado === f.value ? 600 : 400,
                            backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                            color: filtroEstado === f.value ? COLORS.text : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? COLORS.text : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Buscar rutas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#CC1818', borderWidth: '1px',
                            },
                        },
                    }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 20 }} />
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

                {hayFiltrosActivos && (
                    <Chip
                        label="Limpiar"
                        size="small"
                        icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                    />
                )}
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
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
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRutas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
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
                                                '&:hover': { backgroundColor: COLORS.hoverBg },
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
                                                        color: '#CC1818',
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{getConductorNombre(ruta.idConductor)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>{getDestinoNombre(ruta.idDestino)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
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
                                                        {ESTADOS.map(estado => (
                                                            <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setRutaVer(ruta)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setRutaEditar(ruta)
                                                                setModalActualizarOpen(true)
                                                            }}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
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
                <Typography variant="body2" color={COLORS.textMuted}>
                    Total de rutas: {filteredRutas.length}
                </Typography>
            </Box>

            {rutaVer && (
                <Dialog open onClose={() => setRutaVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <RouteIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Detalles de la Ruta</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>
                            Información de la ruta programada
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {rutaVer.nombreRuta?.[0] || 'R'}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={COLORS.text}>
                                    {rutaVer.nombreRuta || 'Ruta Programada'}
                                </Typography>
                                <Typography variant="body2" color={COLORS.textMuted} mt={0.4}>
                                    {rutaVer.fechaSalida}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Vehículo y Conductor</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                                Datos del vehículo y conductor asignados
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Vehículo</Typography><Typography variant="body2" fontWeight={500}>{getVehiculoPlaca(rutaVer.idVehiculo)}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Conductor</Typography><Typography variant="body2" fontWeight={500}>{getConductorNombre(rutaVer.idConductor)}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Ruta y Horarios</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                                Destino y programación de la ruta
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Destino</Typography><Typography variant="body2" fontWeight={500}>{getDestinoNombre(rutaVer.idDestino)}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Fecha Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.fechaSalida}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Hora Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer.horaSalida || '—'}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={rutaVer.estado === 'Programada' ? '#3730A3' : rutaVer.estado === 'En Curso' ? '#1E40AF' : rutaVer.estado === 'Completada' ? '#065F46' : '#991B1B'}>{rutaVer.estado}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setRutaVer(null)} variant="contained" sx={{
                            backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
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