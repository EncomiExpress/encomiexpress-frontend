import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Avatar, CircularProgress,
    Pagination, TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarConductor from './ModalConsultarConductor'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

// Los estados que acepta el backend
const ESTADOS_CONDUCTOR = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
]

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

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const estadoColor = (estado, theme) => {
    if (!estado) return theme.palette.text.secondary
    switch (estado.toLowerCase()) {
        case 'activo': return '#10b981'
        case 'inactivo': return '#dc2626'
        default: return theme.palette.text.secondary
    }
}

const ListarConductor = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [conductorVer, setConductorVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [conductorEditar, setConductorEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'nombre', dir: 'asc' })
    const [localLoading, setLocalLoading] = useState(false)
    const initialLoad = useRef(true)

    const { conductores, total, loading, fetchConductores, updateEstado, toggleHabilitado } = useConductor()
    const effectiveLoading = loading || localLoading
    const navigate = useNavigate()

    useEffect(() => {
      if (!usuario) {
        navigate('/login')
      }
    }, [usuario, navigate])

    useEffect(() => {
      const t = setTimeout(() => { setDebouncedSearch(searchTerm); setLocalLoading(true) }, 300)
      return () => clearTimeout(t)
    }, [searchTerm])

    const fetchConductoresBackend = useCallback(() => {
      fetchConductores(undefined, {
        page,
        limit: rowsPerPage,
        estado: undefined,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        q: debouncedSearch.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroHabilitado, debouncedSearch, sortBy, fetchConductores])

    useEffect(() => {
      fetchConductoresBackend()
    }, [fetchConductoresBackend])

    useEffect(() => {
      if (!loading) { setLocalLoading(false); initialLoad.current = false }
    }, [loading])

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            setSnackbar({ open: true, message: `Estado actualizado a "${nuevoEstado}".`, severity: 'success' })
        } else {
            setSnackbar({ open: true, message: 'Error al actualizar el estado.', severity: 'error' })
        }
    }

    const handleToggleHabilitado = async (id, habilitadoActual) => {
        try {
            await toggleHabilitado(id)
            setSnackbar({
                open: true,
                message: `Conductor ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`,
                severity: 'success',
            })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({ open: true, message: err.message || 'Error al cambiar el estado', severity: 'error' })
            }
        }
    }

    const limpiarFiltros = () => { setSearchTerm(''); setFiltroHabilitado('todo'); setPage(1) }
    const limpiarBusqueda = () => { setSearchTerm(''); setPage(1) }
    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo'

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    return (
        <Box sx={{ p: 3.5 }}>
            {/* -- Encabezado -- */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Conductores
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los conductores registrados en el sistema.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
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

                    {tienePermiso(PERMISOS.REGISTRAR_CONDUCTOR) && (
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
                                '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            }}
                        >
                            Nuevo conductor
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ display: 'inline-flex', backgroundColor: theme.palette.primary.light, borderRadius: 4, p: '4px', gap: '5px' }}>
                    {FILTROS.map(f => (
                        <Button key={f.value} onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
                            size="small" disableElevation disableRipple
                            sx={{
                                borderRadius: 3, textTransform: 'none', fontSize: '0.75rem', px: 2, py: 0.5, minWidth: 0,
                                fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.secondary,
                                boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                border: 'none',
                                '&:hover': { backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent', color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.text.medium, border: 'none' },
                            }}>
                            {f.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small" placeholder="Buscar conductores..."
                        sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 4, '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' } } }}
                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} /></InputAdornment>,
                                endAdornment: searchTerm && <InputAdornment position="end"><IconButton size="small" onClick={limpiarBusqueda}><ClearIcon sx={{ fontSize: 16 }} /></IconButton></InputAdornment>
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* -- Tabla -- */}
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
                                <TableCell sx={thStyle}>Licencia</TableCell>
                                <TableCell sx={thStyle}>Vencimiento</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {effectiveLoading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando conductores...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : !effectiveLoading && conductores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo'
                                                ? 'No se encontraron conductores que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron conductores que coincidan con la búsqueda.'
                                                    : 'No hay conductores registrados en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                conductores.map((conductor) => (
                                    <TableRow key={conductor.idConductor}
                                        sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle }, transition: 'background-color 0.15s', opacity: conductor.habilitado ? 1 : 0.55 }}>
                                        {/* Nombre */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 34, height: 34, backgroundColor: conductor.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg, fontSize: '0.73rem', fontWeight: 700, color: conductor.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color }}>
                                                    {conductor.nombre?.[0] || ''}{conductor.apellido?.[0] || ''}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {conductor.nombre} {conductor.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {/* Identificación */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {conductor.tipoIdentificacion} {conductor.numeroIdentificacion}
                                        </TableCell>
                                        {/* Teléfono */}
                                        <TableCell sx={{ py: 1.5 }}>{conductor.telefono || '-'}</TableCell>
                                        {/* Email */}
                                        <TableCell sx={{ py: 1.5 }}>{conductor.email || '-'}</TableCell>
                                        {/* Licencia */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip label={conductor.licenciaConduccion || '-'} size="small"
                                                sx={{ fontWeight: 600, backgroundColor: '#FEF2F2', color: theme.palette.primary.main, fontSize: '0.7rem' }} />
                                        </TableCell>
                                        {/* Vencimiento */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={conductor.fechaVencimientoLicencia ? new Date(conductor.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                color={isVencido(conductor.fechaVencimientoLicencia) ? 'error' : 'success'}
                                                variant={isVencido(conductor.fechaVencimientoLicencia) ? 'filled' : 'outlined'}
                                                sx={{ fontSize: '0.7rem' }} />
                                        </TableCell>
                                        {/* Estado operativo */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 110 }}>
                                                <Select
                                                    value={conductor.estado || 'activo'}
                                                    onChange={(e) => handleEstadoChange(conductor.idConductor, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{ fontSize: '0.75rem', py: 0.5, color: estadoColor(conductor.estado, theme) }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS_CONDUCTOR.map(e => (
                                                        <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        {/* Acciones */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_CONDUCTOR) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setConductorVer(conductor)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small" onClick={() => { setConductorEditar(conductor); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                                                    <Tooltip title={conductor.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small"
                                                            onClick={() => handleToggleHabilitado(conductor.idConductor, conductor.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            {conductor.habilitado
                                                                ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || '#9E9E9E' }} />}
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, pt: 1.5 }}>
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
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
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            {conductorVer && (
                <ModalConsultarConductor conductor={conductorVer} onClose={() => setConductorVer(null)} />
            )}

            {/* -- Modales registrar / actualizar -- */}
            <RegistrarConductor
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchConductores()
                    setSnackbar({ open: true, message: 'Conductor registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarConductor
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setConductorEditar(null) }}
                conductor={conductorEditar}
                onSuccess={() => {
                    fetchConductores()
                    setSnackbar({ open: true, message: 'Conductor actualizado correctamente', severity: 'success' })
                }}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="conductor"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarConductor

