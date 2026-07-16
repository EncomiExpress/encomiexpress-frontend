import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useVentas, ESTADOS_ENCOMIENDA, METODOS_PAGO, ESTADOS_PAGO } from '../../shared/contexts/VentaContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Select, MenuItem,
    CircularProgress, FormControl, TableSortLabel,
    Menu, Dialog, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import CloseIcon from '@mui/icons-material/Close'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import { useAuth, PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getPageOfEncomienda, getEncomiendas } from '../../shared/services/ventaService'
import { descargarGuiaPdf } from '../../shared/utils/exportGuiaPdf.js'
import { formatFecha } from '../../shared/utils/formatters.js'
import RegistrarVenta from './RegistrarVenta'
import ActualizarVenta from './ActualizarVenta'
import ModalInhabilitarVenta from './ModalInhabilitarVenta'
import ModalConsultarVenta from './ModalConsultarVenta'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'

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
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
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
    const { ventas, total, fetchVentas, cambiarEstadoVenta, cambiarEstadoPagoVenta, toggleHabilitadoVenta } = useVentas()
    const { tienePermiso } = useAuth()
    const initialLoad = useRef(true)
    const pendingConfirm = useRef(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [exportando, setExportando] = useState(false)

    const [busqueda, setBusqueda] = useState('')
    const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const filtroContainerRef = useRef(null)
    const filtroBtnRefs = useRef([])
    const [filtroPillStyle, setFiltroPillStyle] = useState({ left: 0, width: 0 })

    useLayoutEffect(() => {
        const activeIndex = FILTROS_HABILITADO.findIndex(f => f.value === filtroHabilitado)
        const btn = filtroBtnRefs.current[activeIndex]
        const container = filtroContainerRef.current
        if (btn && container) {
            setFiltroPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
        }
    }, [filtroHabilitado])
    const [filtroEstadoEncomienda, setFiltroEstadoEncomienda] = useState('')
    const [filtroPago, setFiltroPago] = useState('')
    const [filtroMetodoPago, setFiltroMetodoPago] = useState('')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [ventaConsulta, setVentaConsulta] = useState(null)
    const { showToast } = useToast()
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, venta: null })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [ventaEditar, setVentaEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: '', dir: '' })
    const [pagoMenuAnchor, setPagoMenuAnchor] = useState(null)
    const [pagoMenuId, setPagoMenuId] = useState(null)
    const [confirmPago, setConfirmPago] = useState({ open: false, id: null })
    const [estadoMenuAnchor, setEstadoMenuAnchor] = useState(null)
    const [estadoMenuId, setEstadoMenuId] = useState(null)
    const [confirmCancelar, setConfirmCancelar] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)

    useEffect(() => {
      const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
      return () => clearTimeout(t)
    }, [busqueda])

    const fetchVentasBackend = useCallback((signal) => {
      return fetchVentas(signal, {
        page,
        limit: rowsPerPage,
        sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
        estado: filtroEstadoEncomienda || undefined,
        estadoPago: filtroPago || undefined,
        metodoPago: filtroMetodoPago || undefined,
        habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
        q: debouncedBusqueda.trim() || undefined,
      })
    }, [page, rowsPerPage, filtroEstadoEncomienda, filtroPago, filtroMetodoPago, filtroHabilitado, debouncedBusqueda, sortBy, fetchVentas])

    useEffect(() => {
      const controller = new AbortController()
      let cancelled = false

      const cargar = async () => {
        setLoading(true)
        setError(null)
        try {
          await fetchVentasBackend(controller.signal)
        } catch (err) {
          if (!cancelled) setError(err.message)
        } finally {
          if (!cancelled) setLoading(false)
        }
      }

      cargar()
      return () => {
        cancelled = true
        controller.abort()
      }
    }, [fetchVentasBackend])

    useEffect(() => {
      if (!loading) { initialLoad.current = false }
    }, [loading])

    const handleSort = (field) => {
        setSortBy(prev => {
            if (prev.field !== field) return { field, dir: 'asc' }
            if (prev.dir === 'asc') return { field, dir: 'desc' }
            return { field: '', dir: '' }
        })
        setPage(1)
    }

    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getEncomiendas(undefined, {
                limit: 100000,
                estado: filtroEstadoEncomienda || undefined,
                estadoPago: filtroPago || undefined,
                metodoPago: filtroMetodoPago || undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                q: debouncedBusqueda.trim() || undefined,
            })
            const rows = (res?.data || []).map(venta => ({
                'ID': venta.idEncomiendaVenta || venta.idVenta,
                'Guía': venta.numeroGuia,
                'Cliente': `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.trim() || venta.idCliente || '-',
                'Ruta': venta.ruta?.nombreRuta || '-',
                'Destino': venta.ruta?.destino?.ciudad || '-',
                'Fecha registro': venta.fechaRegistro,
                'Fecha est. entrega': venta.fechaEstimadaEntrega,
                'Estado': venta.estado,
                'Estado de pago': venta.estadoPago,
                'Método de pago': venta.metodoPago,
                'Valor servicio': venta.valorServicio,
                'Impuestos': venta.impuestos,
                'Total': venta.total,
                'Habilitado': venta.habilitado === false ? 'No' : 'Sí',
            }))
            await exportToExcel({ data: rows, fileName: 'ventas', sheetName: 'Ventas', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    const handleDescargarGuia = async (venta) => {
        try {
            await descargarGuiaPdf(venta)
        } catch (err) {
            showToast(err.message || 'Error al generar la guía en PDF.', 'error')
        }
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await cambiarEstadoVenta(id, nuevoEstado)
            showToast(`Estado actualizado a ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}.`, 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado de la encomienda.', 'error')
        }
    }

    const handlePagoChange = async (id, nuevoPago) => {
        try {
            await cambiarEstadoPagoVenta(id, nuevoPago)
            showToast(`Estado de pago actualizado a ${nuevoPago}.`, 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado de pago.', 'error')
        }
    }

    const handlePagoConfirm = async () => {
        setConfirmandoEstado(true)
        try {
            await handlePagoChange(confirmPago.id, 'Pagado')
            setConfirmPago({ open: false, id: null })
        } finally {
            setConfirmandoEstado(false)
        }
    }

    const handleCancelarConfirm = async () => {
        setConfirmandoEstado(true)
        try {
            await handleEstadoChange(confirmCancelar.id, 'Cancelada')
            setConfirmCancelar({ open: false, id: null })
        } finally {
            setConfirmandoEstado(false)
        }
    }

    const handleToggleHabilitado = (venta) => {
        setModalInhabilitar({ open: true, venta })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

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
                        onClick={handleExportar}
                        disabled={exportando}
                        variant="contained"
                        startIcon={exportando ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
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
                                backgroundColor: theme.palette.primary.activeBg,
                                color: theme.palette.text.primary,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {exportando ? 'Exportando...' : 'Exportar'}
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
                    <Box ref={filtroContainerRef} sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: 4,
                        p: '4px',
                        gap: '5px',
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '4px',
                            bottom: '4px',
                            left: `${filtroPillStyle.left}px`,
                            width: `${filtroPillStyle.width}px`,
                            borderRadius: 3,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: 'none',
                        }} />
                        {FILTROS_HABILITADO.map((f, i) => (
                            <Button
                                key={f.value}
                                ref={el => { filtroBtnRefs.current[i] = el }}
                                onClick={() => { setFiltroHabilitado(f.value); setPage(1) }}
                                size="small"
                                disableElevation
                                disableRipple
                                sx={{
                                    position: 'relative',
                                    zIndex: 1,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.5,
                                    minWidth: 0,
                                    fontWeight: filtroHabilitado === f.value ? 600 : 400,
                                    backgroundColor: 'transparent',
                                    color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
                                    transition: 'color 0.3s ease',
                                    border: 'none',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.dark,
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
                            value={filtroEstadoEncomienda}
                            onChange={e => { setFiltroEstadoEncomienda(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Estado'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroEstadoEncomienda ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_ENCOMIENDA.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroEstadoEncomienda === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroMetodoPago}
                            onChange={e => { setFiltroMetodoPago(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Método pago'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroMetodoPago ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {METODOS_PAGO.map(mp => (
                                <MenuItem key={mp} value={mp}>
                                    {mp}
                                    {filtroMetodoPago === mp && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            displayEmpty
                            value={filtroPago}
                            onChange={e => { setFiltroPago(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Pago'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroPago ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_PAGO.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroPago === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
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
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'numeroGuia'}
                                        direction={sortBy.dir === 'desc' ? 'desc' : 'asc'}
                                        onClick={() => handleSort('numeroGuia')}
                                        IconComponent={sortBy.field === 'numeroGuia' ? undefined : UnfoldMoreOutlinedIcon}
                                        sx={{
                                            color: 'inherit',
                                            '&:hover': { color: 'inherit' },
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '&.Mui-active:hover': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 1, fontSize: 16 },
                                        }}
                                    >
                                        Guía
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Remitente / Destinatario</TableCell>
                                <TableCell sx={thStyle}>Destino</TableCell>
                                <TableCell sx={thStyle}>Total</TableCell>
                                <TableCell sx={thStyle}>Estado pago</TableCell>
                                <TableCell sx={thStyle}>
                                    Estado
                                </TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando ventas...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
                                    <TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroHabilitado !== 'todo' || filtroEstadoEncomienda !== '' || filtroPago !== '' || filtroMetodoPago !== ''
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
                                            {/* Guía + fecha */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                                                    {venta.numeroGuia}
                                                </Typography>
                                                <Typography variant="caption" color={theme.palette.text.secondary}>
                                                    {formatFecha(venta.fechaRegistro)}
                                                </Typography>
                                            </TableCell>

                                            {/* Remitente / Destinatario */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {venta.cliente?.nombre} {venta.cliente?.apellido}
                                                </Typography>
                                                <Typography variant="caption" color={theme.palette.text.secondary} noWrap>
                                                    → {venta.destinatario?.nombreDestinatario || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Destino (via ruta → destino) */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={theme.palette.text.primary}>
                                                    {venta.ruta?.destino?.ciudad || '—'}
                                                </Typography>
                                                {venta.estado === 'Programada' && venta.ruta?.estado === 'Cancelada' && (
                                                    <Chip
                                                        label="Ruta cancelada · Reasignar"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 600,
                                                            backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                                            color: theme.palette.warning.dark,
                                                            border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                                                            mt: 0.5,
                                                        }}
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Total + método de pago */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={venta.total !== undefined
                                                        ? `$${Number(venta.total).toLocaleString('es-CO')}`
                                                        : '—'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor: theme.palette.primary.light,
                                                        color: theme.palette.primary.darker,
                                                        fontSize: '0.7rem',
                                                        borderRadius: '2px',
                                                        height: 24,
                                                    }}
                                                />
                                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mt: 0.5 }}>
                                                    {venta.metodoPago || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Estado pago */}
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
                                                ) : (venta.metodoPago === 'Contraentrega' && venta.estado !== 'Entregada') ? (
                                                    <Tooltip title="Es Contraentrega: el pago solo se puede confirmar cuando la venta sea entregada">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1, opacity: 0.55 }}>
                                                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #D97706', backgroundColor: 'transparent', flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#D97706' }}>Pendiente</Typography>
                                                        </Box>
                                                    </Tooltip>
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

                                            {/* Estado envío */}
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

                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setVentaConsulta(venta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Descargar guía">
                                                        <IconButton size="small" onClick={() => handleDescargarGuia(venta)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                            <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {venta.habilitado === false ? (
                                                        <Tooltip title="Habilita el registro para poder editarlo">
                                                            <span>
                                                                <IconButton size="small" disabled>
                                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    ) : venta.estado !== 'Programada' ? (
                                                        <Tooltip title={
                                                            venta.estado === 'En Tránsito' ? 'Esta venta ya está en tránsito: no se puede editar'
                                                                : venta.estado === 'Entregada' ? 'Esta venta ya fue entregada: no se puede editar'
                                                                    : 'Esta venta fue cancelada: no se puede editar'
                                                        }>
                                                            <span>
                                                                <IconButton size="small" disabled>
                                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small"
                                                                onClick={() => { setVentaEditar(venta); setModalActualizarOpen(true) }}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.INHABILITAR_VENTA) && (
                                                    <ToggleSwitch id={venta.idEncomiendaVenta} checked={venta.habilitado} onChange={() => handleToggleHabilitado(venta)} />
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

            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
            />

            <ModalConsultarVenta venta={ventaConsulta} onClose={() => setVentaConsulta(null)} />

            <RegistrarVenta
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    setModalRegistrarOpen(false)
                    showToast('Venta registrada correctamente.', 'success')
                }}
            />

            <ActualizarVenta
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVentaEditar(null) }}
                venta={ventaEditar}
                onSuccess={() => {
                    setModalActualizarOpen(false)
                    setVentaEditar(null)
                    showToast('Venta actualizada correctamente.', 'success')
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
                            .then(() => showToast(`Venta ${habilitadoActual ? 'inhabilitada' : 'habilitada'} correctamente.`, habilitadoActual ? 'warning' : 'success'))
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
                        disabled={confirmandoEstado}
                        variant="contained"
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                            px: 5, py: 0.76, fontSize: '0.875rem',
                            backgroundColor: '#3F3F46',
                            '&:hover': { backgroundColor: '#3F3F46', filter: 'brightness(0.88)' },
                        }}
                    >
                        {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
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
                        disabled={confirmandoEstado}
                        variant="contained"
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                            px: 5, py: 0.76, fontSize: '0.875rem',
                            backgroundColor: '#059669',
                            '&:hover': { backgroundColor: '#059669', filter: 'brightness(0.88)' },
                        }}
                    >
                        {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                    </Button>
                </Box>
            </Dialog>

        </Box>
    )
}

export default ListarVenta

