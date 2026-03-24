import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVentas } from '../../Context/VentaContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, IconButton, Chip, Tooltip, InputAdornment,
    MenuItem, Select, FormControl, InputLabel, Button,
    Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Avatar, Switch, Divider, Grid
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { ESTADOS_ENCOMIENDA, METODOS_PAGO } from '../../Context/VentaContext'

const COLORS = {
    primary: '#CC1818',
    secondary: '#1A2E6E',
    text: '#2D3748',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    activeBg: '#FFE8E8',
    hoverBg: '#F9F9F9',
}

// Colores para estados
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

// Colores para estado de pago
const getPagoColor = (estadoPago) => {
    return estadoPago === 'pagado' 
        ? { bg: '#D1FAE5', color: '#065F46' }
        : { bg: '#FEE2E2', color: '#991B1B' }
}

// ── Modal Consultar ──
const ModalConsultar = ({ venta, onClose }) => {
    if (!venta) return null

    const estadoStyles = getEstadoColor(venta.estado)
    const pagoStyles = getPagoColor(venta.estadoPago)

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: COLORS.secondary, width: 40, height: 40 }}>
                    <LocalShippingIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        Guía: {venta.numeroGuia}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>Detalle de la encomienda</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Estado y Pago */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                                label={venta.estado} 
                                size="small" 
                                sx={{ backgroundColor: estadoStyles.bg, color: estadoStyles.color, fontWeight: 600 }}
                            />
                            <Chip 
                                label={venta.estadoPago} 
                                size="small" 
                                sx={{ backgroundColor: pagoStyles.bg, color: pagoStyles.color, fontWeight: 600 }}
                            />
                        </Box>
                    </Grid>
                    
                    {/* Datos principales */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color={COLORS.textMuted}>Número de guía</Typography>
                        <Typography variant="body1" fontWeight={600}>{venta.numeroGuia}</Typography>
                        
                        <Typography variant="subtitle2" color={COLORS.textMuted} sx={{ mt: 1 }}>Número de factura</Typography>
                        <Typography variant="body1">{venta.numeroFactura}</Typography>
                        
                        <Typography variant="subtitle2" color={COLORS.textMuted} sx={{ mt: 1 }}>Fecha de registro</Typography>
                        <Typography variant="body1">{venta.fechaRegistro}</Typography>
                        
                        <Typography variant="subtitle2" color={COLORS.textMuted} sx={{ mt: 1 }}>Fecha estimada de entrega</Typography>
                        <Typography variant="body1">{venta.fechaEstimadaEntrega}</Typography>
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Datos del Remitente */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 700, mb: 1 }}>
                            Datos del remitente
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Nombre:</Typography>
                                <Typography variant="body2" fontWeight={500}>{venta.cliente?.nombre} {venta.cliente?.apellido}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Identificación:</Typography>
                                <Typography variant="body2">{venta.cliente?.tipoIdentificacion} {venta.cliente?.numeroIdentificacion}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Teléfono:</Typography>
                                <Typography variant="body2">{venta.cliente?.telefono}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Dirección:</Typography>
                                <Typography variant="body2">{venta.cliente?.direccion}, {venta.cliente?.ciudad}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Datos del Destinatario */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: COLORS.secondary, fontWeight: 700, mb: 1 }}>
                            Datos del destinatario
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Nombre:</Typography>
                                <Typography variant="body2" fontWeight={500}>{venta.destinatario?.nombreDestinatario}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Teléfono:</Typography>
                                <Typography variant="body2">{venta.destinatario?.telefonoDestinatario}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Dirección:</Typography>
                                <Typography variant="body2">{venta.destinatario?.direccionDestinatario}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}><Divider /></Grid>

                    {/* Datos del Paquete */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 700, mb: 1 }}>
                            Características del paquete
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Contenido:</Typography>
                                <Typography variant="body2">{venta.paquete?.descripcionContenido}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Peso:</Typography>
                                <Typography variant="body2">{venta.paquete?.peso} kg</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Dimensiones:</Typography>
                                <Typography variant="body2">{venta.paquete?.alto}x{venta.paquete?.ancho}x{venta.paquete?.profundidad} cm</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Valor Declarado:</Typography>
                                <Typography variant="body2">${(venta.paquete?.valorDeclarado || 0).toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Datos del Pago y Destino */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: COLORS.secondary, fontWeight: 700, mb: 1 }}>
                            Pago y destino
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Destino:</Typography>
                                <Typography variant="body2" fontWeight={500}>{venta.ruta?.destino}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Método de Pago:</Typography>
                                <Typography variant="body2">{venta.metodoPago}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Valor Servicio:</Typography>
                                <Typography variant="body2">${venta.valorServicio?.toLocaleString()}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color={COLORS.textMuted}>Total:</Typography>
                                <Typography variant="body2" fontWeight={700} color={COLORS.primary}>${venta.total?.toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {venta.observaciones && (
                        <>
                            <Grid item xs={12}><Divider /></Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color={COLORS.textMuted}>OBSERVACIONES</Typography>
                                <Typography variant="body2">{venta.observaciones}</Typography>
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{ backgroundColor: COLORS.secondary, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Modal Inhabilitar ──
const ModalInhabilitar = ({ venta, onClose, onConfirm }) => {
    if (!venta) return null
    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ color: COLORS.primary, fontWeight: 700 }}>
                {venta.habilitado ? 'Inhabilitar venta' : 'Habilitar venta'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {venta.habilitado 
                        ? `¿Estás seguro de inhabilitar la guía ${venta.numeroGuia}? La encomienda no aparecerá en los listados activos.`
                        : `¿Estás seguro de habilitar la guía ${venta.numeroGuia}? La encomienda volverá a aparecer en los listados activos.`
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined"
                    sx={{ borderColor: COLORS.border, color: COLORS.text, borderRadius: 2, textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(venta.idEncomiendaVenta)} variant="contained"
                    sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none', '&:hover': { backgroundColor: '#a01212' } }}>
                    {venta.habilitado ? 'Sí, inhabilitar' : 'Sí, habilitar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Componente principal ──
const ListarVenta = () => {
    const navigate = useNavigate()
    const { ventas, invalidateVenta } = useVentas()
    const [busqueda, setBusqueda] = useState('')
    const [filtroPor, setFiltroPor] = useState('todo')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [filtroPago, setFiltroPago] = useState('todos')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const [ventaInhabilitar, setVentaInhabilitar] = useState(null)

    // ── Filtrado ──
    const ventasFiltradas = ventas.filter(v => {
        const q = busqueda.toLowerCase()
        let coincideBusqueda = true

        if (q) {
            switch (filtroPor) {
                case 'guia': coincideBusqueda = v.numeroGuia.toLowerCase().includes(q); break
                case 'cliente': coincideBusqueda = `${v.cliente?.nombre} ${v.cliente?.apellido}`.toLowerCase().includes(q); break
                case 'destinatario': coincideBusqueda = v.destinatario?.nombreDestinatario.toLowerCase().includes(q); break
                case 'destino': coincideBusqueda = v.ruta?.destino.toLowerCase().includes(q); break
                default:
                    coincideBusqueda =
                        v.numeroGuia.toLowerCase().includes(q) ||
                        `${v.cliente?.nombre} ${v.cliente?.apellido}`.toLowerCase().includes(q) ||
                        v.destinatario?.nombreDestinatario.toLowerCase().includes(q) ||
                        v.ruta?.destino.toLowerCase().includes(q)
            }
        }

        const coincideEstado = filtroEstado === 'todos' || v.estado === filtroEstado
        const coincidePago = filtroPago === 'todos' || v.estadoPago === filtroPago
        const coincideMetodoPago = filtroMetodoPago === 'todos' || v.metodoPago === filtroMetodoPago

        return coincideBusqueda && coincideEstado && coincidePago && coincideMetodoPago
    })

    const handleHabilitadoChange = (id) => {
        invalidateVenta(id)
    }

    const handleInhabilitar = (id) => {
        invalidateVenta(id)
        setVentaInhabilitar(null)
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroPor('todo')
        setFiltroEstado('todos')
        setFiltroPago('todos')
        setFiltroMetodoPago('todos')
        setPage(0)
    }

    const hayFiltrosActivos = busqueda || filtroEstado !== 'todos' || filtroPago !== 'todos' || filtroMetodoPago !== 'todos'

    // Calcular totales para estadísticas
    const totalVentas = ventas.filter(v => v.habilitado).length
    const totalIngresos = ventas.filter(v => v.habilitado && v.estadoPago === 'pagado').reduce((acc, v) => acc + v.total, 0)
    const pendientes = ventas.filter(v => v.habilitado && v.estadoPago === 'pendiente').length
    const entregados = ventas.filter(v => v.habilitado && v.estado === 'entregado').length

    return (
        <Box sx={{ p: 1 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocalShippingIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>
                            Ventas / Encomiendas
                        </Typography>
                        <Typography variant="caption" color={COLORS.textMuted}>
                            {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? 's' : ''} encontrado{ventasFiltradas.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    onClick={() => navigate('/ventas/registrar')}
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#a01212' }
                    }}
                >
                    + Nueva venta
                </Button>
            </Box>

            {/* ── Filtros y búsqueda ── */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <FilterListIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                    <Typography variant="caption" fontWeight={700} color={COLORS.textMuted} letterSpacing={1}>
                        Filtros y búsqueda
                    </Typography>
                    {hayFiltrosActivos && (
                        <Chip
                            label="Limpiar"
                            size="small"
                            icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={limpiarFiltros}
                            sx={{ ml: 'auto', fontSize: '0.72rem', height: 24, cursor: 'pointer', backgroundColor: COLORS.activeBg, color: COLORS.primary }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Buscar por</InputLabel>
                        <Select value={filtroPor} label="Buscar por"
                            onChange={e => { setFiltroPor(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todo">Todo</MenuItem>
                            <MenuItem value="guia">N° Guía</MenuItem>
                            <MenuItem value="cliente">Cliente</MenuItem>
                            <MenuItem value="destinatario">Destinatario</MenuItem>
                            <MenuItem value="destino">Destino</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Escribe para buscar..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setPage(0) }}
                        sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                                </InputAdornment>
                            ),
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setBusqueda('')}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Estado</InputLabel>
                        <Select value={filtroEstado} label="Estado"
                            onChange={e => { setFiltroEstado(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            {ESTADOS_ENCOMIENDA.map(estado => (
                                <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Pago</InputLabel>
                        <Select value={filtroPago} label="Pago"
                            onChange={e => { setFiltroPago(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="pagado">Pagado</MenuItem>
                            <MenuItem value="pendiente">Pendiente</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Método</InputLabel>
                        <Select value={filtroMetodoPago} label="Método"
                            onChange={e => { setFiltroMetodoPago(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            {METODOS_PAGO.map(mp => (
                                <MenuItem key={mp} value={mp}>{mp}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                {['#', 'Guía', 'Remitente', 'Destinatario', 'Destino', 'Estado', 'Pago', 'Total', 'Acciones'].map(col => (
                                    <TableCell key={col} sx={{
                                        fontWeight: 700, fontSize: '0.75rem', color: COLORS.textMuted,
                                        letterSpacing: 0.8, py: 1.5,
                                        borderBottom: `2px solid ${COLORS.border}`,
                                    }}>
                                        {col}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {ventasFiltradas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            No se encontraron encomiendas con los filtros aplicados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ventasFiltradas
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((venta, index) => {
                                        const estadoStyles = getEstadoColor(venta.estado)
                                        const pagoStyles = getPagoColor(venta.estadoPago)
                                        
                                        return (
                                            <TableRow key={venta.idEncomiendaVenta}
                                                sx={{
                                                    '&:hover': { backgroundColor: COLORS.hoverBg },
                                                    opacity: venta.habilitado ? 1 : 0.6,
                                                    transition: 'background-color 0.15s',
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.textMuted, py: 1.5 }}>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600} color={COLORS.secondary}>
                                                        {venta.numeroGuia}
                                                    </Typography>
                                                    <Typography variant="caption" color={COLORS.textMuted}>
                                                        {venta.fechaRegistro}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={500} color={COLORS.text}>
                                                        {venta.cliente?.nombre} {venta.cliente?.apellido}
                                                    </Typography>
                                                    <Typography variant="caption" color={COLORS.textMuted}>
                                                        {venta.cliente?.telefono}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: '0.82rem', color: COLORS.text, py: 1.5 }}>
                                                    {venta.destinatario?.nombreDestinatario}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: '0.82rem', color: COLORS.text, py: 1.5 }}>
                                                    {venta.ruta?.destino}
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Chip 
                                                        label={venta.estado} 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: estadoStyles.bg, 
                                                            color: estadoStyles.color,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            height: 22
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Chip 
                                                        label={venta.estadoPago} 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: pagoStyles.bg, 
                                                            color: pagoStyles.color,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            height: 22
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600, color: COLORS.primary, py: 1.5 }}>
                                                    ${venta.total?.toLocaleString()}
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title="Consultar">
                                                            <IconButton size="small" onClick={() => setVentaConsulta(venta)}
                                                                sx={{ color: COLORS.secondary, '&:hover': { backgroundColor: '#EEF2FF' } }}>
                                                                <VisibilityIcon sx={{ fontSize: 17 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Actualizar">
                                                            <IconButton size="small"
                                                                onClick={() => navigate(`/ventas/actualizar/${venta.idEncomiendaVenta}`)}
                                                                sx={{ color: '#F59E0B', '&:hover': { backgroundColor: '#FFFBEB' } }}>
                                                                <EditIcon sx={{ fontSize: 17 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={venta.habilitado ? "Inhabilitar" : "Habilitar"}>
                                                            <IconButton size="small" onClick={() => setVentaInhabilitar(venta)}
                                                                sx={{ color: COLORS.primary, '&:hover': { backgroundColor: COLORS.activeBg } }}>
                                                                <BlockIcon sx={{ fontSize: 17 }} />
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

                <TablePagination
                    component="div"
                    count={ventasFiltradas.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                    sx={{ borderTop: `1px solid ${COLORS.border}`, fontSize: '0.8rem' }}
                />
            </Paper>

            <ModalConsultar venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />
            <ModalInhabilitar
                venta={ventaInhabilitar}
                onClose={() => setVentaInhabilitar(null)}
                onConfirm={handleInhabilitar}
            />

        </Box>
    )
}

export default ListarVenta