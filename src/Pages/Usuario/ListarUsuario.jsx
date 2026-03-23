import { useState } from 'react'
import { useAuth, ROLES } from '../../Context/AuthContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, IconButton, Chip, Tooltip, InputAdornment,
    MenuItem, Select, FormControl, InputLabel, Button,
    Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Avatar, Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import PeopleIcon from '@mui/icons-material/People'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'

const COLORS = {
    primary: '#CC1818',
    secondary: '#1A2E6E',
    text: '#2D3748',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    activeBg: '#FFE8E8',
    hoverBg: '#F9F9F9',
}

// ── Modal Consultar ──
const ModalConsultar = ({ usuario, onClose }) => {
    if (!usuario) return null
    const campos = [
        { label: 'ID', value: usuario.id },
        { label: 'Nombre', value: usuario.nombre },
        { label: 'Email', value: usuario.email },
        { label: 'Rol', value: usuario.rol?.nombre },
        { label: 'Iniciales', value: usuario.iniciales },
        { label: 'Estado', value: usuario.habilitado ? 'Activo' : 'Inactivo' },
    ]
    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: COLORS.secondary, width: 36, height: 36, fontSize: '0.85rem' }}>
                    {usuario.iniciales}
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        {usuario.nombre}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>Detalle del usuario</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {campos.map(c => (
                        <Box key={c.label}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} textTransform="uppercase" letterSpacing={0.8}>
                                {c.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} color={COLORS.text}>
                                {String(c.value)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{ backgroundColor: COLORS.secondary, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Modal Editar ──
const ModalEditar = ({ usuario, onClose, onSave }) => {
    if (!usuario) return null
    
    const [formData, setFormData] = useState({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol?.nombre || '',
        iniciales: usuario.iniciales
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = () => {
        onSave(usuario.id, formData)
        onClose()
    }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, color: COLORS.secondary }}>
                Editar Usuario
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            name="rol"
                            value={formData.rol}
                            label="Rol"
                            onChange={handleChange}
                            required
                        >
                            {Object.values(ROLES).map(rol => (
                                <MenuItem key={rol.id} value={rol.nombre}>{rol.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Iniciales"
                        name="iniciales"
                        value={formData.iniciales}
                        onChange={handleChange}
                        fullWidth
                        required
                        inputProps={{ maxLength: 3 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined"
                    sx={{ borderColor: COLORS.border, color: COLORS.text, borderRadius: 2, textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} variant="contained"
                    sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none', '&:hover': { backgroundColor: '#a01212' } }}>
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Modal Inhabilitar ──
const ModalInhabilitar = ({ usuario, onClose, onConfirm }) => {
    if (!usuario) return null
    
    const estaInhabilitado = usuario.habilitado === false
    
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ color: COLORS.primary, fontWeight: 700 }}>
                {estaInhabilitado ? '¿Habilitar usuario?' : '¿Inhabilitar usuario?'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {estaInhabilitado 
                        ? `¿Estás seguro de habilitar a <strong>${usuario.nombre}</strong>? El usuario podrá acceder al sistema nuevamente.`
                        : `Estás a punto de inhabilitar a <strong>${usuario.nombre}</strong>. El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente.`
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined"
                    sx={{ borderColor: COLORS.border, color: COLORS.text, borderRadius: 2, textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(usuario.id)} variant="contained"
                    sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none', '&:hover': { backgroundColor: '#a01212' } }}>
                    {estaInhabilitado ? 'Sí, habilitar' : 'Sí, inhabilitar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Componente principal ──
const ListarUsuario = () => {
    const navigate = useNavigate()
    const { getUsuarios, tienePermiso, inhabilidadUsuario, actualizarUsuario, PERMISOS } = useAuth()
    const [usuarios, setUsuarios] = useState(getUsuarios())
    
    const [busqueda, setBusqueda] = useState('')
    const [filtroPor, setFiltroPor] = useState('todo')
    const [filtroRol, setFiltroRol] = useState('todos')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [usuarioConsulta, setUsuarioConsulta] = useState(null)
    const [usuarioEditar, setUsuarioEditar] = useState(null)
    const [usuarioInhabilitar, setUsuarioInhabilitar] = useState(null)
    const [mensaje, setMensaje] = useState('')

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_USUARIO)
    const puedeConsultar = tienePermiso(PERMISOS.CONSULTAR_USUARIO)
    const puedeActualizar = tienePermiso(PERMISOS.ACTUALIZAR_USUARIO)
    const puedeInhabilitar = tienePermiso(PERMISOS.INHABILITAR_USUARIO)

    // ── Filtrado ──
    const usuariosFiltrados = usuarios.filter(u => {
        const q = busqueda.toLowerCase()
        let coincideBusqueda = true

        if (q) {
            switch (filtroPor) {
                case 'nombre': coincideBusqueda = u.nombre.toLowerCase().includes(q); break
                case 'email': coincideBusqueda = u.email.toLowerCase().includes(q); break
                default:
                    coincideBusqueda = u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
            }
        }

        const coincideRol = filtroRol === 'todos' || u.rol?.nombre === filtroRol

        return coincideBusqueda && coincideRol
    })

    const handleInhabilitar = (id) => {
        inhabilidadUsuario(id)
        setUsuarios(getUsuarios())
        setUsuarioInhabilitar(null)
        setMensaje('Usuario actualizado correctamente')
        setTimeout(() => setMensaje(''), 2000)
    }

    const handleEditar = (id, datos) => {
        actualizarUsuario({ id, ...datos })
        setUsuarios(getUsuarios())
        setMensaje('Usuario actualizado correctamente')
        setTimeout(() => setMensaje(''), 2000)
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroPor('todo')
        setFiltroRol('todos')
        setPage(0)
    }

    const hayFiltrosActivos = busqueda || filtroRol !== 'todos'

    return (
        <Box sx={{ p: 1 }}>

            {/* ── Mensaje ── */}
            {mensaje && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {mensaje}
                </Alert>
            )}

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PeopleIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>
                            Usuarios
                        </Typography>
                        <Typography variant="caption" color={COLORS.textMuted}>
                            {usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                {puedeRegistrar && (
                    <Button
                        onClick={() => navigate('/usuarios/registrar')}
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: COLORS.primary,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: '#a01212' }
                        }}
                    >
                        Nuevo usuario
                    </Button>
                )}
            </Box>

            {/* ── Filtros ── */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{ minWidth: 200 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.textMuted }} /></InputAdornment>,
                        }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Buscar por</InputLabel>
                        <Select value={filtroPor} label="Buscar por" onChange={(e) => setFiltroPor(e.target.value)}>
                            <MenuItem value="todo">Todo</MenuItem>
                            <MenuItem value="nombre">Nombre</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Rol</InputLabel>
                        <Select value={filtroRol} label="Rol" onChange={(e) => setFiltroRol(e.target.value)}>
                            <MenuItem value="todos">Todos los roles</MenuItem>
                            {Object.values(ROLES).map(rol => (
                                <MenuItem key={rol.id} value={rol.nombre}>{rol.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {hayFiltrosActivos && (
                        <Tooltip title="Limpiar filtros">
                            <IconButton onClick={limpiarFiltros} size="small">
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {/* ── Tabla ── */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Iniciales</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosFiltrados
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((usuario) => (
                                    <TableRow key={usuario.id} hover sx={{ '&:hover': { backgroundColor: COLORS.hoverBg } }}>
                                        <TableCell>{usuario.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{usuario.nombre}</TableCell>
                                        <TableCell>{usuario.email}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={usuario.rol?.nombre} 
                                                size="small" 
                                                sx={{ 
                                                    backgroundColor: COLORS.secondary, 
                                                    color: 'white',
                                                    fontWeight: 600 
                                                }} 
                                            />
                                        </TableCell>
                                        <TableCell>{usuario.iniciales}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={usuario.habilitado !== false ? <CheckCircleIcon /> : <BlockIcon />}
                                                label={usuario.habilitado !== false ? 'Activo' : 'Inactivo'}
                                                size="small"
                                                color={usuario.habilitado !== false ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {puedeConsultar && (
                                                <Tooltip title="Consultar">
                                                    <IconButton size="small" onClick={() => setUsuarioConsulta(usuario)}>
                                                        <VisibilityIcon fontSize="small" sx={{ color: COLORS.secondary }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {puedeActualizar && (
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => setUsuarioEditar(usuario)}>
                                                        <EditIcon fontSize="small" sx={{ color: '#1976d2' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {puedeInhabilitar && (
                                                <Tooltip title={usuario.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                    <IconButton size="small" onClick={() => setUsuarioInhabilitar(usuario)}>
                                                        <BlockIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={usuariosFiltrados.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
                />
            </Paper>

            {/* ── Modales ── */}
            <ModalConsultar usuario={usuarioConsulta} onClose={() => setUsuarioConsulta(null)} />
            <ModalEditar usuario={usuarioEditar} onClose={() => setUsuarioEditar(null)} onSave={handleEditar} />
            <ModalInhabilitar usuario={usuarioInhabilitar} onClose={() => setUsuarioInhabilitar(null)} onConfirm={handleInhabilitar} />
        </Box>
    )
}

export default ListarUsuario


