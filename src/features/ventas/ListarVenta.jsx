import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, InputLabel, TableSortLabel,
    Menu, Dialog, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import { ESTADOS_ENCOMIENDA, METODOS_PAGO, ESTADOS_PAGO } from '../../shared/contexts/VentaContext.jsx'
import { getPageOfEncomienda } from '../../shared/services/ventaService'
import RegistrarVenta from './RegistrarVenta'
import ActualizarVenta from './ActualizarVenta'
import ModalInhabilitarVenta from './ModalInhabilitarVenta'
import ModalConsultarVenta from './ModalConsultarVenta'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { formatRutaDestino } from '../../shared/utils/formatters.js'

const VentaEstadoDot = ({ estado }) => {
    const info = getVentaEstadoDot(estado)
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {info.type === 'circle' ? (
                <Box sx={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: info.fill ? info.color : 'transparent',
                    border: `2px solid ${info.color}`,
                }} />
            ) : (
                <Box sx={{
                    width: 14, height: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    fontSize: info.char === '✓' ? '0.75rem' : '1rem',
                    fontWeight: 700, color: info.color, lineHeight: 1,
                }}>
                    {info.char}
                </Box>
            )}
            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: info.color }}>
                {info.label}
            </Typography>
        </Box>
    )
}

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
                    '&:hover': { backgroundColor: theme.palette.action.hover },
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

