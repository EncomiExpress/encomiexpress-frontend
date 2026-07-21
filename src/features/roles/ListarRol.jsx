import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Tooltip, InputAdornment,
    Button, Chip,
    TableSortLabel, CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import RegistrarRol from './RegistrarRol'
import ActualizarRol from './ActualizarRol'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ModalConsultarRol from './ModalConsultarRol'
import ModalInhabilitarRol from './ModalInhabilitarRol'

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

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
    const filtroContainerRef = useRef(null)
    const filtroBtnRefs = useRef([])
    const [filtroPillStyle, setFiltroPillStyle] = useState({ left: 0, width: 0 })

    useLayoutEffect(() => {
        const activeIndex = FILTROS.findIndex(f => f.value === filtroHabilitado)
        const btn = filtroBtnRefs.current[activeIndex]
        const container = filtroContainerRef.current
        if (btn && container) {
            setFiltroPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
        }
    }, [filtroHabilitado])
    const [sortBy, setSortBy] = useState({ field: '', dir: '' })
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
                sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
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
        setSortBy(prev => {
            if (prev.field !== field) return { field, dir: 'asc' }
            if (prev.dir === 'asc') return { field, dir: 'desc' }
            return { field: '', dir: '' }
        })
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
                <Box ref={filtroContainerRef} sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: 4,
                    p: '4px',
                    gap: '5px',
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: '4px',
                        bottom: '4px',
                        left: `${filtroPillStyle.left}px`,
                        width: `${filtroPillStyle.width}px`,
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'none',
                    }} />
                    {FILTROS.map((f, i) => (
                        <Button
                            key={f.value}
                            ref={el => { filtroBtnRefs.current[i] = el }}
                            onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
                            size="small"
                            disableElevation
                            disableRipple
                            sx={{
                                position: 'relative',
                                zIndex: 1,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 2,
                                py: 0.5,
                                minWidth: 0,
                                fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                backgroundColor: 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
                                transition: 'color 0.3s ease',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: 'transparent',
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
                                        direction={sortBy.dir === 'desc' ? 'desc' : 'asc'}
                                        onClick={() => handleSort('nombre')}
                                        IconComponent={sortBy.field === 'nombre' ? undefined : UnfoldMoreOutlinedIcon}
                                        sx={{
                                            color: 'inherit',
                                            '&:hover': { color: 'inherit' },
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '&.Mui-active:hover': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 1, fontSize: 16 },
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
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                            >
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_ROL) && (
                                                        rol.id === 1 ? (
                                                            <Tooltip title="El rol de administrador no se puede modificar">
                                                                <span>
                                                                    <IconButton size="small" disabled>
                                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        ) : rol.habilitado === false ? (
                                                            <Tooltip title="Habilita el registro para poder editarlo">
                                                                <span>
                                                                    <IconButton size="small" disabled>
                                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip title="Editar">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => { e.currentTarget.blur(); setRolEditar(rol); setModalActualizarOpen(true) }}
                                                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}
                                                                >
                                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )
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

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
            />

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

