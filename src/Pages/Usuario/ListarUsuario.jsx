import { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent,
    Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RegistrarUsuario from './RegistrarUsuario'
import ActualizarUsuario from './ActualizarUsuario'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    secondary: '#1A2E6E',
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

const CampoFila = ({ label, value, esEstado, esRol }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        {esEstado ? (
            <Chip
                label={value}
                size="small"
                sx={{
                    backgroundColor: value === 'Habilitado' ? '#DCFCE7' : '#F3F4F6',
                    color: value === 'Habilitado' ? '#16A34A' : '#9CA3AF',
                    fontWeight: 600, fontSize: '0.72rem',
                    height: 22, borderRadius: 10, border: 'none',
                }}
            />
        ) : esRol ? (
            <Chip
                label={value}
                size="small"
                sx={{
                    backgroundColor: '#B91C1C',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    height: 22,
                    borderRadius: 10,
                    border: 'none',
                }}
            />
        ) : (
            <Typography variant="body2" fontWeight={500} color="#2D3748">
                {String(value ?? '—')}
            </Typography>
        )}
    </Box>
)

const ModalConsultar = ({ usuario, onClose }) => {
    if (!usuario) return null
    const estado = usuario.habilitado ? 'Habilitado' : 'Inhabilitado'

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <PersonOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Perfil</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>
                    Información del perfil del usuario
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                        {usuario.iniciales || 'U'}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1.1rem" color={COLORS.text}>
                            {usuario.nombre} {usuario.apellido}
                        </Typography>
                        <Typography variant="body2" color={COLORS.textMuted} mt={0.4}>
                            {usuario.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Detalles del Usuario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Identificación y datos personales
                    </Typography>

                    <CampoFila label="Tipo identificación" value={usuario.tipoIdentificacion} />
                    <CampoFila label="Número identificación" value={usuario.numeroIdentificacion} />
                    <CampoFila label="Nombre" value={usuario.nombre} />
                    <CampoFila label="Apellido" value={usuario.apellido} />
                </Paper>

                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Información de Contacto</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Datos de contacto y estado de la cuenta
                    </Typography>

                    <CampoFila label="Teléfono" value={usuario.telefono || '—'} />
                    <CampoFila label="Correo" value={usuario.email} />
                    <CampoFila label="Rol" value={usuario.rol?.nombre} esRol />
                    <CampoFila label="Estado" value={estado} esEstado />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
]

const ListarUsuario = () => {
    const { tienePermiso, PERMISOS, getUsuarios } = useAuth()
    
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [usuarioConsulta, setUsuarioConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [usuarioEditar, setUsuarioEditar] = useState(null)

    const cargarUsuarios = async () => {
        setLoading(true)
        try {
            const data = await getUsuarios()
            setUsuarios(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarUsuarios()
    }, [getUsuarios])

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_USUARIO)

    const ESTADOS = ['Activo', 'Inactivo']

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            const nuevosUsuarios = usuarios.map(u => 
                u.id === id ? { ...u, habilitado: nuevoEstado === 'Activo' } : u
            )
            setUsuarios(nuevosUsuarios)
            setSnackbar({ open: true, message: `Estado actualizado a ${nuevoEstado}`, severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' })
        }
    }

    const usuariosFiltrados = usuarios.filter(u => {
        const q = busqueda.toLowerCase().trim()
        const coincideBusqueda = !q ||
            u.nombre.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.iniciales?.toLowerCase().includes(q)

        const coincideEstado =
            filtroEstado === 'todo' ||
            (filtroEstado === 'Activo' && u.habilitado) ||
            (filtroEstado === 'Inactivo' && !u.habilitado)

        return coincideBusqueda && coincideEstado
    })

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroEstado('todo')
        setPage(1)
    }

    const hayFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== 'todo'

    const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedUsuarios = usuariosFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = usuariosFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, usuariosFiltrados.length)

    return (
        <Box sx={{ p: 3.5 }}>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Usuarios
                        </Typography>
                        {!loading && !error && (
                            <Chip
                                label={`${usuarios.length} registrado${usuarios.length !== 1 ? 's' : ''}`}
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
                        )}
                    </Box>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona los usuarios registrados en el sistema.
                    </Typography>
                </Box>
                {puedeRegistrar && (
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
                        Nuevo usuario
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    Error al cargar los usuarios: {error}
                </Alert>
            )}

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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar usuarios..."
                    sx={{
                        width: 280,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': {
                                boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#CC1818',
                                borderWidth: '1px',
                            },
                        },
                    }}
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setPage(1) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setBusqueda(''); setPage(1) }}>
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

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        borderColor: COLORS.border,
                        color: COLORS.text,
                        fontWeight: 500,
                        ml: 'auto',
                        '&:hover': { backgroundColor: COLORS.primaryLight },
                    }}
                >
                    Exportar
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Tipo Identificación</TableCell>
                                <TableCell sx={thStyle}>N° Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Correo</TableCell>
                                <TableCell sx={thStyle}>Rol</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                                        <Typography variant="body2" color={COLORS.textMuted} mt={1.5}>
                                            Cargando usuarios...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los usuarios. Verifica la conexión con el servidor.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedUsuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            {usuarios.length === 0
                                                ? 'No hay usuarios registrados en el sistema.'
                                                : 'No se encontraron usuarios que coincidan con los filtros aplicados.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsuarios.map(usuario => (
                                    <TableRow
                                        key={usuario.id}
                                        sx={{
                                            '&:hover': { backgroundColor: COLORS.hoverBg },
                                            transition: 'background-color 0.15s',
                                            opacity: usuario.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: usuario.habilitado ? '#FFCDD2' : '#E0E0E0',
                                                    fontSize: '0.73rem',
                                                    fontWeight: 700,
                                                    color: usuario.habilitado ? '#C62828' : '#8E8E8E',
                                                }}>
                                                    {usuario.iniciales || 'U'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={COLORS.text} noWrap>
                                                    {usuario.nombre} {usuario.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {usuario.tipoIdentificacion}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {usuario.numeroIdentificacion}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {usuario.telefono || '—'}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                            {usuario.email}
                                        </TableCell>

                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={usuario.rol?.nombre}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#B91C1C',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.72rem',
                                                    height: 22,
                                                    borderRadius: 10,
                                                    border: 'none',
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={usuario.habilitado ? 'Activo' : 'Inactivo'}
                                                    onChange={(e) => handleEstadoChange(usuario.id, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.5,
                                                        color: usuario.habilitado ? '#10b981' : '#dc2626',
                                                    }}
                                                    MenuProps={{
                                                        slotProps: {
                                                            paper: {
                                                                sx: {
                                                                    borderRadius: 2,
                                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                                    mt: 0.5,
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.82rem',
                                                                        py: 0.9,
                                                                        px: 2,
                                                                        '&:hover': { backgroundColor: '#FFF5F5' },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    }}
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
                                                        onClick={() => setUsuarioConsulta(usuario)}
                                                        sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                    >
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => { setUsuarioEditar(usuario); setModalActualizarOpen(true) }}
                                                        sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
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
                <Typography variant="body2" color={COLORS.textMuted}>
                    Mostrando {from}–{to} de {usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={COLORS.textMuted} fontWeight={500}>
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
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E57373',
                                    borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
                                },
                                '& .MuiSelect-icon': { color: COLORS.textMuted, fontSize: 18 },
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
                                                    color: COLORS.text,
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
                                        <CheckOutlinedIcon sx={{ fontSize: 14, color: COLORS.textMuted }} />
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
                                color: COLORS.text,
                                border: `1px solid ${COLORS.border}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                border: 'none',
                            },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary,
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: '#a01212' },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: COLORS.hoverBg,
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultar usuario={usuarioConsulta} onClose={() => setUsuarioConsulta(null)} />

            <RegistrarUsuario
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    cargarUsuarios()
                    setSnackbar({ open: true, message: 'Usuario registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarUsuario
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setUsuarioEditar(null) }}
                usuario={usuarioEditar}
                onSuccess={() => {
                    cargarUsuarios()
                    setSnackbar({ open: true, message: 'Usuario actualizado correctamente', severity: 'success' })
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

export default ListarUsuario