const ListarVenta = () => {
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
    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfEncomienda(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])
    const { ventas, total, loading, error, fetchVentas, cambiarEstadoVenta, actualizarVenta, toggleHabilitadoVenta } = useVentas()
    const initialLoad = useRef(true)
    const pendingConfirm = useRef(false)

    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoEncomienda, setFiltroEstadoEncomienda] = useState('todos')
    const [filtroPago, setFiltroPago] = useState('todos')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, venta: null })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [ventaEditar, setVentaEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'fechaRegistro', dir: 'desc' })
    const [pagoMenuAnchor, setPagoMenuAnchor] = useState(null)
    const [pagoMenuId, setPagoMenuId] = useState(null)
    const [confirmPago, setConfirmPago] = useState({ open: false, id: null })
    const [estadoMenuAnchor, setEstadoMenuAnchor] = useState(null)
    const [estadoMenuId, setEstadoMenuId] = useState(null)
    const [confirmCancelar, setConfirmCancelar] = useState({ open: false, id: null })

    useEffect(() => {
      const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
      return () => clearTimeout(t)
    }, [busqueda])

    const fetchVentasBackend = useCallback(() => {
      fetchVentas(undefined, {
        page,
        limit: rowsPerPage,
        sortBy: `${sortBy.field}.${sortBy.dir}`,
        estado: filtroEstadoEncomienda === 'todos' ? undefined : filtroEstadoEncomienda,
        estadoPago: filtroPago === 'todos' ? undefined : filtroPago,
        metodoPago: filtroMetodoPago === 'todos' ? undefined : filtroMetodoPago,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        q: debouncedBusqueda.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroEstadoEncomienda, filtroPago, filtroMetodoPago, filtroHabilitado, debouncedBusqueda, sortBy, fetchVentas])

    useEffect(() => {
      fetchVentasBackend()
    }, [fetchVentasBackend])

    useEffect(() => {
      if (!loading) { initialLoad.current = false }
    }, [loading])

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
        setFiltroEstadoEncomienda('todos')
        setFiltroPago('todos')
        setFiltroMetodoPago('todos')
        setPage(1)
    }

    const hayFiltrosActivos = busqueda || filtroHabilitado !== 'todo' || filtroEstadoEncomienda !== 'todos' || filtroPago !== 'todos' || filtroMetodoPago !== 'todos'

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await cambiarEstadoVenta(id, nuevoEstado)
            setSnackbar({
                open: true,
                message: `Estado actualizado a ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}.`,
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Error al cambiar el estado de la encomienda.',
                severity: 'error',
            })
        }
    }

    const handlePagoChange = async (id, nuevoPago) => {
        try {
            await actualizarVenta(id, { estadoPago: nuevoPago })
            setSnackbar({
                open: true,
                message: `Estado de pago actualizado a ${nuevoPago}.`,
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Error al cambiar el estado de pago.',
                severity: 'error',
            })
        }
    }

    const handlePagoConfirm = async () => {
        await handlePagoChange(confirmPago.id, 'Pagado')
        setConfirmPago({ open: false, id: null })
    }

    const handleCancelarConfirm = async () => {
        await handleEstadoChange(confirmCancelar.id, 'Cancelada')
        setConfirmCancelar({ open: false, id: null })
    }

    const handleToggleHabilitado = (venta) => {
        setModalInhabilitar({ open: true, venta })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
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
                        Ventas
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las ventas y encomiendas registradas en el sistema.
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

                    <FormControl size="small" sx={{ width: 160 }}>
                        <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: theme.palette.primary.main } }}>Estado encomienda</InputLabel>
                        <Select value={filtroEstadoEncomienda} label="Estado encomienda"
                            onChange={e => { setFiltroEstadoEncomienda(e.target.value); setPage(1) }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={filterSelectSx}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="todos">Todos</MenuItem>
                            {ESTADOS_ENCOMIENDA.map(estado => (
                                <MenuItem key={estado} value={estado}>
                                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: theme.palette.primary.main } }}>Estado pago</InputLabel>
                        <Select value={filtroPago} label="Estado pago"
                            onChange={e => { setFiltroPago(e.target.value); setPage(1) }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={filterSelectSx}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="Pagado">Pagado</MenuItem>
                            <MenuItem value="Pendiente">Pendiente</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: theme.palette.primary.main } }}>Método de pago</InputLabel>
                        <Select value={filtroMetodoPago} label="Método de pago"
                            onChange={e => { setFiltroMetodoPago(e.target.value); setPage(1) }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={filterSelectSx}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="todos">Todos</MenuItem>
                            {METODOS_PAGO.map(mp => (
                                <MenuItem key={mp} value={mp}>{mp}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar ventas..."
                        sx={{
                            width: 320,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main, borderWidth: '1px',
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
                                <TableCell sx={thStyle}>Remitente</TableCell>
                                <TableCell sx={thStyle}>Guía</TableCell>
                                <TableCell sx={thStyle}>Destinatario</TableCell>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'estado'}
                                        direction={sortBy.field === 'estado' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('estado')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Estado
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Pago</TableCell>
                                <TableCell sx={thStyle}>Total</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando ventas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar las ventas. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && ventas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroEstadoEncomienda !== 'todos' || filtroPago !== 'todos' || filtroMetodoPago !== 'todos'
                                                ? 'No se encontraron ventas que coincidan con los filtros aplicados.'
                                                : debouncedBusqueda.trim()
                                                    ? 'No se encontraron ventas que coincidan con la búsqueda.'
                                                    : 'No hay ventas registradas en el sistema.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ventas.map(venta => {
                                    const isHighlighted = highlightId && String(venta.idEncomiendaVenta) === String(highlightId)
                                    return (
                                        <TableRow
                                            key={venta.idEncomiendaVenta}
                                            ref={isHighlighted ? highlightRef : null}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: venta.habilitado ? 1 : 0.55,
                                                ...(isHighlighted && {
                                                    animation: 'highlightPulse 1.1s ease-in-out 4',
                                                    '@keyframes highlightPulse': {
                                                        '0%, 100%': { backgroundColor: 'transparent' },
                                                        '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                    },
                                                }),
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: venta.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                                                        fontSize: '0.73rem',
                                                        fontWeight: 700,
                                                        color: venta.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                                                    }}>
                                                        {venta.cliente?.nombre?.[0]}{venta.cliente?.apellido?.[0]}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                        {venta.cliente?.nombre} {venta.cliente?.apellido}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.secondary.main}>
                                                    {venta.numeroGuia}
                                                </Typography>
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {venta.fechaRegistro}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                                {venta.destinatario?.nombreDestinatario}
                                            </TableCell>

                                                                    <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <span>{formatRutaDestino(venta.ruta?.destino)}</span>
                                                    {venta.estado === 'Programada' && venta.ruta?.estado === 'Cancelada' && (
                                                        <Chip
                                                            label="Ruta cancelada · Reasignar"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#FFF7ED',
                                                                color: '#EA580C',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                                height: 20,
                                                                width: 'fit-content',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, minWidth: 155 }}>
                                                {venta.estado === 'Programada' ? (
                                                    <Box
                                                        onClick={(e) => { e.stopPropagation(); setEstadoMenuAnchor(e.currentTarget); setEstadoMenuId(venta.idEncomiendaVenta) }}
                                                        sx={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                            border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5,
                                                            px: 1, py: 0.3, cursor: 'pointer',
                                                            '&:hover': { backgroundColor: theme.palette.action.hover },
                                                        }}
                                                    >
                                                        <VentaEstadoDot estado="Programada" />
                                                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 13, color: theme.palette.text.secondary }} />
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ pl: 1 }}><VentaEstadoDot estado={venta.estado} /></Box>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, minWidth: 130 }}>
                                                {(venta.estadoPago === 'Pagado' || venta.estado === 'Cancelada') ? (
                                                    venta.estadoPago === 'Pagado' ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                                                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#059669' }}>Pagado</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                                                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                                                        </Box>
                                                    )
                                                ) : (
                                                    <Box
                                                        onClick={(e) => { e.stopPropagation(); setPagoMenuAnchor(e.currentTarget); setPagoMenuId(venta.idEncomiendaVenta) }}
                                                        sx={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 0.75,
                                                            border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5,
                                                            px: 1, py: 0.3, cursor: 'pointer',
                                                            '&:hover': { backgroundColor: theme.palette.action.hover },
                                                        }}
                                                    >
                                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                                                        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 13, color: theme.palette.text.secondary, ml: 0.25 }} />
                                                    </Box>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.palette.primary.main, py: 1.5 }}>
                                                ${venta.total?.toLocaleString()}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setVentaConsulta(venta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => { setVentaEditar(venta); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={venta.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleToggleHabilitado(venta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                                        >
                                                            {venta.habilitado
                                                                ? <BlockOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                : <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#059669' }} />
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
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
                                    borderColor: theme.palette.primary.main, borderWidth: '1px',
                                },
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
                                                '&:hover': { backgroundColor: theme.palette.action.hover },
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
                            '& .MuiPaginationItem-ellipsis': { border: 'none' },
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

            <ModalConsultarVenta venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />

            <RegistrarVenta
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    setModalRegistrarOpen(false)
                    setSnackbar({ open: true, message: 'Venta registrada correctamente.', severity: 'success' })
                }}
            />

            <ActualizarVenta
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVentaEditar(null) }}
                venta={ventaEditar}
                onSuccess={() => {
                    setModalActualizarOpen(false)
                    setVentaEditar(null)
                    setSnackbar({ open: true, message: 'Venta actualizada correctamente.', severity: 'success' })
                }}
            />

            <ModalInhabilitarVenta
                open={modalInhabilitar.open}
                venta={modalInhabilitar.venta}
                onClose={() => setModalInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => {
                    const venta = modalInhabilitar.venta
                    const wasPending = pendingConfirm.current
                    pendingConfirm.current = false
                    setModalInhabilitar({ open: false, venta: null })
                    if (wasPending && venta) {
                        const habilitadoActual = venta.habilitado
                        toggleHabilitadoVenta(venta.idEncomiendaVenta)
                            .then(() => setSnackbar({ open: true, message: `Venta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, severity: habilitadoActual ? 'warning' : 'success' }))
                            .catch(() => {})
                    }
                }}
                onConfirm={handleConfirmarToggle}
            />

            <Menu
                anchorEl={estadoMenuAnchor}
                open={Boolean(estadoMenuAnchor)}
                onClose={() => { setEstadoMenuAnchor(null); setEstadoMenuId(null) }}
                onClick={(e) => e.stopPropagation()}
                autoFocus={false}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mt: 0.5, minWidth: 150 } } }}
            >
                <MenuItem
                    dense
                    onClick={() => { const id = estadoMenuId; setEstadoMenuAnchor(null); setEstadoMenuId(null); setConfirmCancelar({ open: true, id }) }}
                    sx={{ gap: 0.75, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                >
                    <VentaEstadoDot estado="Cancelada" />
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={pagoMenuAnchor}
                open={Boolean(pagoMenuAnchor)}
                onClose={() => { setPagoMenuAnchor(null); setPagoMenuId(null) }}
                onClick={(e) => e.stopPropagation()}
                autoFocus={false}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', mt: 0.5, minWidth: 130 } } }}
            >
                <MenuItem
                    dense
                    onClick={() => { setPagoMenuAnchor(null); setConfirmPago({ open: true, id: pagoMenuId }); setPagoMenuId(null) }}
                    sx={{ gap: 0.75, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                >
                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>Pagado</Typography>
                </MenuItem>
            </Menu>

            <Dialog
                open={confirmCancelar.open}
                onClose={() => setConfirmCancelar({ open: false, id: null })}
                maxWidth="xs"
                fullWidth
                onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
            >
                <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
                    <IconButton
                        onClick={() => setConfirmCancelar({ open: false, id: null })}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: '#3F3F4622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SwapHorizOutlinedIcon sx={{ fontSize: 35, color: '#3F3F46' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                                Cambiar estado
                            </Typography>
                            <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                                ¿Seguro que deseas cambiarlo a{' '}
                                <Box component="span" sx={{ fontWeight: 700, color: '#3F3F46' }}>Cancelada</Box>?
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                    <Button
                        onClick={() => setConfirmCancelar({ open: false, id: null })}
                        disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                            borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCancelarConfirm}
                        variant="contained"
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            px: 5, py: 0.76, fontSize: '0.875rem',
                            backgroundColor: '#3F3F46',
                            '&:hover': { backgroundColor: '#3F3F46', filter: 'brightness(0.88)' },
                        }}
                    >
                        Confirmar
                    </Button>
                </Box>
            </Dialog>

            <Dialog
                open={confirmPago.open}
                onClose={() => setConfirmPago({ open: false, id: null })}
                maxWidth="xs"
                fullWidth
                onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
            >
                <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
                    <IconButton
                        onClick={() => setConfirmPago({ open: false, id: null })}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: '#05996920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PaidOutlinedIcon sx={{ fontSize: 35, color: '#059669' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                                Confirmar pago
                            </Typography>
                            <Typography fontWeight={700} fontSize="0.8rem" color={theme.palette.text.secondary}>
                                Estado irreversible.
                            </Typography>
                            <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                                ¿Marcar esta venta como{' '}
                                <Box component="span" sx={{ fontWeight: 700, color: '#059669' }}>Pagada</Box>?
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                    <Button
                        onClick={() => setConfirmPago({ open: false, id: null })}
                        disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                            borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handlePagoConfirm}
                        variant="contained"
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600,
                            px: 5, py: 0.76, fontSize: '0.875rem',
                            backgroundColor: '#059669',
                            '&:hover': { backgroundColor: '#059669', filter: 'brightness(0.88)' },
                        }}
                    >
                        Confirmar
                    </Button>
                </Box>
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

export default ListarVenta

