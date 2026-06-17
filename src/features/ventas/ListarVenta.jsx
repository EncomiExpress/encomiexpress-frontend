import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useCallback } from 'react'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, InputLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { ESTADOS_ENCOMIENDA, METODOS_PAGO, ESTADOS_PAGO } from '../../shared/contexts/VentaContext.jsx'
import RegistrarVenta from './RegistrarVenta'
import ActualizarVenta from './ActualizarVenta'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
        case 'pendiente de recogida': return { bg: '#FEF3C7', color: '#92400E' }
        case 'en recogida': return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'en tránsito': return { bg: '#CFFAFE', color: '#155E75' }
        case 'entregado': return { bg: '#E8F5E9', color: '#2E7D32' }
        case 'devuelto': return { bg: '#FFF4E5', color: '#BF360C' }
        default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

const getPagoColor = (estadoPago) =>
    estadoPago?.toLowerCase() === 'pagado'
        ? { bg: '#D1FAE5', color: '#065F46' }
        : { bg: '#FEE2E2', color: '#991B1B' }

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

const CampoFila = ({ label, value }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>{label}</Typography>
            <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                {String(value ?? '—')}
            </Typography>
        </Box>
    )
}

const ModalConsultar = ({ venta, onClose }) => {
    const theme = useTheme()
    if (!venta) return null
    const estadoStyles = getEstadoColor(venta.estado)
    const pagoStyles = getPagoColor(venta.estadoPago)

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: theme.palette.background.subtle } } }}>

            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Encomienda</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                    Información general de la guía de envío
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 2,
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 45, color: theme.palette.primary.main }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                            {venta.numeroGuia}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                            Factura: {venta.numeroFactura}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.8 }}>
                            <Chip label={venta.estado ? venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1) : '—'} size="small"
                                sx={{ backgroundColor: estadoStyles.bg, color: estadoStyles.color, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10 }} />
                            <Chip label={venta.estadoPago} size="small"
                                sx={{ backgroundColor: pagoStyles.bg, color: pagoStyles.color, fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: 10 }} />
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Fecha de registro</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaRegistro}</Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} display="block" mt={0.8}>Fecha estimada</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaEstimadaEntrega}</Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Remitente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos del cliente que envía
                    </Typography>
                    <CampoFila label="Nombre" value={`${venta.cliente?.nombre} ${venta.cliente?.apellido}`} />
                    <CampoFila label="Identificación" value={`${venta.cliente?.tipoIdentificacion} ${venta.cliente?.numeroIdentificacion}`} />
                    <CampoFila label="Teléfono" value={venta.cliente?.telefono} />
                    <CampoFila label="Dirección" value={venta.cliente?.direccion} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Destinatario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Datos de quien recibe el paquete
                    </Typography>
                    <CampoFila label="Nombre" value={venta.destinatario?.nombreDestinatario} />
                    <CampoFila label="Teléfono" value={venta.destinatario?.telefonoDestinatario} />
                    <CampoFila label="Dirección" value={venta.destinatario?.direccionDestinatario} />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Paquete</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Características del paquete enviado
                    </Typography>
                    <CampoFila label="Contenido" value={venta.paquete?.descripcionContenido} />
                    <CampoFila label="Peso" value={`${venta.paquete?.peso} kg`} />
                    <CampoFila label="Dimensiones" value={`${venta.paquete?.alto}×${venta.paquete?.ancho}×${venta.paquete?.profundidad} cm`} />
                    <CampoFila label="Valor declarado" value={`$${(venta.paquete?.valorDeclarado || 0).toLocaleString()}`} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PaymentOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Pago y Ruta</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Información de pago y ruta de envío
                    </Typography>
                    <CampoFila label="Ruta" value={formatRutaDestino(venta.ruta?.destino)} />
                    <CampoFila label="Método de pago" value={venta.metodoPago} />
                    <CampoFila label="Valor servicio" value={`$${venta.valorServicio?.toLocaleString()}`} />
                    <CampoFila label="Total" value={`$${venta.total?.toLocaleString()}`} />
                </Paper>
            </Box>

            {venta.observaciones && (
                <Paper elevation={0} sx={{ ...cardSx, mt: 2 }}>
                    <Typography variant="subtitle2" color={theme.palette.text.secondary} mb={0.5}>Observaciones</Typography>
                    <Typography variant="body2">{venta.observaciones}</Typography>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

const getFilterSelectSx = (theme) => ({
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
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
    
    const [busqueda, setBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoEncomienda, setFiltroEstadoEncomienda] = useState('todos')
    const [filtroPago, setFiltroPago] = useState('todos')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [ventaEditar, setVentaEditar] = useState(null)

    const fetchVentasBackend = useCallback(() => {
      fetchVentas({
        page,
        limit: rowsPerPage,
        sortBy: 'fechaRegistro.desc',
        estado: filtroEstadoEncomienda === 'todos' ? undefined : filtroEstadoEncomienda,
        estadoPago: filtroPago === 'todos' ? undefined : filtroPago,
        metodoPago: filtroMetodoPago === 'todos' ? undefined : filtroMetodoPago,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        q: busqueda.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroEstadoEncomienda, filtroPago, filtroMetodoPago, filtroHabilitado, busqueda, fetchVentas])

    useEffect(() => {
      fetchVentasBackend()
    }, [fetchVentasBackend])

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
            setSnackbar({
                open: true,
                message: err.message || 'Error al cambiar el estado de habilitación.',
                severity: 'error',
            })
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Ventas
                        </Typography>
                        {!loading && !error && (
                            <Chip
                                label={`${total} registros`}
                                size="small"
                                sx={{
                                    backgroundColor: '#F3F4F6',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 10,
                                }}
                            />
                        )}
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona las ventas y encomiendas registradas en el sistema.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setModalRegistrarOpen(true)}
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
                    Nueva venta
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    Error al cargar las ventas: {error}
                </Alert>
            )}

            <Box sx={{
                display: 'inline-flex',
                backgroundColor: theme.palette.primary.light,
                borderRadius: 4,
                p: '4px',
                mb: 2,
                gap: '5px',
                flexWrap: 'wrap',
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar ventas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
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

                {hayFiltrosActivos && (
                    <Chip
                        label="Limpiar"
                        size="small"
                        icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                    />
                )}

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        ml: 'auto',
                        '&:hover': { backgroundColor: theme.palette.primary.light },
                    }}
                >
                    Exportar
                </Button>
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
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={thStyle}>Pago</TableCell>
                                <TableCell sx={thStyle}>Total</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
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
                            ) : ventas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {total === 0
                                                ? 'No hay ventas registradas en el sistema.'
                                                : 'No se encontraron ventas que coincidan con los filtros aplicados.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ventas.map(venta => {
                                    const estadoStyles = getEstadoColor(venta.estado)
                                    const pagoStyles = getPagoColor(venta.estadoPago)
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
                                                        const style = getEstadoColor(val)
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
                                                        backgroundColor: '#ffffff',
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        border: '1px solid #E0E0E0',
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
                                                        const optionStyles = getEstadoColor(estado)
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
                                                        const style = getPagoColor(val)
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
                                                        backgroundColor: '#ffffff',
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        border: '1px solid #E0E0E0',
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
                                                        const optionStyles = getPagoColor(estado)
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
                                borderRadius: 2,
                                '& .MuiSelect-select': { py: 0.6, pl: 1.5, pr: '28px !important' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
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
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultar venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />

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

