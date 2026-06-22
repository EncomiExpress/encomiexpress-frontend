import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
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
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { ESTADOS_ENCOMIENDA, METODOS_PAGO, ESTADOS_PAGO } from '../../shared/contexts/VentaContext.jsx'
import RegistrarVenta from './RegistrarVenta'
import ActualizarVenta from './ActualizarVenta'
import ModalBloqueoInhabilitacion from '../../shared/components/ModalBloqueoInhabilitacion'
import ModalConsultarVenta from './ModalConsultarVenta'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
})

const getEstadoColor = (estado, theme) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente de recogida': return theme.palette.status.ventaPendiente
        case 'en recogida': return theme.palette.status.ventaEnRecogida
        case 'programada': return theme.palette.status.ventaProgramada
        case 'en tránsito': return theme.palette.status.ventaEnTransito
        case 'entregado': return theme.palette.status.ventaEntregadaAlt
        case 'devuelto': return theme.palette.status.ventaDevueltaAlt
        default: return theme.palette.status.neutral
    }
}

const getPagoColor = (estadoPago, theme) =>
    estadoPago?.toLowerCase() === 'pagado'
        ? theme.palette.status.pagado
        : theme.palette.status.pendientePago

const formatRutaDestino = (destino) => {
    if (!destino) return '—'
    if (typeof destino === 'string') return destino
    if (typeof destino === 'object') {
        if (destino.ciudad || destino.departamento) {
            return `${destino.ciudad || ''}${destino.ciudad && destino.departamento ? ' — ' : ''}${destino.departamento || ''}`.trim() || '—'
        }
        return destino.nombre || String(destino.idDestino ?? destino.id ?? '—')
    }
    return String(destino)
}

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

const ListarVenta = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterSelectSx = getFilterSelectSx(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { ventas, total, loading, error, fetchVentas, cambiarEstadoVenta, actualizarVenta, toggleHabilitadoVenta } = useVentas()
    const initialLoad = useRef(true)

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
    const [modalBloqueo, setModalBloqueo] = useState({ open: false, dependencias: [], mensaje: '' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [ventaEditar, setVentaEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'fechaRegistro', dir: 'desc' })

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

    const handleToggleHabilitado = async (id) => {
        try {
            const actualizada = await toggleHabilitadoVenta(id)
            setSnackbar({
                open: true,
                message: `Venta ${actualizada?.habilitado ? 'habilitada' : 'inhabilitada'} correctamente.`,
                severity: 'success',
            })
        } catch (err) {
            if (err?.details?.length > 0) {
                setModalBloqueo({ open: true, dependencias: err.details, mensaje: err.message })
            } else {
                setSnackbar({
                    open: true,
                    message: err.message || 'Error al cambiar el estado de habilitación.',
                    severity: 'error',
                })
            }
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
                        Nueva venta
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    No se pudieron cargar las ventas. Verifica la conexión con el servidor.
                </Alert>
            )}

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
                            <MenuItem value="pagado">Pagado</MenuItem>
                            <MenuItem value="pendiente">Pendiente</MenuItem>
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
                                    const estadoStyles = getEstadoColor(venta.estado, theme)
                                    const pagoStyles = getPagoColor(venta.estadoPago, theme)
                                    return (
                                        <TableRow
                                            key={venta.idEncomiendaVenta}
                                            sx={{
                                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                                                transition: 'background-color 0.15s',
                                                opacity: venta.habilitado ? 1 : 0.55,
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
                                                {formatRutaDestino(venta.ruta?.destino)}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, minWidth: 160 }}>
                                                <Select
                                                    value={venta.estado || ''}
                                                    onChange={(e) => handleEstadoChange(venta.idEncomiendaVenta, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    renderValue={(val) => {
                                                        const style = getEstadoColor(val, theme)
                                                        return (
                                                            <Box sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                backgroundColor: style.bg,
                                                                color: style.color,
                                                                px: 1.2,
                                                                py: 0.2,
                                                                borderRadius: 8,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                            }}>
                                                                {val ? val.charAt(0).toUpperCase() + val.slice(1) : '—'}
                                                            </Box>
                                                        )
                                                    }}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        '& .MuiSelect-select': {
                                                            py: 0.8,
                                                            px: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                                    }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS_ENCOMIENDA.map(estado => {
                                                        const optionStyles = getEstadoColor(estado, theme)
                                                        return (
                                                            <MenuItem key={estado} value={estado} dense>
                                                                <Box sx={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    backgroundColor: optionStyles.bg,
                                                                    color: optionStyles.color,
                                                                    px: 1.2,
                                                                    py: 0.2,
                                                                    borderRadius: 8,
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                }}>
                                                                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                                                </Box>
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, minWidth: 140 }}>
                                                <Select
                                                    value={venta.estadoPago || ESTADOS_PAGO[0]}
                                                    onChange={(e) => handlePagoChange(venta.idEncomiendaVenta, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    renderValue={(val) => {
                                                        const style = getPagoColor(val, theme)
                                                        return (
                                                            <Box sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                backgroundColor: style.bg,
                                                                color: style.color,
                                                                px: 1.2,
                                                                py: 0.2,
                                                                borderRadius: 8,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                            }}>
                                                                {val}
                                                            </Box>
                                                        )
                                                    }}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        '& .MuiSelect-select': {
                                                            py: 0.8,
                                                            px: 1.3,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                        '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                                    }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS_PAGO.map(estado => {
                                                        const optionStyles = getPagoColor(estado, theme)
                                                        return (
                                                            <MenuItem key={estado} value={estado} dense>
                                                                <Box sx={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    backgroundColor: optionStyles.bg,
                                                                    color: optionStyles.color,
                                                                    px: 1.2,
                                                                    py: 0.2,
                                                                    borderRadius: 8,
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                }}>
                                                                    {estado}
                                                                </Box>
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.palette.primary.main, py: 1.5 }}>
                                                ${venta.total?.toLocaleString()}
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setVentaConsulta(venta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => { setVentaEditar(venta); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={venta.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleToggleHabilitado(venta.idEncomiendaVenta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            {venta.habilitado ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status.disabled2.color }} />}
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
    borderRadius: 4,
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

            <ModalBloqueoInhabilitacion
                open={modalBloqueo.open}
                onClose={() => setModalBloqueo({ open: false, dependencias: [], mensaje: '' })}
                entidad="venta"
                mensaje={modalBloqueo.mensaje}
                dependencias={modalBloqueo.dependencias}
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

export default ListarVenta

