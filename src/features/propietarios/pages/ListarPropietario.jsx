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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { usePropietario } from '../../../shared/contexts/PropietarioContext'
import { useAuth } from '../../../shared/contexts/AuthContext'
import RegistrarPropietario from './RegistrarPropietario'
import ActualizarPropietario from './ActualizarPropietario'

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

const ESTADOS = ['Activo', 'Inactivo']

const filterSelectSx = {
    fontSize: '0.75rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E57373', borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
}

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
]

const ListarPropietario = () => {
    const navigate = useNavigate()
    const [propietarios, setPropietarios] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [propietarioVer, setPropietarioVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [propietarioEditar, setPropietarioEditar] = useState(null)

    const { getPropietarios, updateEstado } = usePropietario()
    const { usuario } = useAuth()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setPropietarios(getPropietarios())
        }
    }, [usuario, navigate, getPropietarios])

    const handleEstadoChange = (id, nuevoEstado) => {
        updateEstado(id, nuevoEstado)
        setPropietarios(getPropietarios())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
            severity: 'success',
        })
    }

    const propietariosFiltrados = propietarios.filter(p => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            p.nombre.toLowerCase().includes(q) ||
            p.apellido.toLowerCase().includes(q) ||
            p.numeroIdentificacion.toLowerCase().includes(q) ||
            p.tipoIdentificacion.toLowerCase().includes(q) ||
            p.ciudad.toLowerCase().includes(q) ||
            (p.email && p.email.toLowerCase().includes(q))

        const coincideEstado =
            filtroEstado === 'todo' ||
            p.estado === filtroEstado

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
                            Propietarios
                        </Typography>
                        <Chip
                            label={`${propietarios.length} registrado${propietarios.length !== 1 ? 's' : ''}`}
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
                        Gestiona los propietarios de vehículos registrados en el sistema.
                    </Typography>
                </Box>
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
                    Nuevo propietario
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
                    placeholder="Buscar propietarios..."
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
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={thStyle}>Ciudad</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {propietariosFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {propietarios.length === 0
                                                ? 'No hay propietarios registrados en el sistema.'
                                                : 'No se encontraron propietarios que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                propietariosFiltrados.map((propietario) => (
                                    <TableRow
                                        key={propietario.idPropietario}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: propietario.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: propietario.habilitado ? '#FFCDD2' : theme.palette.divider,
                                                    fontSize: '0.73rem',
                                                    fontWeight: 700,
                                                    color: propietario.habilitado ? '#C62828' : '#8E8E8E',
                                                }}>
                                                    {propietario.nombre?.[0] || ''}{propietario.apellido?.[0] || ''}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {propietario.nombre} {propietario.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {propietario.tipoIdentificacion} {propietario.numeroIdentificacion}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{propietario.telefono}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{propietario.email || '-'}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{propietario.ciudad}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <Select
                                                    value={propietario.estado}
                                                    onChange={(e) => handleEstadoChange(propietario.idPropietario, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.5,
                                                        color: propietario.estado === 'Activo' ? '#10b981' :
                                                               propietario.estado === 'Inactivo' ? '#dc2626' : '#f59e0b',
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
                                                        onClick={() => setPropietarioVer(propietario)}
                                                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                    >
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => { setPropietarioEditar(propietario); setModalActualizarOpen(true) }}
                                                        sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                    >
                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
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
                    Total de propietarios: {propietariosFiltrados.length}
                </Typography>
            </Box>

            {propietarioVer && (
                <Dialog open onClose={() => setPropietarioVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Propietario</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                            Información del perfil del propietario
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {propietarioVer.iniciales && propietarioVer.iniciales !== 'U' ? propietarioVer.iniciales : (propietarioVer.nombre?.[0] || '') + (propietarioVer.apellido?.[0] || '') || 'P'}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {propietarioVer.nombre} {propietarioVer.apellido}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    {propietarioVer.email || 'Sin email'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Propietario</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Identificación y datos personales
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Identificación</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.tipoIdentificacion} {propietarioVer.numeroIdentificacion}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.nombre}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.apellido}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos de contacto y ubicación
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.telefono}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Ciudad</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.ciudad}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Email</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer.email || '—'}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={propietarioVer.estado === 'Activo' ? '#2E7D32' : '#ef4444'}>{propietarioVer.estado}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setPropietarioVer(null)} variant="contained" sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            <RegistrarPropietario 
                open={modalRegistrarOpen} 
                onClose={() => setModalRegistrarOpen(false)} 
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Propietario registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarPropietario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setPropietarioEditar(null) }}
                propietario={propietarioEditar}
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Propietario actualizado correctamente', severity: 'success' })
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

export default ListarPropietario