import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar, CircularProgress,
    Pagination, TableSortLabel, Tabs, Tab
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import * as rutaService from '../../shared/services/rutaService'
import * as anticipoService from '../../shared/services/anticipoService'
import * as vehiculoService from '../../shared/services/vehiculoService'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'

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
    const [tabCondIndex, setTabCondIndex] = useState(0)
    const [tabCondRutas, setTabCondRutas] = useState({ data: [], loading: false })
    const [tabCondAnticipos, setTabCondAnticipos] = useState({ data: [], loading: false })
    const [tabCondVehiculos, setTabCondVehiculos] = useState({ data: [], loading: false })
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

    useEffect(() => {
        if (!conductorVer || tabCondIndex !== 1) return
        setTabCondRutas({ data: [], loading: true })
        rutaService.getRutas({ idConductor: conductorVer.idConductor, limit: 100 })
            .then(res => setTabCondRutas({ data: res?.data || [], loading: false }))
            .catch(() => setTabCondRutas({ data: [], loading: false }))
    }, [conductorVer, tabCondIndex])

    useEffect(() => {
        if (!conductorVer || tabCondIndex !== 2) return
        setTabCondAnticipos({ data: [], loading: true })
        anticipoService.getAnticipos(undefined, { idConductor: conductorVer.idConductor, limit: 100 })
            .then(res => setTabCondAnticipos({ data: res?.data || [], loading: false }))
            .catch(() => setTabCondAnticipos({ data: [], loading: false }))
    }, [conductorVer, tabCondIndex])

    useEffect(() => {
        if (!conductorVer || tabCondIndex !== 3) return
        setTabCondVehiculos({ data: [], loading: true })
        vehiculoService.getVehiculos(undefined, { idConductor: conductorVer.idConductor, limit: 100 })
            .then(res => setTabCondVehiculos({ data: res?.data || [], loading: false }))
            .catch(() => setTabCondVehiculos({ data: [], loading: false }))
    }, [conductorVer, tabCondIndex])

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

            {/* -- Modal detalle -- */}
            {conductorVer && (
                <Dialog open onClose={() => { setConductorVer(null); setTabCondIndex(0) }} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, backgroundColor: theme.palette.background.subtle } } }}>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{
                                backgroundColor: conductorVer.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                color: conductorVer.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                            }}>
                                {(conductorVer.nombre?.[0] || '').toUpperCase()}{(conductorVer.apellido?.[0] || '').toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                                    {conductorVer.nombre} {conductorVer.apellido}
                                </Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary}>Conductor</Typography>
                            </Box>
                        </Box>
                        <Tabs value={tabCondIndex} onChange={(_, v) => setTabCondIndex(v)} textColor="primary" indicatorColor="primary">
                            <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                            <Tab label="Vehículos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                        </Tabs>
                    </Box>

                    {tabCondIndex === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Identificación</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.tipoIdentificacion} {conductorVer.numeroIdentificacion}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.nombre}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.apellido}</Typography></Box>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.telefono || '—'}</Typography></Box>
                                    </Box>
                                </Paper>
                                <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                        <Typography fontWeight={700} fontSize="0.95rem">Licencia</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                        <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>N° Licencia</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.licenciaConduccion || '—'}</Typography></Box>
                                        <Box>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vencimiento</Typography>
                                            <Typography variant="body2" fontWeight={500} color={isVencido(conductorVer.fechaVencimientoLicencia) ? '#ef4444' : '#2E7D32'}>
                                                {conductorVer.fechaVencimientoLicencia ? new Date(conductorVer.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                            <Typography variant="body2" fontWeight={500} color={estadoColor(conductorVer.estado, theme)}>
                                                {conductorVer.estado ? conductorVer.estado.charAt(0).toUpperCase() + conductorVer.estado.slice(1) : '—'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}

                    {tabCondIndex === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Rutas asignadas a este conductor</Typography>
                            {tabCondRutas.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabCondRutas.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin rutas registradas</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Nombre</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Destino</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Fecha salida</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabCondRutas.data.map(r => (
                                                <TableRow key={r.idRuta} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.idRuta}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{r.nombreRuta || '—'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{r.destino?.ciudad || '—'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{r.fechaSalida ? new Date(r.fechaSalida).toLocaleDateString() : '—'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={r.estado} size="small" sx={{
                                                            backgroundColor: r.estado === 'Programada' ? '#E3F2FD' : r.estado === 'En Curso' ? '#FFF3E0' : r.estado === 'Completada' ? '#E8F5E9' : '#FCE4EC',
                                                            color: r.estado === 'Programada' ? '#1565C0' : r.estado === 'En Curso' ? '#E65100' : r.estado === 'Completada' ? '#2E7D32' : '#C62828',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    {tabCondIndex === 2 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Anticipos registrados para este conductor</Typography>
                            {tabCondAnticipos.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabCondAnticipos.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin anticipos registrados</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gastado</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabCondAnticipos.data.map(a => (
                                                <TableRow key={a.idAnticipoExcedente} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.idAnticipoExcedente}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
                                                    <TableCell>
                                                        <Chip label={a.estado} size="small" sx={{
                                                            backgroundColor: a.estado === 'pendiente' ? '#FFF3E0' : a.estado === 'liquidado' ? '#E8F5E9' : '#E3F2FD',
                                                            color: a.estado === 'pendiente' ? '#E65100' : a.estado === 'liquidado' ? '#2E7D32' : '#1565C0',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    {tabCondIndex === 3 && (
                        <Box sx={{ p: 3 }}>
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Vehículos asignados a este conductor</Typography>
                            {tabCondVehiculos.loading
                                ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                                : tabCondVehiculos.data.length === 0
                                ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin vehículos registrados</Typography>
                                : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Placa</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Marca / Modelo</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Tipo</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Habilitado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tabCondVehiculos.data.map(v => (
                                                <TableRow key={v.idVehiculo} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                    <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.placa}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{v.marca} {v.modelo}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.82rem' }}>{v.tipo || '—'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={v.estado || '—'} size="small" sx={{
                                                            backgroundColor: v.estado === 'disponible' ? '#E3F2FD' : v.estado === 'ocupado' ? '#FFF3E0' : '#FCE4EC',
                                                            color: v.estado === 'disponible' ? '#1565C0' : v.estado === 'ocupado' ? '#E65100' : '#C62828',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={v.habilitado ? 'Habilitado' : 'Inhabilitado'} size="small" sx={{
                                                            backgroundColor: v.habilitado ? '#E8F5E9' : '#F5F5F5',
                                                            color: v.habilitado ? '#2E7D32' : '#757575',
                                                            fontWeight: 600, fontSize: '0.72rem'
                                                        }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                        <Button onClick={() => { setConductorVer(null); setTabCondIndex(0) }} variant="contained"
                            sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none', boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
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

