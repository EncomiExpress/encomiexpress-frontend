import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, InputLabel, TableSortLabel,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'
import ModalInhabilitarAnticipo from './ModalInhabilitarAnticipo'
import ModalConsultarAnticipoExcedente from './ModalConsultarAnticipoExcedente'
import { getEstadoColorAnticipo as getEstadoColor, getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'
import { getPageOfAnticipo } from '../../shared/services/anticipoService'
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
    { value: 'Entregado', label: 'Entregado' },
    { value: 'En Legalización', label: 'En Legalización' },
    { value: 'Excedente pendiente', label: 'Excedente pendiente' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' },
]

const AnticipoEstadoDot = ({ estado }) => {
    const info = getAnticipoEstadoDot(estado)
    if (info.type === 'symbol') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>
                    {info.char}
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>{info.label}</Typography>
            </Box>
        )
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>{info.label}</Typography>
        </Box>
    )
}

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
    const [searchParams] = useSearchParams()
    const highlightId = searchParams.get('highlight')
    const highlightRef = useRef(null)
    const hasScrolled = useRef(false)
    const hasNavigated = useRef(false)
    useEffect(() => {
        if (highlightId && highlightRef.current && !hasScrolled.current) {
            hasScrolled.current = true
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
        }
    })
    const { anticipos, total, conductores, rutas, loading, error, fetchAnticipos, toggleHabilitado, cambiarEstado } = useAnticipos()
    const { tienePermiso, PERMISOS } = useAuth()
    const initialLoad = useRef(true)
    const pendingConfirm = useRef(false)

    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, anticipo: null })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'fechaEntrega', dir: 'desc' })
    const [confirmLeg, setConfirmLeg] = useState({ open: false, id: null, nuevoEstado: null })
    const [confirmDev, setConfirmDev] = useState({ open: false, id: null })

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfAnticipo(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])

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

    const currentAnticipos = anticipos
    const hayFiltrosActivos = busqueda.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== 'todos'
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, total)

    const handleToggleHabilitado = (anticipo) => {
        setModalInhabilitar({ open: true, anticipo })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const ejecutarCambioEstadoAnticipo = async (id, nuevoEstado) => {
        try {
            await cambiarEstado(id, nuevoEstado)
            setSnackbar({ open: true, message: 'Estado del anticipo actualizado', severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'No se pudo cambiar el estado', severity: 'error' })
        }
    }

    const handleCambiarEstadoAnticipo = (id, nuevoEstado) => {
        if (nuevoEstado === 'En Legalización') {
            setConfirmLeg({ open: true, id, nuevoEstado })
            return
        }
        ejecutarCambioEstadoAnticipo(id, nuevoEstado)
    }

    const handleConfirmarDevolucion = async () => {
        await ejecutarCambioEstadoAnticipo(confirmDev.id, 'Completado')
        setConfirmDev({ open: false, id: null })
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
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los anticipos. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
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

                                    const isHighlighted = highlightId && String(anticipo.idAnticipoExcedente) === String(highlightId)
                                    return (
                                        <TableRow
                                            key={anticipo.idAnticipoExcedente}
                                            ref={isHighlighted ? highlightRef : null}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: anticipo.habilitado !== false ? 1 : 0.55,
                                                ...(isHighlighted && {
                                                    animation: 'highlightPulse 1.1s ease-in-out 4',
                                                    '@keyframes highlightPulse': {
                                                        '0%, 100%': { backgroundColor: 'transparent' },
                                                        '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                    },
                                                }),
                                            }}
                                        >
                                            {/* Conductor */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {nombreConductor}
                                                </Typography>
                                            </TableCell>

                                            {/* Ruta */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }} noWrap>
                                                    {anticipo.ruta?.nombreRuta || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Anticipo */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={formatMoney(anticipo.valorAnticipo)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                        color: theme.palette.secondary.main,
                                                        fontSize: '0.7rem',
                                                        borderRadius: '2px',
                                                        height: 24,
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Gastado */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                {anticipo.valorGastado ? (
                                                    <Chip
                                                        label={`-${formatMoney(anticipo.valorGastado)}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                            color: theme.palette.warning.dark,
                                                            fontSize: '0.7rem',
                                                            borderRadius: '2px',
                                                            height: 24,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.82rem">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Excedente / Faltante */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                {anticipo.valorGastado ? (
                                                    <Chip
                                                        label={`${excedente >= 0 ? '+' : '-'}${formatMoney(Math.abs(excedente))}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            backgroundColor: alpha(excedente >= 0 ? theme.palette.success.main : theme.palette.primary.main, 0.1),
                                                            color: excedente >= 0 ? theme.palette.success.dark : theme.palette.primary.main,
                                                            fontSize: '0.7rem',
                                                            borderRadius: '2px',
                                                            height: 24,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color={theme.palette.text.secondary} fontSize="0.82rem">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Fecha entrega */}
                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary, py: 1.5 }}>
                                                {formatFecha(anticipo.fechaEntrega)}
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                    <AnticipoEstadoDot estado={anticipo.estado} />
                                                    {anticipo.estado === 'Excedente pendiente' && tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                                                        <Button size="small" variant="outlined"
                                                            onClick={() => setConfirmDev({ open: true, id: anticipo.idAnticipoExcedente })}
                                                            sx={{ fontSize: '0.68rem', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 1, py: 0.2, borderColor: '#059669', color: '#059669', '&:hover': { backgroundColor: '#f0fdf4', borderColor: '#059669' }, lineHeight: 1.4 }}>
                                                            Confirmar devolución
                                                        </Button>
                                                    )}
                                                </Box>
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
                                                    {tienePermiso(PERMISOS.INHABILITAR_ANTICIPO) && (
                                                        <Tooltip title={anticipo.habilitado !== false ? 'Inhabilitar' : 'Habilitar'}>
                                                            <IconButton size="small"
                                                                onClick={() => handleToggleHabilitado(anticipo)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                                {anticipo.habilitado !== false
                                                                    ? <BlockOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    : <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#059669' }} />
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
                                    {rowsPerPage === n && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
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

            <ModalInhabilitarAnticipo
                open={modalInhabilitar.open}
                anticipo={modalInhabilitar.anticipo}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => {
                    const anticipo = modalInhabilitar.anticipo
                    const wasPending = pendingConfirm.current
                    pendingConfirm.current = false
                    setModalInhabilitar({ open: false, anticipo: null })
                    if (wasPending && anticipo) {
                        const habilitadoActual = anticipo.habilitado === true
                        toggleHabilitado(anticipo.idAnticipoExcedente)
                            .then(() => setSnackbar({ open: true, message: habilitadoActual ? 'Anticipo inhabilitado' : 'Anticipo habilitado', severity: habilitadoActual ? 'warning' : 'success' }))
                            .catch(() => {})
                    }
                }}
                onConfirm={handleConfirmarToggle}
            />

            {/* Modal confirmación cambio a "En Legalización" */}
            <Dialog
                open={confirmLeg.open}
                onClose={() => setConfirmLeg({ open: false, id: null, nuevoEstado: null })}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 0.5 }}>
                    Confirmar cambio de estado
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                        ¿Cambiar el estado a <strong>"En Legalización"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Una vez en legalización, el anticipo <strong>no puede volver a "Entregado"</strong>. Este cambio es irreversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmLeg({ open: false, id: null, nuevoEstado: null })}
                        variant="outlined" size="small"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            const { id, nuevoEstado } = confirmLeg
                            setConfirmLeg({ open: false, id: null, nuevoEstado: null })
                            ejecutarCambioEstadoAnticipo(id, nuevoEstado)
                        }}
                        variant="contained" size="small"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal confirmación devolución de excedente */}
            <Dialog
                open={confirmDev.open}
                onClose={() => setConfirmDev({ open: false, id: null })}
                maxWidth="xs"
                fullWidth
                onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
            >
                <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
                    <IconButton onClick={() => setConfirmDev({ open: false, id: null })}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: '#05996922', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TaskAltOutlinedIcon sx={{ fontSize: 35, color: '#059669' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                                Confirmar devolución
                            </Typography>
                            <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                                ¿El conductor devolvió el excedente?
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        El anticipo pasará a <strong>Completado</strong>.
                    </Typography>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                    <Button onClick={() => setConfirmDev({ open: false, id: null })} disableRipple sx={{
                        textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                        borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                    }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmarDevolucion} variant="contained" disableRipple sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600,
                        px: 5, py: 0.76, fontSize: '0.875rem',
                        backgroundColor: '#059669',
                        '&:hover': { backgroundColor: '#059669', filter: 'brightness(0.88)' },
                    }}>
                        Confirmar
                    </Button>
                </Box>
            </Dialog>

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

