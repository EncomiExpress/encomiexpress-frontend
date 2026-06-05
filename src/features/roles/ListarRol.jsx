import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, Pagination, Chip, Avatar, Snackbar, Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

const getFilterSelectSx = (theme) => ({
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover': { backgroundColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
})

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

const getRolColor = (theme, nombre) => {
    return theme.palette.avatarDefault || theme.palette.roles.default
}

const ModalConsultar = ({ rol, onClose }) => {
    const theme = useTheme()
    if (!rol) return null

    const avatarStyle = theme.palette.avatarDefault || theme.palette.roles.default
    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: avatarStyle.bg, color: avatarStyle.color, width: 36, height: 36 }}>
                    <AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={theme.palette.secondary.main}>
                        Rol #{rol.idRol || rol.id}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary}>
                        Información del rol de usuario
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Datos del Rol</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Información principal del rol
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                                width: 50, height: 50, borderRadius: 2,
                                backgroundColor: avatarStyle.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 24, color: avatarStyle.color }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={700} color={theme.palette.text.primary}>
                                    {rol.nombre}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.2}>
                                    {rol.descripcion || 'Sin descripción'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <SecurityOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Permisos</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Permisos asociados al rol
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9, borderTop: `1px solid ${theme.palette.divider}`, mt: 1, pt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>Total permisos</Typography>
                            <Chip
                                label={`${rol.permisos?.length || 0} permisos`}
                                size="small"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 10,
                                    border: 'none',
                                }}
                            />
                        </Box>

                        {rol.permisos && rol.permisos.length > 0 && (
                            <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600} display="block" mb={1}>
                                    Lista de permisos
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {rol.permisos.slice(0, 10).map((permiso, idx) => (
                                        <Chip
                                            key={idx}
                                            label={permiso.replace(/_/g, ' ')}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#F3F4F6',
                                                color: theme.palette.text.secondary,
                                                fontWeight: 500,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    ))}
                                    {rol.permisos.length > 10 && (
                                        <Chip
                                            label={`+${rol.permisos.length - 10} más`}
                                            size="small"
                                            sx={{
                                                backgroundColor: theme.palette.primary.light,
                                                color: theme.palette.primary.main,
                                                fontWeight: 600,
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderRadius: 8,
                                                border: 'none',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const ListarRol = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterSelectSx = getFilterSelectSx(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { tienePermiso, PERMISOS, getRolesBackend, toggleHabilitadoRol, eliminarRolBackend } = useAuth()

    const [roles, setRoles] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [cargando, setCargando] = useState(false)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rolEditar, setRolEditar] = useState(null)
    const [rolConsulta, setRolConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    const handleToggleHabilitado = async (id, habilitadoActual) => {
        try {
            const respuesta = await toggleHabilitadoRol(id)
            if (respuesta.success) {
                setRoles(prev => prev.map(r => r.id === id ? { ...r, habilitado: !habilitadoActual } : r))
                setSnackbar({ open: true, message: `Rol ${!habilitadoActual ? 'habilitado' : 'inhabilitado'} correctamente`, severity: 'success' })
            } else {
                setSnackbar({ open: true, message: respuesta.message || 'Error al cambiar estado', severity: 'error' })
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al cambiar estado', severity: 'error' })
        }
    }

    const handleEliminarRol = async (id) => {
        try {
            const respuesta = await eliminarRolBackend(id)
            if (respuesta.success) {
                setRoles(roles.filter(r => r.id !== id))
                setSnackbar({ open: true, message: respuesta.message, severity: 'success' })
            } else {
                setSnackbar({ open: true, message: respuesta.message || 'Error al eliminar el rol', severity: 'error' })
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al eliminar el rol', severity: 'error' })
        }
    }

    useEffect(() => {
        const cargarRoles = async () => {
            setCargando(true)
            const respuesta = await getRolesBackend()
            if (respuesta.success) {
                setRoles(respuesta.data || [])
            } else {
                console.error('Error al cargar roles:', respuesta.message)
                setRoles([])
            }
            setCargando(false)
        }
        cargarRoles()
    }, [getRolesBackend])

    const rolesFiltrados = roles.filter(r => {
        const q = busqueda.toLowerCase().trim()
        if (!q) return true
        return r.nombre.toLowerCase().includes(q) ||
            (r.descripcion || '').toLowerCase().includes(q)
    })

    const totalPages = Math.max(1, Math.ceil(rolesFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedRoles = rolesFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = rolesFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, rolesFiltrados.length)

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Roles
                        </Typography>
                        <Chip
                            label={`${roles.length} registrado${roles.length !== 1 ? 's' : ''}`}
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
                        Gestiona los roles de usuario en el sistema.
                    </Typography>
                </Box>
                {puedeRegistrar && (
                    <Button
                        onClick={(e) => { e.currentTarget.blur(); setModalRegistrarOpen(true) }}
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                                boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}`,
                            },
                        }}
                    >
                        Nuevo rol
                    </Button>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar roles..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': {
                                boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}`,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
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
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
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
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Rol</TableCell>
                                <TableCell sx={thStyle}>Descripción</TableCell>
                                <TableCell sx={thStyle}>Permisos</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {roles.length === 0
                                                ? 'No hay roles registrados en el sistema.'
                                                : 'No se encontraron roles que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRoles.map(rol => {
                                    const rolStyle = (rol.habilitado !== false)
                                        ? (theme.palette.avatarDefault || theme.palette.roles.default)
                                        : (theme.palette.avatarDisabled || theme.palette.roles.default)
                                    return (
                                        <TableRow
                                            key={rol.id}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: rol.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: rolStyle.bg,
                                                        fontSize: '0.73rem',
                                                        fontWeight: 700,
                                                        color: rolStyle.color,
                                                    }}>
                                                        {rol.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                                                        {rol.nombre}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={theme.palette.text.secondary} sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rol.descripcion || 'Sin descripción'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={`${rol.permisos?.length || 0} permisos`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: theme.palette.primary.main,
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
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_ROL) && (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.currentTarget.blur(); setRolConsulta(rol) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_ROL) && (
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.currentTarget.blur(); setRolEditar(rol); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.INHABILITAR_ROL) && rol.id !== 1 && (
                                                        <Tooltip title={rol.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleHabilitado(rol.id, rol.habilitado)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                            >
                                                                {rol.habilitado ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status.disabled2.color }} />}
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                    Mostrando {from}–{to} de {rolesFiltrados.length} resultado{rolesFiltrados.length !== 1 ? 's' : ''}
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
                                    borderColor: theme.palette.primary.main, borderWidth: '1px',
                                },
                                '&.Mui-focused': {
                                    boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}`,
                                },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
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

            <ModalConsultar rol={rolConsulta} onClose={() => setRolConsulta(null)} />

            <RegistrarRol
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={async () => {
                    const respuesta = await getRolesBackend()
                    if (respuesta.success) {
                        setRoles(respuesta.data || [])
                    }
                    setSnackbar({ open: true, message: respuesta.success ? 'Rol registrado correctamente' : respuesta.message, severity: respuesta.success ? 'success' : 'error' })
                }}
            />

            <ActualizarRol
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setRolEditar(null) }}
                rol={rolEditar}
                onSuccess={async () => {
                    const respuesta = await getRolesBackend()
                    if (respuesta.success) {
                        setRoles(respuesta.data || [])
                    }
                    setSnackbar({ open: true, message: respuesta.success ? 'Rol actualizado correctamente' : respuesta.message, severity: respuesta.success ? 'success' : 'error' })
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

export default ListarRol

