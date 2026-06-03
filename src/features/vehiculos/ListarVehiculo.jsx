import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar,
    Pagination
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useTransporte } from '../../shared/contexts/TransporteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import RegistrarVehiculo from './RegistrarVehiculo'
import ActualizarVehiculo from './ActualizarVehiculo'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

const ESTADOS_VEHICULO = ['Activo', 'Inactivo', 'Mantenimiento', 'En Reparación']

const getFilterMenuProps = (theme) => ({
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
})

const FILTROS_HABILITADO = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const vehicleStatusLabel = (estado) => {
    switch (estado) {
        case 'Activo': return 'Activo'
        case 'Inactivo': return 'Inactivo'
        case 'Mantenimiento': return 'Mantenimiento'
        case 'En Reparación': return 'En Reparación'
        case 'ocupado': return 'Ocupado'
        default: return estado
    }
}

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const ListarTransporte = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const [searchTerm, setSearchTerm] = useState('')
    const [vehiculoVer, setVehiculoVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [vehiculoEditar, setVehiculoEditar] = useState(null)

    const { getTransportes, getTotal, updateEstado, toggleHabilitado, fetchVehiculos } = useTransporte()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const transportes = getTransportes()
    const totalBackend = getTotal()

    const vehiculosOcupadosIds = new Set(
        rutasProgramadas
            .filter(r => r.estado === 'En Curso' && r.habilitado !== false)
            .map(r => r.idVehiculo)
    )

    const transportesConEstado = transportes.map(t => {
        const estaOcupado = vehiculosOcupadosIds.has(t.idVehiculo)
        return {
            ...t,
            estadoEfectivo: estaOcupado ? 'ocupado' : t.estado,
        }
    })

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            fetchVehiculos(undefined, {
                page,
                limit: rowsPerPage,
                estado: filtroEstadoVehiculo === 'todo' ? undefined : filtroEstadoVehiculo,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                sortBy: 'idVehiculo.asc',
                q: searchTerm.trim() || undefined,
            })
            if (rutasProgramadas.length === 0) fetchRutasProgramadas()
        }
    }, [usuario, navigate, page, rowsPerPage, filtroEstadoVehiculo, filtroHabilitado, searchTerm, rutasProgramadas, fetchVehiculos, fetchRutasProgramadas])

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            setSnackbar({
                open: true,
                message: `Estado actualizado a ${vehicleStatusLabel(nuevoEstado)}.`,
                severity: 'success',
            })
        }
    }

    const handleToggleHabilitado = async (id, habilitadoActual) => {
        const success = await toggleHabilitado(id)
        if (success) {
            setSnackbar({
                open: true,
                message: `Vehículo ${habilitadoActual !== false ? 'inhabilitado' : 'habilitado'} correctamente.`,
                severity: 'success',
            })
        }
    }

    const filteredTransportes = transportesConEstado.filter(t => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            t.placa.toLowerCase().includes(q) ||
            (t.marca || '').toLowerCase().includes(q) ||
            (t.modelo || '').toLowerCase().includes(q) ||
            (t.tipo || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && t.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && t.habilitado === false)

        const coincideEstado = filtroEstadoVehiculo === 'todo' || t.estadoEfectivo === filtroEstadoVehiculo

        return coincideBusqueda && coincideHabilitado && coincideEstado
    })

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroHabilitado('todo')
        setFiltroEstadoVehiculo('todo')
        setPage(1)
    }

    const limpiarBusqueda = () => {
        setSearchTerm('')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoVehiculo !== 'todo'

    const totalPages = Math.max(1, Math.ceil(totalBackend / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = totalBackend === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, totalBackend)

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Vehículos
                        </Typography>
                        <Chip
                            label={`${totalBackend} registrado${totalBackend !== 1 ? 's' : ''}`}
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
                        Gestiona los vehículos registrados en el sistema.
                    </Typography>
                 </Box>
                 {tienePermiso(PERMISOS.REGISTRAR_VEHICULO) && (
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
                         Nuevo vehículo
                     </Button>
                 )}
             </Box>

            {/* ── Filtro slider: habilitado / inhabilitado ── */}
            <Box sx={{
                display: 'inline-flex',
                backgroundColor: '#FFECEC',
                borderRadius: 4,
                p: '4px',
                mb: 2.5,
                gap: '5px',
            }}>
                {FILTROS_HABILITADO.map(f => (
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
                            backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                            color: filtroHabilitado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* ── Buscador + filtro dropdown de estado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                        size="small"
                        placeholder="Buscar vehículos..."
                        sx={{
                            width: 280,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
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
                                        <IconButton size="small" onClick={limpiarBusqueda}>
                                            <ClearIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />

                    {/* Filtro dropdown de estado */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={filtroEstadoVehiculo}
                            onChange={e => { setFiltroEstadoVehiculo(e.target.value); setPage(1) }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            displayEmpty
                            sx={{
                                fontSize: '0.82rem',
                                borderRadius: 2,
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            <MenuItem value="todo" sx={{ fontSize: '0.82rem' }}>Todos los estados</MenuItem>
                            <MenuItem value="Activo" sx={{ fontSize: '0.82rem' }}>Activo</MenuItem>
                            <MenuItem value="Inactivo" sx={{ fontSize: '0.82rem' }}>Inactivo</MenuItem>
                            <MenuItem value="Mantenimiento" sx={{ fontSize: '0.82rem' }}>Mantenimiento</MenuItem>
                            <MenuItem value="En Reparación" sx={{ fontSize: '0.82rem' }}>En Reparación</MenuItem>
                            <MenuItem value="ocupado" sx={{ fontSize: '0.82rem' }}>Ocupado</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

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
                                <TableCell sx={thStyle}>Placa</TableCell>
                                <TableCell sx={thStyle}>Marca</TableCell>
                                <TableCell sx={thStyle}>Modelo</TableCell>
                                <TableCell sx={thStyle}>Color</TableCell>
                                <TableCell sx={thStyle}>Tipo</TableCell>
                                <TableCell sx={thStyle}>Capacidad</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={thStyle}>SOAT</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransportes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {transportes.length === 0
                                                ? 'No hay vehículos registrados en el sistema.'
                                                : 'No se encontraron vehículos que coincidan con la búsqueda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : transportes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {totalBackend === 0
                                                ? 'No hay vehículos registrados en el sistema.'
                                                : 'No se encontraron vehículos que coincidan con la búsqueda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transportes.map((transporte) => (
                                    <TableRow
                                        key={transporte.idVehiculo}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: transporte.habilitado !== false ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.placa}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    backgroundColor: '#FEF2F2',
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.marca}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.modelo}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.color}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.tipo}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.capacidad} kg</TableCell>
                                        <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                                            <FormControl size="small" fullWidth>
                                                <Select
                                                    value={transporte.estadoEfectivo === 'ocupado' ? 'ocupado' : transporte.estado}
                                                    onChange={(e) => {
                                                        if (e.target.value !== 'ocupado') {
                                                            handleEstadoChange(transporte.idVehiculo, e.target.value)
                                                        }
                                                    }}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    disabled={transporte.estadoEfectivo === 'ocupado'}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        color: transporte.estadoEfectivo === 'Activo' ? '#10b981' :
                                                               transporte.estadoEfectivo === 'Inactivo' ? '#9ca3af' :
                                                               transporte.estadoEfectivo === 'Mantenimiento' ? '#f59e0b' :
                                                               transporte.estadoEfectivo === 'En Reparación' ? '#ef4444' : '#3b82f6',
                                                        fontWeight: 600,
                                                    }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS_VEHICULO.map(estado => (
                                                        <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                                    ))}
                                                    <MenuItem value="ocupado" disabled>Ocupado</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.vencimientoSOAT ? new Date(transporte.vencimientoSOAT).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                color={isVencido(transporte.vencimientoSOAT) ? 'error' : 'success'}
                                                variant={isVencido(transporte.vencimientoSOAT) ? 'filled' : 'outlined'}
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_VEHICULO) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setVehiculoVer(transporte)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_VEHICULO) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setVehiculoEditar(transporte); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_VEHICULO) && (
                                                    <Tooltip title={transporte.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleToggleHabilitado(transporte.idVehiculo, transporte.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            {transporte.habilitado !== false ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status.disabled2.color }} />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
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
                    Mostrando {from}–{to} de {totalBackend} resultado{totalBackend !== 1 ? 's' : ''}
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
                                    borderColor: '#E57373',
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
                                },
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
                                                fontSize: '0.82rem',
                                                py: 0.9,
                                                px: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 2,
                                                '&:hover': { backgroundColor: '#FFF5F5' },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'transparent',
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                },
                                                '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            {[5, 10, 25].map(n => (
                                <MenuItem key={n} value={n}>
                                    {n}
                                    {rowsPerPage === n && (
                                        <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    )}
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
                            '& .MuiPaginationItem-ellipsis': {
                                border: 'none',
                            },
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

            {vehiculoVer && (
                <Dialog open onClose={() => setVehiculoVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Vehículo</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                            Información del vehículo
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {vehiculoVer.marca?.[0]}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {vehiculoVer.marca} {vehiculoVer.modelo}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    Placa: {vehiculoVer.placa}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SpeedOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Vehículo</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Características del vehículo
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Marca</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.marca}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Modelo</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.modelo}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.tipo}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Color</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.color}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Capacidad</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.capacidad} kg</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Placa</Typography><Typography variant="body2" fontWeight={500}>{vehiculoVer.placa}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EventOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Estado y Documentos</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Estado actual y documentación
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={vehiculoVer.estadoEfectivo === 'Activo' || vehiculoVer.estadoEfectivo === 'ocupado' ? '#2E7D32' : vehiculoVer.estadoEfectivo === 'Inactivo' ? '#9ca3af' : '#f59e0b'}>{vehicleStatusLabel(vehiculoVer.estadoEfectivo)}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vencimiento SOAT</Typography><Typography variant="body2" fontWeight={500} color={isVencido(vehiculoVer.vencimientoSOAT) ? '#ef4444' : '#2E7D32'}>{vehiculoVer.vencimientoSOAT ? new Date(vehiculoVer.vencimientoSOAT).toLocaleDateString() : 'N/A'}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setVehiculoVer(null)} variant="contained" sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            <RegistrarVehiculo
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchVehiculos()
                    setSnackbar({ open: true, message: 'Vehículo registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarVehiculo
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVehiculoEditar(null) }}
                transporte={vehiculoEditar}
                onSuccess={() => {
                    fetchVehiculos()
                    setSnackbar({ open: true, message: 'Vehículo actualizado correctamente', severity: 'success' })
                }}
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

export default ListarTransporte

