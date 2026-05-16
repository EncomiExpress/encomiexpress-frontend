import theme from '../../../shared/styles/theme.js'
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
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { useTransporte } from '../../../shared/contexts/TransporteContext'
import { useAuth } from '../../../shared/contexts/AuthContext'
import RegistrarVehiculo from './RegistrarVehiculo'
import ActualizarVehiculo from './ActualizarVehiculo'

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

const ESTADOS = ['Activo', 'Inactivo', 'Mantenimiento', 'En Reparación']

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

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'En Reparación', label: 'En Reparación' },
]

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const ListarTransporte = () => {
    const [transportes, setTransportes] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [vehiculoVer, setVehiculoVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [vehiculoEditar, setVehiculoEditar] = useState(null)

    const { getTransportes, updateEstado } = useTransporte()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setTransportes(getTransportes())
        }
    }, [usuario, navigate, getTransportes])

    const handleEstadoChange = (id, nuevoEstado) => {
        updateEstado(id, nuevoEstado)
        setTransportes(getTransportes())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
            severity: 'success',
        })
    }

    const filteredTransportes = transportes.filter(t => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            t.placa.toLowerCase().includes(q) ||
            t.marca.toLowerCase().includes(q) ||
            t.modelo.toLowerCase().includes(q) ||
            t.tipo.toLowerCase().includes(q)

        const coincideEstado =
            filtroEstado === 'todo' ||
            t.estado === filtroEstado

        return coincideBusqueda && coincideEstado
    })

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroEstado('todo')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroEstado !== 'todo'

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Vehículos
                        </Typography>
                        <Chip
                            label={`${transportes.length} registrado${transportes.length !== 1 ? 's' : ''}`}
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
                            color: filtroEstado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? theme.palette.text.primary : '#5C3333',
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
                    placeholder="Buscar vehículos..."
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
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransportes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {transportes.length === 0
                                                ? 'No hay vehículos registrados en el sistema.'
                                                : 'No se encontraron vehículos que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransportes.map((transporte) => (
                                    <TableRow
                                        key={transporte.idVehiculo}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: transporte.habilitado ? 1 : 0.55,
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
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={transporte.estado}
                                                    onChange={(e) => handleEstadoChange(transporte.idVehiculo, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.5,
                                                        color: transporte.estado === 'Activo' ? '#10b981' :
                                                               transporte.estado === 'Inactivo' ? '#dc2626' :
                                                               transporte.estado === 'Mantenimiento' ? '#f59e0b' : '#6366f1',
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
                    Total de vehículos: {filteredTransportes.length}
                </Typography>
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
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={vehiculoVer.estado === 'Activo' ? '#2E7D32' : '#ef4444'}>{vehiculoVer.estado}</Typography></Box>
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
                    setTransportes(getTransportes())
                    setSnackbar({ open: true, message: 'Vehículo registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarVehiculo
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVehiculoEditar(null) }}
                transporte={vehiculoEditar}
                onSuccess={() => {
                    setTransportes(getTransportes())
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