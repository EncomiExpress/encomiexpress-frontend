import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, InputLabel, TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarAnticipoExcedente from './ModalConsultarAnticipoExcedente'
import { getEstadoColorAnticipo as getEstadoColor } from '../../shared/utils/estadoColors.js'
import { formatFecha } from '../../shared/utils/formatters.js'

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
    borderRadius: 4,
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

const FILTROS_HABILITADO = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const FILTROS_ANTICIPO = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'en legalización', label: 'En legalización' },
    { value: 'legalizado', label: 'Legalizado' },
    { value: 'excedente pendiente', label: 'Excedente pendiente' },
    { value: 'cerrado', label: 'Cerrado' },
]

const formatMoney = (val) => {
    const num = parseFloat(val || 0)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
}

// ── Componente principal ─────────────────────────────────────────────────────
const ListarAnticipoExcedente = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterSelectSx = getFilterSelectSx(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { anticipos, total, conductores, rutas, loading, fetchAnticipos, toggleHabilitado, cambiarEstado } = useAnticipos()
    const { tienePermiso, PERMISOS } = useAuth()
    const initialLoad = useRef(true)

    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'fechaEntrega', dir: 'desc' })

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
        setFiltroEstadoAnticipo('todos')
        setPage(1)
    }

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    useEffect(() => {
        fetchAnticipos(undefined, {
            page,
            limit: rowsPerPage,
            q: debouncedBusqueda.trim() || undefined,
            habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
            estado: filtroEstadoAnticipo === 'todos' ? undefined : filtroEstadoAnticipo,
            sortBy: `${sortBy.field}.${sortBy.dir}`,
        })
    }, [page, rowsPerPage, debouncedBusqueda, filtroHabilitado, filtroEstadoAnticipo, sortBy, fetchAnticipos])

    useEffect(() => {
        if (!loading) { initialLoad.current = false }
    }, [loading])

    // Helpers para resolver nombres desde los arrays del contexto
    const getNombreConductor = (id) => {
        const c = conductores.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const currentAnticipos = anticipos
    const hayFiltrosActivos = busqueda.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== 'todos'
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const handleToggleHabilitado = async (id) => {
        try {
            await toggleHabilitado(id)
            setSnackbar({ open: true, message: 'Estado de habilitación actualizado', severity: 'success' })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({ open: true, message: err.message || 'No se pudo cambiar el estado', severity: 'error' })
            }
        }
    }

    const handleCambiarEstadoAnticipo = async (id, nuevoEstado) => {
        try {
            await cambiarEstado(id, nuevoEstado)
            setSnackbar({ open: true, message: 'Estado del anticipo actualizado', severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'No se pudo cambiar el estado', severity: 'error' })
        }
    }

    return (
        <Box sx={{ p: 3.5 }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Anticipos y Excedentes
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los anticipos y excedentes de los conductores.
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

                    {tienePermiso(PERMISOS.REGISTRAR_ANTICIPO) && (
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
                        {FILTROS_HABILITADO.map(f => (
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

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: theme.palette.primary.main } }}>Estado del anticipo</InputLabel>
                        <Select
                            value={filtroEstadoAnticipo}
                            label="Estado del anticipo"
                            onChange={e => { setFiltroEstadoAnticipo(e.target.value); setPage(1) }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={filterSelectSx}
                            MenuProps={filterMenuProps}
                        >
                            {FILTROS_ANTICIPO.map(f => (
                                <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                                    {f.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar anticipos..."
                        sx={{
                            width: 320,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
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

            {/* Tabla */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                <TableCell sx={thStyle}>Conductor</TableCell>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>Anticipo</TableCell>
                                <TableCell sx={thStyle}>Gastado</TableCell>
                                <TableCell sx={thStyle}>Excedente</TableCell>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'fechaEntrega'}
                                        direction={sortBy.field === 'fechaEntrega' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('fechaEntrega')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        F. Entrega
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando anticipos...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : !loading && currentAnticipos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== 'todos'
                                                ? 'No se encontraron anticipos que coincidan con los filtros aplicados.'
                                                : debouncedBusqueda.trim()
                                                    ? 'No se encontraron anticipos que coincidan con la búsqueda.'
                                                    : 'No hay anticipos registrados en el sistema.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentAnticipos.map((anticipo) => {
                                    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
                                    const nombreConductor = getNombreConductor(anticipo.idConductor)
                                    const nombreRuta = getNombreRuta(anticipo.idRuta)

                                    return (
                                        <TableRow
                                            key={anticipo.idAnticipoExcedente}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: anticipo.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            {/* Conductor */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: anticipo.habilitado !== false ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                                        fontSize: '0.73rem', fontWeight: 700,
                                                        color: anticipo.habilitado !== false ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                                    }}>
                                                        {nombreConductor.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                        {nombreConductor}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* Ruta */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.75rem">
                                                    Ruta {anticipo.idRuta}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} fontSize="0.8rem" noWrap>
                                                    {nombreRuta}
                                                </Typography>
                                            </TableCell>

                                            {/* Anticipo */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.secondary.main} fontSize="0.82rem">
                                                    {formatMoney(anticipo.valorAnticipo)}
                                                </Typography>
                                            </TableCell>

                                            {/* Gastado */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2"
                                                    color={anticipo.valorGastado ? theme.palette.text.primary : theme.palette.text.secondary}
                                                    fontSize="0.82rem">
                                                    {anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Excedente / Faltante */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                {anticipo.valorGastado ? (
                                                    <Typography variant="body2" fontWeight={600} fontSize="0.82rem"
                                                        color={excedente >= 0 ? '#2E7D32' : theme.palette.primary.main}>
                                                        {excedente >= 0 ? '+' : '-'}{formatMoney(Math.abs(excedente))}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.82rem">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Fecha entrega */}
                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary, py: 1.5 }}>
                                                {formatFecha(anticipo.fechaEntrega)}
                                            </TableCell>

                                            {/* Estado (select inline) */}
                                            <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                                                <Select
                                                    value={anticipo.estado || 'entregado'}
                                                    onChange={(e) => handleCambiarEstadoAnticipo(anticipo.idAnticipoExcedente, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    renderValue={(val) => {
                                                        const style = getEstadoColor(val)
                                                        return (
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center',
                                                                backgroundColor: style.bg, color: style.color,
                                                                px: 1.2, py: 0.2, borderRadius: 8, fontWeight: 600, fontSize: '0.7rem',
                                                            }}>
                                                                {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
                                                            </Box>
                                                        )
                                                    }}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        backgroundColor: '#ffffff',
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.72rem', fontWeight: 600,
                                                        height: 32, borderRadius: 1,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        '& .MuiSelect-select': { py: 0.8, px: 1, display: 'flex', alignItems: 'center' },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                                    }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {FILTROS_ANTICIPO.filter(f => f.value !== 'todos').map(estado => {
                                                        const style = getEstadoColor(estado.value)
                                                        return (
                                                            <MenuItem key={estado.value} value={estado.value} dense>
                                                                <Box sx={{
                                                                    display: 'inline-flex', alignItems: 'center',
                                                                    backgroundColor: style.bg, color: style.color,
                                                                    px: 1.2, py: 0.2, borderRadius: 8, fontWeight: 600, fontSize: '0.7rem',
                                                                }}>
                                                                    {estado.label}
                                                                </Box>
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_ANTICIPO) && (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton size="small" onClick={() => setAnticipoConsulta(anticipo)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small"
                                                                onClick={() => { setAnticipoEditar(anticipo); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                                                        <Tooltip title={anticipo.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton size="small"
                                                                onClick={() => handleToggleHabilitado(anticipo.idAnticipoExcedente)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                                {anticipo.habilitado !== false
                                                                    ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || '#9CA3AF' }} />
                                                                }
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

            {/* Paginación */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>
                    Mostrando {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary} fontWeight={500}>Filas</Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
                            size="small"
                            renderValue={(value) => value}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 2,
                                '& .MuiSelect-select': { py: 0.6, pl: 1.5, pr: '28px !important' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            {[5, 10, 25].map(n => (
                                <MenuItem key={n} value={n}>
                                    {n}
                                    {rowsPerPage === n && <CheckBoxIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
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
                                fontSize: '0.82rem', borderRadius: '8px', minWidth: 34, height: 34, mx: 0.2,
                                color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': { border: 'none' },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: theme.palette.primary.main, borderColor: theme.palette.primary.main,
                                color: 'white', fontWeight: 600,
                                '&:hover': { backgroundColor: theme.palette.primary.darker },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: theme.palette.background.subtle, borderColor: theme.palette.divider,
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Modales */}
            <ModalConsultarAnticipoExcedente
                anticipo={anticipoConsulta}
                conductores={conductores}
                rutas={rutas}
                onClose={() => setAnticipoConsulta(null)}
            />

            <RegistrarAnticipoExcedente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => setSnackbar({ open: true, message: 'Anticipo registrado correctamente', severity: 'success' })}
            />

            <ActualizarAnticipoExcedente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setAnticipoEditar(null) }}
                anticipo={anticipoEditar}
                onSuccess={() => setSnackbar({ open: true, message: 'Anticipo actualizado correctamente', severity: 'success' })}
            />

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="anticipo"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarAnticipoExcedente

