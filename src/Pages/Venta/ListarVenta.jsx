import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVentas } from '../../Context/VentaContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Avatar, Select, MenuItem, Pagination, Snackbar, Alert,
    CircularProgress, FormControl, InputLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
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
import { ESTADOS_ENCOMIENDA, METODOS_PAGO } from '../../Context/VentaContext'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
    secondary: '#1A2E6E',
    text: '#1a0e0c',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    hoverBg: '#F9F9F9',
}

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: '#1a0e0c',
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'pendiente de recogida': return { bg: '#FEF3C7', color: '#92400E' }
        case 'en recogida': return { bg: '#DBEAFE', color: '#1E40AF' }
        case 'programada': return { bg: '#E0E7FF', color: '#3730A3' }
        case 'en tránsito': return { bg: '#CFFAFE', color: '#155E75' }
        case 'entregado': return { bg: '#D1FAE5', color: '#065F46' }
        case 'devuelto': return { bg: '#FEE2E2', color: '#991B1B' }
        default: return { bg: '#F3F4F6', color: '#6B7280' }
    }
}

const getPagoColor = (estadoPago) =>
    estadoPago?.toLowerCase() === 'pagado'
        ? { bg: '#D1FAE5', color: '#065F46' }
        : { bg: '#FEE2E2', color: '#991B1B' }

// ── Fila de campo reutilizable ──
const CampoFila = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={500} color="#2D3748">
            {String(value ?? '—')}
        </Typography>
    </Box>
)

// ── Modal Consultar ──
const ModalConsultar = ({ venta, onClose }) => {
    if (!venta) return null
    const estadoStyles = getEstadoColor(venta.estado)
    const pagoStyles = getPagoColor(venta.estadoPago)

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            {/* ── Tarjeta superior: encomienda ── */}
            <Paper elevation={0} sx={{ ...cardSx, mb: 2 }}>
                <Box sx={tituloSx}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                    <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Encomienda</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>
                    Información general de la guía de envío
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 2,
                        backgroundColor: COLORS.primaryLight,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 45, color: COLORS.primary }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} fontSize="1.1rem" color={COLORS.text}>
                            {venta.numeroGuia}
                        </Typography>
                        <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
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
                        <Typography variant="caption" color={COLORS.textMuted}>Fecha de registro</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaRegistro}</Typography>
                        <Typography variant="caption" color={COLORS.textMuted} display="block" mt={0.8}>Fecha estimada</Typography>
                        <Typography variant="body2" fontWeight={600} display="block">{venta.fechaEstimadaEntrega}</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* ── Fila: Remitente + Destinatario ── */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PersonOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Remitente</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Datos del cliente que envía
                    </Typography>
                    <CampoFila label="Nombre" value={`${venta.cliente?.nombre} ${venta.cliente?.apellido}`} />
                    <CampoFila label="Identificación" value={`${venta.cliente?.tipoIdentificacion} ${venta.cliente?.numeroIdentificacion}`} />
                    <CampoFila label="Teléfono" value={venta.cliente?.telefono} />
                    <CampoFila label="Dirección" value={venta.cliente?.direccion} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Destinatario</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Datos de quien recibe el paquete
                    </Typography>
                    <CampoFila label="Nombre" value={venta.destinatario?.nombreDestinatario} />
                    <CampoFila label="Teléfono" value={venta.destinatario?.telefonoDestinatario} />
                    <CampoFila label="Dirección" value={venta.destinatario?.direccionDestinatario} />
                </Paper>
            </Box>

            {/* ── Fila: Paquete + Pago y Destino ── */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Paquete</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Características del paquete enviado
                    </Typography>
                    <CampoFila label="Contenido" value={venta.paquete?.descripcionContenido} />
                    <CampoFila label="Peso" value={`${venta.paquete?.peso} kg`} />
                    <CampoFila label="Dimensiones" value={`${venta.paquete?.alto}×${venta.paquete?.ancho}×${venta.paquete?.profundidad} cm`} />
                    <CampoFila label="Valor declarado" value={`$${(venta.paquete?.valorDeclarado || 0).toLocaleString()}`} />
                </Paper>
                <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                    <Box sx={tituloSx}>
                        <PaymentOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                        <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Pago y Destino</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                        Información de pago y ruta de envío
                    </Typography>
                    <CampoFila label="Destino" value={venta.ruta?.destino} />
                    <CampoFila label="Método de pago" value={venta.metodoPago} />
                    <CampoFila label="Valor servicio" value={`$${venta.valorServicio?.toLocaleString()}`} />
                    <CampoFila label="Total" value={`$${venta.total?.toLocaleString()}`} />
                </Paper>
            </Box>

            {venta.observaciones && (
                <Paper elevation={0} sx={{ ...cardSx, mt: 2 }}>
                    <Typography variant="subtitle2" color={COLORS.textMuted} mb={0.5}>Observaciones</Typography>
                    <Typography variant="body2">{venta.observaciones}</Typography>
                </Paper>
            )}

            {/* Botón cerrar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{
                    backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                    '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

// ── Modal Toggle Habilitado (sirve para habilitar e inhabilitar) ──
const ModalToggleHabilitado = ({ venta, onClose, onConfirm, loading }) => {
    if (!venta) return null
    const esHabilitar = !venta.habilitado

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ color: esHabilitar ? '#16A34A' : COLORS.primary, fontWeight: 700 }}>
                {esHabilitar ? '¿Habilitar venta?' : '¿Inhabilitar venta?'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Estás a punto de {esHabilitar ? 'habilitar' : 'inhabilitar'} la encomienda con guía{' '}
                    <strong>{venta.numeroGuia}</strong>.{' '}
                    {esHabilitar
                        ? 'La encomienda volverá a estar disponible en el sistema.'
                        : 'La encomienda no aparecerá en los listados activos hasta que sea habilitada nuevamente.'
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={loading} variant="outlined"
                    sx={{ borderColor: COLORS.border, color: COLORS.text, borderRadius: 2, textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(venta.idEncomiendaVenta)} disabled={loading} variant="contained"
                    sx={{
                        backgroundColor: esHabilitar ? '#16A34A' : COLORS.primary,
                        borderRadius: 2, textTransform: 'none',
                        '&:hover': { backgroundColor: esHabilitar ? '#15803D' : '#a01212' },
                    }}>
                    {loading
                        ? (esHabilitar ? 'Habilitando...' : 'Inhabilitando...')
                        : (esHabilitar ? 'Sí, habilitar' : 'Sí, inhabilitar')
                    }
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Estilos reutilizables para los Select de filtros ──
const filterSelectSx = {
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E57373', borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '& .MuiSelect-icon': { color: '#8A94A6', fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
}

const filterMenuProps = {
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    '&:hover': { backgroundColor: '#FFF5F5' },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: '#1a0e0c' },
                    '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                },
            },
        },
    },
}

// ── Filtros de estado (habilitado) ──
const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

// ── Componente principal ──
const ListarVenta = () => {
    const navigate = useNavigate()
    const { ventas, loading, error, invalidateVenta } = useVentas()

    const [busqueda, setBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoEncomienda, setFiltroEstadoEncomienda] = useState('todos')
    const [filtroPago, setFiltroPago] = useState('todos')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const [ventaToggle, setVentaToggle] = useState(null)
    const [toggling, setToggling] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // ── Filtrado ──
    const ventasFiltradas = ventas.filter(v => {
        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && v.habilitado) ||
            (filtroHabilitado === 'inhabilitado' && !v.habilitado)

        const q = busqueda.toLowerCase()
        const coincideBusqueda = !q ||
            v.numeroGuia.toLowerCase().includes(q) ||
            `${v.cliente?.nombre} ${v.cliente?.apellido}`.toLowerCase().includes(q) ||
            v.destinatario?.nombreDestinatario?.toLowerCase().includes(q) ||
            v.ruta?.destino?.toLowerCase().includes(q)

        const coincideEstado = filtroEstadoEncomienda === 'todos' || v.estado === filtroEstadoEncomienda
        const coincidePago = filtroPago === 'todos' || v.estadoPago?.toLowerCase() === filtroPago.toLowerCase()
        const coincideMetodo = filtroMetodoPago === 'todos' || v.metodoPago?.toLowerCase() === filtroMetodoPago.toLowerCase()

        return coincideHabilitado && coincideBusqueda && coincideEstado && coincidePago && coincideMetodo
    })

    const handleToggle = async (id) => {
        const venta = ventas.find(v => v.idEncomiendaVenta === id)
        const esHabilitar = !venta?.habilitado
        setToggling(true)
        try {
            await invalidateVenta(id)
            setVentaToggle(null)
            setSnackbar({
                open: true,
                message: esHabilitar ? 'Venta habilitada correctamente.' : 'Venta inhabilitada correctamente.',
                severity: esHabilitar ? 'success' : 'warning',
            })
        } catch (err) {
            setVentaToggle(null)
            setSnackbar({
                open: true,
                message: err.message || 'Error al cambiar el estado de la venta.',
                severity: 'error',
            })
        } finally {
            setToggling(false)
        }
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroEstadoEncomienda('todos')
        setFiltroPago('todos')
        setFiltroMetodoPago('todos')
        setPage(1)
    }

    const hayFiltrosActivos = busqueda || filtroEstadoEncomienda !== 'todos' || filtroPago !== 'todos' || filtroMetodoPago !== 'todos'

    const totalPages = Math.max(1, Math.ceil(ventasFiltradas.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedVentas = ventasFiltradas.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = ventasFiltradas.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, ventasFiltradas.length)

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Ventas
                        </Typography>
                        {!loading && !error && (
                            <Chip
                                label={`${ventas.length} registrada${ventas.length !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    backgroundColor: '#F3F4F6',
                                    color: COLORS.textMuted,
                                    fontWeight: 500,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    borderRadius: 10,
                                }}
                            />
                        )}
                    </Box>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona las ventas y encomiendas registradas en el sistema.
                    </Typography>
                </Box>
                <Button
                    onClick={() => navigate('/ventas/registrar')}
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                        '&:hover': {
                            backgroundColor: '#b91c1c',
                            boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                        },
                    }}
                >
                    Nueva venta
                </Button>
            </Box>

            {/* ── Alerta de error de carga ── */}
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    Error al cargar las ventas: {error}
                </Alert>
            )}

            {/* ── Filtros de estado (habilitado) ── */}
            <Box sx={{
                display: 'inline-flex',
                backgroundColor: '#FFECEC',
                borderRadius: 4,
                p: '4px',
                mb: 2.5,
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
                            backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                            color: filtroHabilitado === f.value ? COLORS.text : '#B05050',
                            boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                                color: filtroHabilitado === f.value ? COLORS.text : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* ── Búsqueda + filtros + Export ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar ventas..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#CC1818', borderWidth: '1px',
                            },
                        },
                    }}
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setPage(1) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 20 }} />
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
                    <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: '#E57373' } }}>Estado encomienda</InputLabel>
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
                    <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: '#E57373' } }}>Estado pago</InputLabel>
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
                    <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: '#E57373' } }}>Método de pago</InputLabel>
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
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
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
                        borderColor: COLORS.border,
                        color: COLORS.text,
                        fontWeight: 500,
                        ml: 'auto',
                        '&:hover': { backgroundColor: COLORS.primaryLight },
                    }}
                >
                    Exportar
                </Button>
            </Box>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Remitente</TableCell>
                                <TableCell sx={thStyle}>Guía</TableCell>
                                <TableCell sx={thStyle}>Destinatario</TableCell>
                                <TableCell sx={thStyle}>Destino</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={thStyle}>Pago</TableCell>
                                <TableCell sx={thStyle}>Total</TableCell>
                                <TableCell sx={thStyle}>Habilitado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                                        <Typography variant="body2" color={COLORS.textMuted} mt={1.5}>
                                            Cargando ventas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar las ventas. Verifica la conexión con el servidor.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedVentas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            {ventas.length === 0
                                                ? 'No hay ventas registradas en el sistema.'
                                                : 'No se encontraron ventas que coincidan con los filtros aplicados.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedVentas.map(venta => {
                                    const estadoStyles = getEstadoColor(venta.estado)
                                    const pagoStyles = getPagoColor(venta.estadoPago)
                                    return (
                                        <TableRow
                                            key={venta.idEncomiendaVenta}
                                            sx={{
                                                '&:hover': { backgroundColor: COLORS.hoverBg },
                                                transition: 'background-color 0.15s',
                                                opacity: venta.habilitado ? 1 : 0.55,
                                            }}
                                        >
                                            {/* Remitente */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: venta.habilitado ? '#FFCDD2' : '#E0E0E0',
                                                        fontSize: '0.73rem',
                                                        fontWeight: 700,
                                                        color: venta.habilitado ? '#C62828' : '#8E8E8E',
                                                    }}>
                                                        {venta.cliente?.nombre?.[0]}{venta.cliente?.apellido?.[0]}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} color={COLORS.text} noWrap>
                                                        {venta.cliente?.nombre} {venta.cliente?.apellido}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* Guía */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={COLORS.secondary}>
                                                    {venta.numeroGuia}
                                                </Typography>
                                                <Typography variant="caption" color={COLORS.textMuted}>
                                                    {venta.fechaRegistro}
                                                </Typography>
                                            </TableCell>

                                            {/* Destinatario */}
                                            <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                                {venta.destinatario?.nombreDestinatario}
                                            </TableCell>

                                            {/* Destino */}
                                            <TableCell sx={{ fontSize: '0.85rem', color: COLORS.text, py: 1.5 }}>
                                                {venta.ruta?.destino}
                                            </TableCell>

                                            {/* Estado encomienda */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={venta.estado ? venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1) : '—'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: estadoStyles.bg,
                                                        color: estadoStyles.color,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        height: 22,
                                                        borderRadius: 10,
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Estado pago */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={venta.estadoPago}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: pagoStyles.bg,
                                                        color: pagoStyles.color,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        height: 22,
                                                        borderRadius: 10,
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.primary, py: 1.5 }}>
                                                ${venta.total?.toLocaleString()}
                                            </TableCell>

                                            {/* Habilitado */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={venta.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: venta.habilitado ? '#DCFCE7' : '#F3F4F6',
                                                        color: venta.habilitado ? '#16A34A' : '#9CA3AF',
                                                        fontWeight: 600,
                                                        fontSize: '0.72rem',
                                                        height: 22,
                                                        borderRadius: 10,
                                                        border: 'none',
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setVentaConsulta(venta)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => navigate(`/ventas/actualizar/${venta.idEncomiendaVenta}`)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={venta.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small" onClick={() => setVentaToggle(venta)}
                                                            sx={{
                                                                color: venta.habilitado ? COLORS.primary : '#16A34A',
                                                                '&:hover': {
                                                                    backgroundColor: venta.habilitado ? COLORS.primaryLight : '#DCFCE7',
                                                                },
                                                            }}>
                                                            {venta.habilitado
                                                                ? <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                                                                : <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
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

            {/* ── Paginación ── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={COLORS.textMuted}>
                    Mostrando {from}–{to} de {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color={COLORS.textMuted} fontWeight={500}>
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
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E57373', borderWidth: '1px',
                                },
                                '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                                '& .MuiSelect-icon': { color: COLORS.textMuted, fontSize: 18 },
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
                                                '&:hover': { backgroundColor: '#FFF5F5' },
                                                '&.Mui-selected': {
                                                    backgroundColor: 'transparent',
                                                    fontWeight: 600,
                                                    color: COLORS.text,
                                                },
                                                '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
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
                                        <CheckOutlinedIcon sx={{ fontSize: 14, color: COLORS.textMuted }} />
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
                                color: COLORS.text,
                                border: `1px solid ${COLORS.border}`,
                                '& .MuiTouchRipple-root': { display: 'none' },
                            },
                            '& .MuiPaginationItem-ellipsis': { border: 'none' },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary,
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': { backgroundColor: '#a01212' },
                            },
                            '& .MuiPaginationItem-root:hover:not(.Mui-selected)': {
                                backgroundColor: COLORS.hoverBg,
                                borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            <ModalConsultar venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />
            <ModalToggleHabilitado
                venta={ventaToggle}
                onClose={() => !toggling && setVentaToggle(null)}
                onConfirm={handleToggle}
                loading={toggling}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ fontWeight: 600 }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarVenta
