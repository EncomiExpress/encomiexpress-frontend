import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    IconButton, Chip, Tooltip, InputAdornment,
    Button, Select, MenuItem,
    CircularProgress, FormControl, TableSortLabel,
    Dialog, DialogContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import TablaPaginacionFooter from '../../shared/components/TablaPaginacionFooter.jsx'
import CloseIcon from '@mui/icons-material/Close'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'
import ModalInhabilitarAnticipo from './ModalInhabilitarAnticipo'
import ModalConsultarAnticipoExcedente from './ModalConsultarAnticipoExcedente'
import { getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'
import { getPageOfAnticipo, getAniosDisponiblesAnticipo, getAnticipos } from '../../shared/services/anticipoService'
import { formatFecha } from '../../shared/utils/formatters.js'
import { exportToExcel } from '../../shared/utils/exportExcel.js'

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

const ESTADOS_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente', 'Completado']

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

const MESES = [
    { value: '1',  label: 'Enero' },   { value: '2',  label: 'Febrero' },
    { value: '3',  label: 'Marzo' },   { value: '4',  label: 'Abril' },
    { value: '5',  label: 'Mayo' },    { value: '6',  label: 'Junio' },
    { value: '7',  label: 'Julio' },   { value: '8',  label: 'Agosto' },
    { value: '9',  label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

// ── Componente principal ─────────────────────────────────────────────────────
const ListarAnticipoExcedente = () => {
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
    const { anticipos, total, conductores, rutas, fetchAnticipos, toggleHabilitado, entregarExcedente } = useAnticipos()
    const { tienePermiso, PERMISOS } = useAuth()
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
    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('')
    const [filtroAnio, setFiltroAnio] = useState('')
    const [filtroMes, setFiltroMes] = useState('')
    const [aniosDisponibles, setAniosDisponibles] = useState([])
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const { showToast } = useToast()
    const [modalInhabilitar, setModalInhabilitar] = useState({ open: false, anticipo: null })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: '', dir: '' })
    const [confirmDev, setConfirmDev] = useState({ open: false, id: null })
    const [confirmandoEstado, setConfirmandoEstado] = useState(false)

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfAnticipo(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])

    const handleSort = (field) => {
        setSortBy(prev => {
            if (prev.field !== field) return { field, dir: 'asc' }
            if (prev.dir === 'asc') return { field, dir: 'desc' }
            return { field: '', dir: '' }
        })
        setPage(1)
    }

    useEffect(() => {
        const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    useEffect(() => {
        const controller = new AbortController()
        let cancelled = false

        const cargar = async () => {
            setLoading(true)
            setError(null)
            try {
                await fetchAnticipos(controller.signal, {
                    page,
                    limit: rowsPerPage,
                    q: debouncedBusqueda.trim() || undefined,
                    habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                    estado: filtroEstadoAnticipo || undefined,
                    anio: filtroAnio || undefined,
                    mes: filtroMes || undefined,
                    sortBy: sortBy.field ? `${sortBy.field}.${sortBy.dir}` : undefined,
                })
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
    }, [page, rowsPerPage, debouncedBusqueda, filtroHabilitado, filtroEstadoAnticipo, filtroAnio, filtroMes, sortBy, fetchAnticipos])

    useEffect(() => {
        getAniosDisponiblesAnticipo()
            .then(res => setAniosDisponibles(res.data || []))
            .catch(() => setAniosDisponibles([]))
    }, [])

    useEffect(() => {
        if (!loading) { initialLoad.current = false }
    }, [loading])

    // Helpers para resolver nombres desde los arrays del contexto
    const getNombreConductor = (anticipo) => {
        if (anticipo?.conductor?.usuario) {
            const { nombre, apellido } = anticipo.conductor.usuario
            return apellido ? `${nombre} ${apellido}` : (nombre || '—')
        }
        const c = conductores.find(c => c.idConductor === parseInt(anticipo?.idConductor))
        return c ? c.nombre : '—'
    }

    const currentAnticipos = anticipos
    const handleExportar = async () => {
        setExportando(true)
        try {
            const res = await getAnticipos(undefined, {
                limit: 100000,
                q: debouncedBusqueda.trim() || undefined,
                habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                estado: filtroEstadoAnticipo || undefined,
                anio: filtroAnio || undefined,
                mes: filtroMes || undefined,
            })
            const rows = (res?.data || []).map(anticipo => ({
                'ID': anticipo.idAnticipoExcedente || anticipo.idAnticipo,
                'Conductor': getNombreConductor(anticipo),
                'Ruta': anticipo.ruta?.nombreRuta || anticipo.idRuta || '-',
                'Valor anticipo': anticipo.valorAnticipo,
                'Valor gastado': anticipo.valorGastado,
                'Excedente': anticipo.excedente,
                'Fecha de entrega': anticipo.fechaEntrega,
                'Estado': anticipo.estado,
                'Habilitado': anticipo.habilitado === false ? 'No' : 'Sí',
            }))
            await exportToExcel({ data: rows, fileName: 'anticipos', sheetName: 'Anticipos', themeColor: theme.palette.primary.main })
        } catch (err) {
            showToast(err.message || 'Error al exportar.', 'error')
        } finally {
            setExportando(false)
        }
    }

    const handleToggleHabilitado = (anticipo) => {
        setModalInhabilitar({ open: true, anticipo })
    }

    const handleConfirmarToggle = () => {
        pendingConfirm.current = true
    }

    const handleConfirmarDevolucion = async () => {
        setConfirmandoEstado(true)
        try {
            await entregarExcedente(confirmDev.id)
            showToast('Devolución confirmada: el anticipo quedó Completado', 'success')
        } catch (err) {
            showToast(err.message || 'No se pudo confirmar la devolución', 'error')
        }
        setConfirmandoEstado(false)
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
                            value={filtroEstadoAnticipo}
                            onChange={e => { setFiltroEstadoAnticipo(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Estado'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroEstadoAnticipo ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_ANTICIPO.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroEstadoAnticipo === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filtroAnio}
                                onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                                displayEmpty
                                renderValue={v => v || 'Año'}
                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                sx={{
                                    fontSize: '0.82rem', borderRadius: 4,
                                    color: filtroAnio ? theme.palette.text.primary : theme.palette.text.secondary,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                    '& .MuiTouchRipple-root': { display: 'none' },
                                }}
                                MenuProps={filterMenuProps}>
                                <MenuItem value="">Año</MenuItem>
                                {aniosDisponibles.map(anio => (
                                    <MenuItem key={anio} value={String(anio)}>
                                        {anio}
                                        {filtroAnio === String(anio) && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Tooltip title={filtroAnio ? '' : 'Primero elige un año'}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={filtroMes}
                                    onChange={(e) => { setFiltroMes(e.target.value); setPage(1) }}
                                    displayEmpty
                                    disabled={!filtroAnio}
                                    renderValue={v => v ? (MESES.find(m => m.value === v)?.label || v) : (filtroAnio ? 'Todos' : 'Mes')}
                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                    sx={{
                                        fontSize: '0.82rem', borderRadius: 4,
                                        color: filtroMes ? theme.palette.text.primary : theme.palette.text.secondary,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                        '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                        '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                        '& .MuiTouchRipple-root': { display: 'none' },
                                    }}
                                    MenuProps={filterMenuProps}>
                                    <MenuItem value="">{filtroAnio ? 'Todos' : 'Mes'}</MenuItem>
                                    {MESES.map(m => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.label}
                                            {filtroMes === m.value && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Box>
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
                                <TableCell sx={thStyle}>
                                    <TableSortLabel
                                        active={sortBy.field === 'conductor'}
                                        direction={sortBy.dir === 'desc' ? 'desc' : 'asc'}
                                        onClick={() => handleSort('conductor')}
                                        IconComponent={sortBy.field === 'conductor' ? undefined : UnfoldMoreOutlinedIcon}
                                        sx={{
                                            color: 'inherit',
                                            '&:hover': { color: 'inherit' },
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '&.Mui-active:hover': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 1, fontSize: 16 },
                                        }}
                                    >
                                        Conductor
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Ruta</TableCell>
                                <TableCell sx={thStyle}>Anticipo</TableCell>
                                <TableCell sx={thStyle}>Gastado</TableCell>
                                <TableCell sx={thStyle}>Excedente</TableCell>
                                <TableCell sx={thStyle}>F. Entrega</TableCell>
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
                                            {filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== '' || filtroAnio !== '' || filtroMes !== ''
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
                                    const nombreConductor = getNombreConductor(anticipo)

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
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {nombreConductor}
                                                </Typography>
                                            </TableCell>

                                            {/* Ruta */}
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }} noWrap>
                                                    {anticipo.ruta?.nombreRuta || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Anticipo */}
                                            <TableCell sx={{ py: 2.5 }}>
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
                                            <TableCell sx={{ py: 2.5 }}>
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

                                            {/* Excedente */}
                                            <TableCell sx={{ py: 2.5 }}>
                                                {anticipo.valorGastado ? (
                                                    <Chip
                                                        label={`+${formatMoney(excedente)}`}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                            color: theme.palette.success.dark,
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
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {tienePermiso(PERMISOS.CONSULTAR_ANTICIPO) && (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton size="small" onClick={() => setAnticipoConsulta(anticipo)}
                                                                sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {tienePermiso(PERMISOS.ACTUALIZAR_ANTICIPO) && (
                                                        anticipo.habilitado === false ? (
                                                            <Tooltip title="Habilita el registro para poder editarlo">
                                                                <span>
                                                                    <IconButton size="small" disabled>
                                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        ) : ['En Legalización', 'Excedente pendiente', 'Completado'].includes(anticipo.estado) ? (
                                                            <Tooltip title={anticipo.estado === 'En Legalización'
                                                                ? 'La ruta ya está en curso: el conductor legaliza este anticipo desde la app móvil'
                                                                : anticipo.estado === 'Excedente pendiente'
                                                                    ? 'Este anticipo ya está legalizado: no se puede editar'
                                                                    : 'Este anticipo ya está completado: no se puede editar'}>
                                                                <span>
                                                                    <IconButton size="small" disabled>
                                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip title="Editar">
                                                                <IconButton size="small"
                                                                    onClick={() => { setAnticipoEditar(anticipo); setModalActualizarOpen(true) }}
                                                                    sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.activeBg } }}>
                                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )
                                                    )}
                                                    {tienePermiso(PERMISOS.INHABILITAR_ANTICIPO) && (
                                                        <ToggleSwitch id={anticipo.idAnticipoExcedente} checked={anticipo.habilitado !== false} onChange={() => handleToggleHabilitado(anticipo)} />
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
            <TablaPaginacionFooter
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
            />

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
                onSuccess={() => showToast('Anticipo registrado correctamente', 'success')}
            />

            <ActualizarAnticipoExcedente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setAnticipoEditar(null) }}
                anticipo={anticipoEditar}
                onSuccess={() => showToast('Anticipo actualizado correctamente', 'success')}
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
                            .then(() => showToast(habilitadoActual ? 'Anticipo inhabilitado' : 'Anticipo habilitado', habilitadoActual ? 'warning' : 'success'))
                            .catch(() => {})
                    }
                }}
                onConfirm={handleConfirmarToggle}
            />

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
                        El anticipo pasará a <strong>Completado</strong> y la fecha de entrega del excedente quedará registrada a la de hoy.
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
                    <Button onClick={handleConfirmarDevolucion} disabled={confirmandoEstado} variant="contained" disableRipple sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                        px: 5, py: 0.76, fontSize: '0.875rem',
                        backgroundColor: '#059669',
                        '&:hover': { backgroundColor: '#059669', filter: 'brightness(0.88)' },
                    }}>
                        {confirmandoEstado ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                    </Button>
                </Box>
            </Dialog>

        </Box>
    )
}

export default ListarAnticipoExcedente

