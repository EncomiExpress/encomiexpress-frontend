import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, TableSortLabel, GlobalStyles
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RegistrarUsuario from './RegistrarUsuario'
import ActualizarUsuario from './ActualizarUsuario'
import ModalConsultarUsuario from './ModalConsultarUsuario'
import ModalInhabilitarUsuario from './ModalInhabilitarUsuario'
import { exportToExcel } from '../../shared/utils/exportExcel.js'

const getToggleCss = (primaryColor) => `
  .ee-toggle {
    --sz: 10px; --sz1: calc(var(--sz) / 10);
    --on: ${primaryColor}; --no: #9ca3af; --bg: #212121;
    --tr: all 0.5s ease 0s;
    position: relative;
    width: calc(var(--sz) * 4);
    height: calc(var(--sz) * 2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
  }
  .ee-toggle .ee-input { display: none; }
  .ee-toggle label {
    position: absolute;
    width: calc(var(--sz) * 4);
    height: calc(var(--sz) * 2);
    background: var(--no);
    border-radius: var(--sz);
    pointer-events: none;
    transition: var(--tr);
  }
  .ee-toggle .ee-input:checked + label { background: var(--on); }
  .ee-toggle label:before, .ee-toggle label:after {
    content: "";
    position: absolute;
    border-right: calc(var(--sz1) * 2) solid var(--bg);
    height: calc(var(--sz1) * 12);
    left: calc(var(--sz1) * 28);
    top: calc(var(--sz1) * 4);
    transform: rotate(45deg);
    transition: var(--tr);
  }
  .ee-toggle label:after { transform: rotate(-45deg); }
  .ee-toggle .ee-input:checked + label:before,
  .ee-toggle .ee-input:checked + label:after {
    --bg: #fff;
    border-right: calc(var(--sz1) * 2) solid var(--bg);
    height: calc(var(--sz1) * 9);
    left: calc(var(--sz1) * 11.5);
    top: calc(var(--sz1) * 5.5);
    transform: rotate(35deg);
  }
  .ee-toggle .ee-input:checked + label:after {
    transform: rotate(-56deg);
    height: calc(var(--sz1) * 6);
    left: calc(var(--sz1) * 7.7);
    top: calc(var(--sz1) * 9);
  }
  .ee-toggle label .ee-thumb:hover { background: #fff; }
  .ee-toggle .ee-input:checked + label .ee-thumb:hover { background: #282828; }
  .ee-toggle .ee-input:checked + label .ee-thumb:hover:before,
  .ee-toggle .ee-input:checked + label .ee-thumb:hover:after { animation-play-state: paused; }
  .ee-toggle .ee-thumb {
    position: absolute;
    width: calc(calc(var(--sz) * 2) - calc(var(--sz) / 3));
    height: calc(calc(var(--sz) * 2) - calc(var(--sz) / 3));
    top: calc(calc(var(--sz) / 10) + calc(var(--sz) / 15));
    left: calc(calc(var(--sz) / 10) + calc(var(--sz) / 15));
    background: var(--bg);
    border-radius: var(--sz);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    overflow: hidden;
    --cl: var(--no);
    pointer-events: all;
    transition: var(--tr);
  }
  .ee-toggle .ee-input:checked + label .ee-thumb {
    left: calc(calc(100% - calc(calc(var(--sz) * 2) - calc(var(--sz) / 3))) - calc(calc(var(--sz) / 10) + calc(var(--sz) / 15)));
    --bg: #fff;
  }
`

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem', py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.light },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.light },
                },
            },
        },
    },
})

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const ListarUsuario = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { tienePermiso, PERMISOS, getUsuarios, getRolesBackend, habilitarInhabilitarUsuario, usuario: usuarioActual } = useAuth()

    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const initialLoad = useRef(true)
    const [error, setError] = useState(null)
    const [total, setTotal] = useState(0)
    const [roles, setRoles] = useState([])
    const [filtroRol, setFiltroRol] = useState('')

    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [sortBy, setSortBy] = useState({ field: 'nombre', dir: 'asc' })
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [usuarioConsulta, setUsuarioConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [usuarioEditar, setUsuarioEditar] = useState(null)
    const [confirmToggle, setConfirmToggle] = useState({ open: false, idUsuario: null, nombreCompleto: '', habilitadoActual: false })

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    const cargarUsuarios = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const respuesta = await getUsuarios({
                page,
                limit: rowsPerPage,
                sortBy: `${sortBy.field}.${sortBy.dir}`,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                idRol: filtroRol || undefined,
                q: debouncedBusqueda.trim() || undefined,
            })
            setUsuarios(Array.isArray(respuesta.data) ? respuesta.data : [])
            setTotal(typeof respuesta.total === 'number' ? respuesta.total : (Array.isArray(respuesta.data) ? respuesta.data.length : 0))
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            initialLoad.current = false
        }
    }, [getUsuarios, page, rowsPerPage, debouncedBusqueda, filtroHabilitado, filtroRol, sortBy])

    useEffect(() => {
        cargarUsuarios()
    }, [cargarUsuarios])

    useEffect(() => {
        const cargarRoles = async () => {
            try {
                const respuesta = await getRolesBackend({ habilitado: 'true' })
                if (respuesta.success) {
                    setRoles(respuesta.data || [])
                }
            } catch {
                setRoles([])
            }
        }
        cargarRoles()
    }, [getRolesBackend])

    const puedeRegistrar = tienePermiso(PERMISOS.REGISTRAR_USUARIO)

    const solicitarToggle = (usuario) => {
        setConfirmToggle({
            open: true,
            idUsuario: usuario.idUsuario,
            nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
            habilitadoActual: usuario.habilitado,
        })
    }

    const onConfirmar = async () => {
        const { idUsuario, habilitadoActual } = confirmToggle
        try {
            await habilitarInhabilitarUsuario(idUsuario)
            setUsuarios(prev => prev.map(u =>
                u.idUsuario === idUsuario ? { ...u, habilitado: !u.habilitado } : u
            ))
            setSnackbar({ open: true, message: `Usuario ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente`, severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: err?.message || 'Error al cambiar el estado', severity: 'error' })
            throw err
        }
    }

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroHabilitado('todo')
        setFiltroRol('')
        setPage(1)
    }

    const handleExportar = () => {
        const rows = usuarios.map(usuario => ({
            'ID': usuario.idUsuario,
            'Nombre': `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
            'Email': usuario.email,
            'Rol': usuario.rol?.nombre || usuario.idRol || '-',
            'Estado': usuario.habilitado === false ? 'Inhabilitado' : 'Habilitado',
        }))

        exportToExcel({
            data: rows,
            fileName: 'usuarios',
            sheetName: 'Usuarios',
        })
    }

    const hayFiltrosActivos = busqueda.trim() !== '' || filtroHabilitado !== 'todo' || filtroRol !== ''

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)
    return (
        <Box sx={{ p: 3.5 }}>
            <GlobalStyles styles={getToggleCss(theme.palette.primary.main)} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Usuarios
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los usuarios registrados en el sistema.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={handleExportar}
                        variant="contained"
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Exportar
                    </Button>

                    {puedeRegistrar && (
                        <Button
                            onClick={() => setModalRegistrarOpen(true)}
                            variant="contained"
                            startIcon={<AddOutlinedIcon sx={{ fontSize: 20 }} />}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.875rem',
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
            </Box>



            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{
                        display: 'inline-flex',
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: 4,
                        p: '4px',
                        gap: '5px',
                    }}>
                        {FILTROS.map(f => (
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
                                    boxShadow: filtroHabilitado === f.value
                                        ? '0 1px 4px rgba(0,0,0,0.12)'
                                        : 'none',
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

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroRol}
                            onChange={e => { setFiltroRol(e.target.value); setPage(1) }}
                            renderValue={v => v ? roles.find(r => r.id === v)?.nombre || 'Rol' : 'Rol'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroRol ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {roles.map((rol) => (
                                <MenuItem key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                    {filtroRol === rol.id && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar usuarios..."
                        sx={{
                            width: 280,
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
                                        Nombre
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={thStyle}>Rol</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando usuarios...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los usuarios. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroRol !== ''
                                                ? 'No se encontraron usuarios que coincidan con los filtros aplicados.'
                                                : debouncedBusqueda.trim()
                                                    ? 'No se encontraron usuarios que coincidan con la búsqueda.'
                                                    : 'No hay usuarios registrados en el sistema.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.map(usuario => (
                                    <TableRow
                                        key={usuario.idUsuario}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: usuario.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: usuario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                                    fontSize: '0.73rem',
                                                    fontWeight: 700,
                                                    color: usuario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                                }}
                                                >
                                                    {usuario.iniciales && usuario.iniciales !== 'U' ? usuario.iniciales : (usuario.nombre?.[0] || '') + (usuario.apellido?.[0] || '') || 'U'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {usuario.nombre} {usuario.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {usuario.tipoIdentificacion} {usuario.numeroIdentificacion}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {usuario.telefono || '—'}
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {usuario.email}
                                        </TableCell>

                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={usuario.rol?.nombre}
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
                                                {tienePermiso(PERMISOS.CONSULTAR_USUARIO) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setUsuarioConsulta(usuario)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_USUARIO) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setUsuarioEditar(usuario); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.INHABILITAR_USUARIO) && usuario.idUsuario !== usuarioActual?.idUsuario && (
                                                    <Tooltip title={usuario.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <div className="ee-toggle">
                                                            <input
                                                                type="checkbox"
                                                                id={`ee-btn-${usuario.idUsuario}`}
                                                                className="ee-input"
                                                                checked={usuario.habilitado}
                                                                onChange={() => solicitarToggle(usuario)}
                                                            />
                                                            <label htmlFor={`ee-btn-${usuario.idUsuario}`}>
                                                                <span className="ee-thumb"></span>
                                                            </label>
                                                        </div>
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
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: '1px',
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
                                                '&.Mui-selected': {
                                                    backgroundColor: 'transparent',
                                                    fontWeight: 600,
                                                    color: theme.palette.text.primary,
                                                },
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

            <ModalConsultarUsuario usuario={usuarioConsulta} onClose={() => setUsuarioConsulta(null)} />

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

            <ModalInhabilitarUsuario
                open={confirmToggle.open}
                data={confirmToggle}
                onClose={() => setConfirmToggle(s => ({ ...s, open: false }))}
                onExited={() => setConfirmToggle({ open: false, idUsuario: null, nombreCompleto: '', habilitadoActual: false })}
                onConfirm={onConfirmar}
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

