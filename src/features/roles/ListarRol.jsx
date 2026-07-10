import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Tooltip, InputAdornment,
    Button, Select, MenuItem, Pagination, Chip,
    TableSortLabel, CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ModalConsultarRol from './ModalConsultarRol'
import ModalInhabilitarRol from './ModalInhabilitarRol'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const ListarRol = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const { tienePermiso, PERMISOS, getRolesBackend, toggleHabilitadoRol } = useAuth()

    const [roles, setRoles] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
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
    const { showToast } = useToast()
    const [confirmToggle, setConfirmToggle] = useState({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_ROL)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    const cargarRoles = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
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
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            initialLoad.current = false
        }
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

    const onConfirmar = async () => {
        const { rolId, rolNombre, habilitadoActual } = confirmToggle
        let respuesta
        try {
            respuesta = await toggleHabilitadoRol(rolId)
        } catch (error) {
            showToast(error?.message || 'Error al cambiar estado', 'error')
            throw error
        }
        if (respuesta.success) {
            setRoles(prev => prev.map(r => r.id === rolId ? { ...r, habilitado: !habilitadoActual } : r))
            showToast(
                !habilitadoActual
                    ? `Rol "${rolNombre}" habilitado. Todos sus usuarios han sido habilitados.`
                    : `Rol "${rolNombre}" inhabilitado. Todos sus usuarios han sido inhabilitados.`,
                'success'
            )
        } else {
            showToast(respuesta.message || 'Error al cambiar estado', 'error')
            throw new Error(respuesta.message || 'Error al cambiar estado')
        }
    }


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
                        Nuevo
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
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
                                boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                    color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.dark,
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
                                <TableCell sx={{ ...thStyle, width: '30%' }}>
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
                                <TableCell sx={{ ...thStyle, width: '40%' }}>Descripción</TableCell>
                                <TableCell sx={{ ...thStyle, width: '25%' }}>Permisos</TableCell>
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
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los roles. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
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
                                    return (
                                        <TableRow
                                            key={rol.id}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: rol.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
                                                    {rol.nombre}
                                                </Typography>
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
                                                    variant="outlined"
                                                    sx={{
                                                        backgroundColor: 'transparent',
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        fontSize: '0.72rem',
                                                        height: 22,
                                                        borderRadius: 10,
                                                        borderColor: theme.palette.divider,
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
                                                    {tienePermiso(PERMISOS.INHABILITAR_ROL) && (
                                                        <ToggleSwitch id={rol.id} checked={rol.habilitado} onChange={() => handleToggleHabilitado(rol.id, rol.nombre, rol.habilitado)} />
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
                    showToast('Rol registrado correctamente', 'success')
                }}
            />

            <ActualizarRol
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setRolEditar(null) }}
                rol={rolEditar}
                onSuccess={() => {
                    cargarRoles()
                    showToast('Rol actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarRol
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, rolId: null, rolNombre: '', habilitadoActual: null })}
                onConfirm={onConfirmar}
            />

        </Box>
    )
}

export default ListarRol

