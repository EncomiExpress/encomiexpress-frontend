import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Tooltip, InputAdornment,
    Button, Select, MenuItem, Pagination, Chip, Avatar, Snackbar, Alert,
    TableSortLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ModalConsultarRol from './ModalConsultarRol'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const getFilterSelectSx = (theme) => ({
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover': { backgroundColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
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

const ListarRol = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterSelectSx = getFilterSelectSx(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { tienePermiso, PERMISOS, getRolesBackend, toggleHabilitadoRol, eliminarRolBackend, usuario: usuarioActual } = useAuth()

    const [roles, setRoles] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const initialLoad = useRef(true)
    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [sortBy, setSortBy] = useState({ field: 'nombre', dir: 'asc' })
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [rolEditar, setRolEditar] = useState(null)
    const [rolConsulta, setRolConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
    const [confirmToggle, setConfirmToggle] = useState({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedBusqueda(busqueda); setLoading(true) }, 300)
        return () => clearTimeout(t)
    }, [busqueda])

    const cargarRoles = useCallback(async () => {
        setLoading(true)
        const respuesta = await getRolesBackend({
            page,
            limit: rowsPerPage,
            sortBy: `${sortBy.field}.${sortBy.dir}`,
            habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
            q: debouncedBusqueda.trim() || undefined,
        })
        if (respuesta.success) {
            setRoles(respuesta.data || [])
            setTotal(respuesta.total ?? (respuesta.data || []).length)
        } else {
            setRoles([])
            setTotal(0)
        }
        setLoading(false)
        initialLoad.current = false
    }, [getRolesBackend, page, rowsPerPage, sortBy, filtroHabilitado, debouncedBusqueda])

    useEffect(() => {
        cargarRoles()
    }, [cargarRoles])

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    const handleToggleHabilitado = (id, rolNombre, habilitadoActual) => {
        setConfirmToggle({ open: true, rolId: id, rolNombre, habilitadoActual })
    }

    const confirmarToggle = async () => {
        const { rolId, rolNombre, habilitadoActual } = confirmToggle
        setConfirmToggle({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })
        try {
            const respuesta = await toggleHabilitadoRol(rolId)
            if (respuesta.success) {
                setRoles(prev => prev.map(r => r.id === rolId ? { ...r, habilitado: !habilitadoActual } : r))
                setSnackbar({
                    open: true,
                    message: !habilitadoActual
                        ? `Rol "${rolNombre}" habilitado. Todos sus usuarios han sido habilitados.`
                        : `Rol "${rolNombre}" inhabilitado. Todos sus usuarios han sido inhabilitados.`,
                    severity: 'success'
                })
            } else {
                setSnackbar({ open: true, message: respuesta.message || 'Error al cambiar estado', severity: 'error' })
            }
        } catch (error) {
            setSnackbar({ open: true, message: error?.message || 'Error al cambiar estado', severity: 'error' })
        }
    }

    const handleEliminarRol = async (id) => {
        try {
            const respuesta = await eliminarRolBackend(id)
            if (respuesta.success) {
                cargarRoles()
                setSnackbar({ open: true, message: respuesta.message, severity: 'success' })
            } else {
                setSnackbar({ open: true, message: respuesta.message || 'Error al eliminar el rol', severity: 'error' })
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al eliminar el rol', severity: 'error' })
        }
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroHabilitado('todo')
        setPage(1)
    }

    const hayFiltrosActivos = busqueda.trim() !== '' || filtroHabilitado !== 'todo'

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)
    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Roles
                    </Typography>
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{
                    display: 'inline-flex',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: 4,
                    p: '4px',
                    gap: '5px',
                }}>
                    {[{ value: 'todo', label: 'Todo' }, { value: 'habilitado', label: 'Habilitado' }, { value: 'inhabilitado', label: 'Inhabilitado' }].map(f => (
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
                                boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Buscar roles..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
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
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'nombre'}
                                        direction={sortBy.field === 'nombre' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('nombre')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Rol
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Descripción</TableCell>
                                <TableCell sx={thStyle}>Permisos</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando roles...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : !loading && roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {debouncedBusqueda.trim() || filtroHabilitado !== 'todo'
                                                ? 'No se encontraron roles que coincidan con la búsqueda.'
                                                : 'No hay roles registrados en el sistema.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map(rol => {
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
                                                    {tienePermiso(PERMISOS.INHABILITAR_ROL) && rol.nombre !== usuarioActual?.rol && (
                                                        <Tooltip title={rol.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleHabilitado(rol.id, rol.nombre, rol.habilitado)}
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
                                borderColor: theme.palette.divider,
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultarRol rol={rolConsulta} onClose={() => setRolConsulta(null)} />

            <RegistrarRol
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    cargarRoles()
                    setSnackbar({ open: true, message: 'Rol registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarRol
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setRolEditar(null) }}
                rol={rolEditar}
                onSuccess={() => {
                    cargarRoles()
                    setSnackbar({ open: true, message: 'Rol actualizado correctamente', severity: 'success' })
                }}
            />

            {/* ── Modal confirmación toggle rol ── */}
            <Dialog
                open={confirmToggle.open}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 420 } } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
                    {confirmToggle.habilitadoActual ? `¿Inhabilitar rol "${confirmToggle.rolNombre}"?` : `¿Habilitar rol "${confirmToggle.rolNombre}"?`}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        {confirmToggle.habilitadoActual
                            ? <>Se inhabilitarán <strong>todos los usuarios</strong> registrados con este rol, excepto tu cuenta activa. Mientras el rol esté inhabilitado no podrán iniciar sesión.</>
                            : <>Se habilitarán <strong>todos los usuarios</strong> registrados con este rol sin excepción. Volverán a tener acceso al sistema.</>
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmToggle(s => ({ ...s, open: false }))}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmarToggle}
                        variant="contained"
                        size="small"
                        color={confirmToggle.habilitadoActual ? 'error' : 'primary'}
                        disableElevation
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        {confirmToggle.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                    </Button>
                </DialogActions>
            </Dialog>

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

