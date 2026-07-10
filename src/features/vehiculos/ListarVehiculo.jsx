import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl, Menu,
    Dialog, DialogContent,
    Tooltip, Button, Avatar, CircularProgress,
    Pagination, TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import ToggleSwitch from '../../shared/components/ToggleSwitch.jsx'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import RegistrarVehiculo from './RegistrarVehiculo'
import ActualizarVehiculo from './ActualizarVehiculo'
import ModalConsultarVehiculo from './ModalConsultarVehiculo'
import ModalInhabilitarVehiculo from './ModalInhabilitarVehiculo'
import { getPageOfVehiculo } from '../../shared/services/vehiculoService.js'
import { getRutas } from '../../shared/services/rutaService'
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'
import { isVencido } from '../../shared/utils/formatters.js'
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

const ESTADOS_VEHICULO = ['Disponible', 'Mantenimiento', 'En Ruta']
const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Motocicleta', 'Otro']

const PlacaDisplay = ({ placa, theme }) => {
    const letras = placa?.slice(0, 3) ?? ''
    const numeros = placa?.slice(3) ?? ''
    const c = theme.palette.primary.main
    return (
        <Box sx={{
            position: 'relative',
            width: 60,
            height: 25,
            backgroundColor: alpha(c, 0.07),
            border: `1.5px solid ${alpha(c, 0.28)}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                    {letras}
                </Typography>
                <Box sx={{ width: 3, height: 3, backgroundColor: alpha(c, 0.5), borderRadius: '50%', mx: '2px', flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: c, lineHeight: 1, fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
                    {numeros}
                </Typography>
        </Box>
    )
}

const RutasMiniTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mt: 1.5 }}>
        <TableContainer sx={{ maxHeight: 140 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Destino</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rutas.map(r => {
                        const { color } = getEstadoColorRuta(r.estado)
                        const esProgramada = r.estado === 'Programada'
                        return (
                            <TableRow key={r.idRuta}
                                onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {r.nombreRuta || `#${r.idRuta}`}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                    {r.destino?.ciudad || '—'}
                                </TableCell>
                                <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: esProgramada ? 'transparent' : color, border: `2px solid ${color}` }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{r.estado}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

const ListarTransporte = () => {
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
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const initialLoad = useRef(true)
    const [vehiculoVer, setVehiculoVer] = useState(null)
    const { showToast } = useToast()
    const [estadoMenu, setEstadoMenu] = useState({ anchor: null, id: null, estadoActual: null })
    const [confirmMantenimiento, setConfirmMantenimiento] = useState({ open: false, id: null })
    const [confirmInhabilitar, setConfirmInhabilitar] = useState({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })
    const [rutasMantenimiento, setRutasMantenimiento] = useState({ data: [], loading: false })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [vehiculoEditar, setVehiculoEditar] = useState(null)
    const [sortBy, setSortBy] = useState({ field: 'placa', dir: 'asc' })
    const { getVehiculos, getTotal, updateEstado, toggleHabilitado, fetchVehiculos } = useVehiculo()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    const transportes = getVehiculos()
    const totalBackend = getTotal()

    const vehiculosOcupadosIds = new Set(
        rutasProgramadas
            .filter(r => r.estado === 'En Curso' && r.habilitado !== false)
            .map(r => r.idVehiculo)
    )

    const transportesConEstado = transportes.map(t => {
        const estaOcupado = vehiculosOcupadosIds.has(t.idVehiculo)
        return {
            ...t,
            estadoEfectivo: estaOcupado ? 'En Ruta' : t.estado,
        }
    })

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(t)
    }, [searchTerm])

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
            return
        }

        let cancelled = false
        const doFetch = async () => {
            setLoading(true)
            setError(null)
            try {
                await fetchVehiculos(undefined, {
                    page,
                    limit: rowsPerPage,
                    estado: filtroEstadoVehiculo === '' || filtroEstadoVehiculo === 'En Ruta' ? undefined : filtroEstadoVehiculo,
                    tipo: filtroTipo || undefined,
                    habilitado: filtroHabilitado === 'todo' ? undefined : filtroHabilitado === 'habilitado' ? 'true' : 'false',
                    sortBy: `${sortBy.field}.${sortBy.dir}`,
                    q: debouncedSearch.trim() || undefined,
                })
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        doFetch()
        return () => { cancelled = true }
    }, [usuario, navigate, page, rowsPerPage, filtroEstadoVehiculo, filtroTipo, filtroHabilitado, debouncedSearch, sortBy, fetchVehiculos])

    const handleSort = (field) => {
        setSortBy(prev => prev.field === field
            ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'asc' }
        )
        setPage(1)
    }

    useEffect(() => {
        if (!loading) initialLoad.current = false
    }, [loading])

    useEffect(() => {
        if (!usuario) return
        if (rutasProgramadas.length === 0) {
            fetchRutasProgramadas()
        }
    }, [usuario, rutasProgramadas.length, fetchRutasProgramadas])

    useEffect(() => {
        if (!highlightId || hasNavigated.current) return
        hasNavigated.current = true
        getPageOfVehiculo(highlightId, rowsPerPage)
            .then(res => { if (res?.data?.page) setPage(res.data.page) })
            .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightId])


    useEffect(() => {
        if (!confirmMantenimiento.open || !confirmMantenimiento.id) return
        setRutasMantenimiento({ data: [], loading: true })
        getRutas({ idVehiculo: confirmMantenimiento.id, estado: 'Programada', habilitado: 'true', limit: 100 })
            .then(res => setRutasMantenimiento({ data: res?.data || [], loading: false }))
            .catch(() => setRutasMantenimiento({ data: [], loading: false }))
    }, [confirmMantenimiento.open, confirmMantenimiento.id])

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            showToast(`Estado actualizado a ${nuevoEstado}.`, 'success')
        }
    }

    const handleToggleHabilitado = (id, habilitadoActual, estadoVehiculo, placa) => {
        setConfirmInhabilitar({ open: true, id, habilitadoActual, placa: placa || '', estadoVehiculo })
    }

    const onConfirmar = async () => {
        const { habilitadoActual } = confirmInhabilitar
        try {
            await toggleHabilitado(confirmInhabilitar.id)
            showToast(habilitadoActual ? 'Vehículo inhabilitado correctamente.' : 'Vehículo habilitado correctamente.', 'success')
        } catch (err) {
            showToast(err.message || 'Error al cambiar el estado del vehículo', 'error')
            throw err
        }
    }

    const filteredTransportes = transportesConEstado.filter(t => {
        const q = debouncedSearch.toLowerCase()
        const coincideBusqueda = !q ||
            t.placa.toLowerCase().includes(q) ||
            (t.marca || '').toLowerCase().includes(q) ||
            (t.modelo || '').toLowerCase().includes(q) ||
            (t.tipo || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && t.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && t.habilitado === false)

        const coincideEstado = filtroEstadoVehiculo === '' || t.estadoEfectivo === filtroEstadoVehiculo

        return coincideBusqueda && coincideHabilitado && coincideEstado
    })

    const handleExportar = () => {
        const rows = filteredTransportes.map(vehiculo => ({
            'ID': vehiculo.idVehiculo,
            'Placa': vehiculo.placa,
            'Marca': vehiculo.marca,
            'Modelo': vehiculo.modelo,
            'Tipo': vehiculo.tipo,
            'Estado': vehiculo.estadoEfectivo || vehiculo.estado,
            'Habilitado': vehiculo.habilitado === false ? 'No' : 'Sí',
        }))

        exportToExcel({ data: rows, fileName: 'vehiculos', sheetName: 'Vehículos' })
    }

    const limpiarBusqueda = () => {
        setSearchTerm('')
        setPage(1)
    }

    const totalPages = Math.max(1, Math.ceil(totalBackend / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const from = totalBackend === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, totalBackend)

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                        Vehículos
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los vehículos registrados en el sistema.
                    </Typography>
                 </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Button
                         onClick={handleExportar}
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

                     {tienePermiso(PERMISOS.REGISTRAR_VEHICULO) && (
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
                                    color: filtroHabilitado === f.value ? theme.palette.text.primary : theme.palette.primary.darker,
                                    boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                    border: 'none',
                                    '&:hover': {
                                        backgroundColor: filtroHabilitado === f.value ? theme.palette.background.paper : 'transparent',
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
                            value={filtroEstadoVehiculo}
                            onChange={e => { setFiltroEstadoVehiculo(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Estado'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroEstadoVehiculo ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {ESTADOS_VEHICULO.map(e => (
                                <MenuItem key={e} value={e}>
                                    {e}
                                    {filtroEstadoVehiculo === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            displayEmpty
                            value={filtroTipo}
                            onChange={e => { setFiltroTipo(e.target.value); setPage(1) }}
                            renderValue={v => v || 'Tipo'}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            sx={{
                                fontSize: '0.82rem', borderRadius: 4,
                                color: filtroTipo ? theme.palette.text.primary : theme.palette.text.secondary,
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                                '& .MuiTouchRipple-root': { display: 'none' },
                            }}
                            MenuProps={filterMenuProps}>
                            <MenuItem value="">Todos</MenuItem>
                            {TIPOS_VEHICULO.map(t => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                    {filtroTipo === t && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar vehículos..."
                        sx={{
                            width: 280,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main, borderWidth: '1px',
                                },
                            },
                        }}
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={limpiarBusqueda}>
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
                                        active={sortBy.field === 'placa'}
                                        direction={sortBy.field === 'placa' ? sortBy.dir : 'asc'}
                                        onClick={() => handleSort('placa')}
                                        sx={{
                                            color: 'inherit',
                                            '&.Mui-active': { color: theme.palette.primary.main },
                                            '& .MuiTableSortLabel-icon': { opacity: 0.4, fontSize: 16 },
                                            '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 },
                                        }}
                                    >
                                        Placa
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={thStyle}>Marca</TableCell>
                                <TableCell sx={thStyle}>Modelo</TableCell>
                                <TableCell sx={thStyle}>Tipo</TableCell>
                                <TableCell sx={thStyle}>Propietario</TableCell>
                                <TableCell sx={thStyle}>SOAT</TableCell>
                                <TableCell sx={thStyle}>Rev. Técnica</TableCell>
                                <TableCell sx={thStyle}>Seg. Terceros</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && initialLoad.current ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant="body2" color={theme.palette.text.secondary} mt={1.5}>
                                            Cargando vehículos...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                                        <Typography color="error" variant="body2">
                                            No se pudieron cargar los vehículos. Verifica la conexión con el servidor.
                                        </Typography>
                                        {import.meta.env.DEV && (
                                            <Box component="pre" sx={{ mt: 0.5, fontSize: 11, opacity: 0.7, whiteSpace: 'pre-wrap', m: 0 }}>
                                                {String(error)}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : !loading && filteredTransportes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {filtroEstadoVehiculo !== '' || filtroTipo !== '' || filtroHabilitado !== 'todo'
                                                ? 'No se encontraron vehículos que coincidan con los filtros aplicados.'
                                                : debouncedSearch.trim()
                                                    ? 'No se encontraron vehículos que coincidan con la búsqueda.'
                                                    : 'No hay vehículos registrados en el sistema.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransportes.map((transporte) => {
                                    const isHighlighted = highlightId && String(transporte.idVehiculo) === String(highlightId)
                                    return (
                                    <TableRow
                                        key={transporte.idVehiculo}
                                        ref={isHighlighted ? highlightRef : null}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: transporte.habilitado !== false ? 1 : 0.55,
                                            ...(isHighlighted && {
                                                animation: 'highlightPulse 1.1s ease-in-out 4',
                                                '@keyframes highlightPulse': {
                                                    '0%, 100%': { backgroundColor: 'transparent' },
                                                    '50%': { backgroundColor: alpha(theme.palette.primary.main, 0.13) },
                                                },
                                            }),
                                        }}
                                    >
                                        <TableCell>
                                            <PlacaDisplay placa={transporte.placa} theme={theme} />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.marca}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{transporte.modelo}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.tipo || '—'}
                                                size="small"
                                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            {transporte.propietario
                                                ? `${transporte.propietario.nombre} ${transporte.propietario.apellido}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.vencimientoSOAT ? new Date(transporte.vencimientoSOAT).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                variant={isVencido(transporte.vencimientoSOAT) ? 'filled' : 'outlined'}
                                                sx={isVencido(transporte.vencimientoSOAT)
                                                    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                                    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                                }
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.vencimientoRevisionTecnica ? new Date(transporte.vencimientoRevisionTecnica).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                variant={isVencido(transporte.vencimientoRevisionTecnica) ? 'filled' : 'outlined'}
                                                sx={isVencido(transporte.vencimientoRevisionTecnica)
                                                    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                                    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                                }
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={transporte.vencimientoSeguroTerceros ? new Date(transporte.vencimientoSeguroTerceros).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                variant={isVencido(transporte.vencimientoSeguroTerceros) ? 'filled' : 'outlined'}
                                                sx={isVencido(transporte.vencimientoSeguroTerceros)
                                                    ? { fontSize: '0.7rem', backgroundColor: theme.palette.primary.main, color: 'white', borderColor: theme.palette.primary.main }
                                                    : { fontSize: '0.7rem', color: theme.palette.primary.main, borderColor: theme.palette.primary.main }
                                                }
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            {transporte.estadoEfectivo === 'En Ruta' ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }} />
                                                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#3B82F6' }}>En Ruta</Typography>
                                                </Box>
                                            ) : (
                                                <Box
                                                    onClick={(e) => setEstadoMenu({ anchor: e.currentTarget, id: transporte.idVehiculo, estadoActual: transporte.estadoEfectivo })}
                                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, px: 1, py: 0.6, '&:hover': { borderColor: theme.palette.text.secondary } }}
                                                >
                                                    <Box sx={{
                                                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                                        ...(transporte.estadoEfectivo === 'Disponible'
                                                            ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                                                            : { backgroundColor: '#ea580c', border: '2px solid #ea580c' })
                                                    }} />
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '0.82rem', fontWeight: 500,
                                                        color: transporte.estadoEfectivo === 'Disponible' ? '#10b981' : '#ea580c',
                                                    }}>
                                                        {transporte.estadoEfectivo}
                                                    </Typography>
                                                    <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', ml: 'auto' }} />
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_VEHICULO) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setVehiculoVer(transporte)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_VEHICULO) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setVehiculoEditar(transporte); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.INHABILITAR_VEHICULO) && (
                                                    <ToggleSwitch id={transporte.idVehiculo} checked={transporte.habilitado !== false} onChange={() => handleToggleHabilitado(transporte.idVehiculo, transporte.habilitado, transporte.estadoEfectivo, transporte.placa)} />
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

            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Mostrando {from}–{to} de {totalBackend} resultado{totalBackend !== 1 ? 's' : ''}
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
                                borderColor: theme.palette.divider,
                            },
                        }}
                    />
                </Box>
            </Box>

            {vehiculoVer && (
                <ModalConsultarVehiculo vehiculo={vehiculoVer} onClose={() => setVehiculoVer(null)} />
            )}

            <RegistrarVehiculo
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo registrado correctamente', 'success')
                }}
            />

            <ActualizarVehiculo
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setVehiculoEditar(null) }}
                transporte={vehiculoEditar}
                onSuccess={() => {
                    fetchVehiculos()
                    showToast('Vehículo actualizado correctamente', 'success')
                }}
            />

            <ModalInhabilitarVehiculo
                open={confirmInhabilitar.open}
                data={confirmInhabilitar}
                onClose={() => setConfirmInhabilitar(s => ({ ...s, open: false }))}
                onExited={() => setConfirmInhabilitar({ open: false, id: null, habilitadoActual: null, placa: '', estadoVehiculo: null })}
                onConfirm={onConfirmar}
            />

            <Menu
                anchorEl={estadoMenu.anchor}
                open={Boolean(estadoMenu.anchor)}
                onClose={() => setEstadoMenu(prev => ({ ...prev, anchor: null }))}
                slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, mt: 0.5 } } }}
            >
                {['Disponible', 'Mantenimiento'].filter(op => estadoMenu.estadoActual !== op).map((op) => (
                    <MenuItem key={op} onClick={() => {
                        setEstadoMenu(prev => ({ ...prev, anchor: null }))
                        if (op === 'Mantenimiento') {
                            setConfirmMantenimiento({ open: true, id: estadoMenu.id })
                        } else {
                            handleEstadoChange(estadoMenu.id, op)
                        }
                    }}
                        sx={{ fontSize: '0.82rem', gap: 1 }}>
                        <Box sx={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                            ...(op === 'Disponible'
                                ? { backgroundColor: 'transparent', border: '2px solid #10b981' }
                                : { backgroundColor: '#ea580c', border: '2px solid #ea580c' })
                        }} />
                        {op}
                    </MenuItem>
                ))}
            </Menu>

            {/* Modal cambiar estado a Mantenimiento */}
            <Dialog
                open={confirmMantenimiento.open}
                onClose={() => setConfirmMantenimiento({ open: false, id: null })}
                TransitionProps={{ onExited: () => setRutasMantenimiento({ data: [], loading: false }) }}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogContent sx={{ p: 3, position: 'relative' }}>
                    <IconButton
                        onClick={() => setConfirmMantenimiento({ open: false, id: null })}
                        sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2, textAlign: 'center' }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SwapHorizOutlinedIcon sx={{ fontSize: 35, color: theme.palette.warning.main }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="1.35rem" color={theme.palette.text.primary}>
                            Cambiar a Mantenimiento
                        </Typography>
                        {rutasMantenimiento.loading ? (
                            <CircularProgress size={24} sx={{ mt: 1 }} />
                        ) : rutasMantenimiento.data.length > 0 ? (
                            <>
                                <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                    Este vehículo tiene {rutasMantenimiento.data.length === 1 ? 'una ruta programada' : 'rutas programadas'}. {rutasMantenimiento.data.length === 1 ? 'No podrá ponerse en curso' : 'No podrán ponerse en curso'} mientras esté en mantenimiento.
                                </Typography>
                                <RutasMiniTabla rutas={rutasMantenimiento.data} theme={theme} />
                            </>
                        ) : (
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                ¿Seguro que deseas cambiarlo a <Box component="span" fontWeight={700} color={theme.palette.warning.main}>Mantenimiento</Box>?
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                        <Button onClick={() => setConfirmMantenimiento({ open: false, id: null })} disableRipple
                            sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                            Cancelar
                        </Button>
                        <Button onClick={() => { handleEstadoChange(confirmMantenimiento.id, 'Mantenimiento'); setConfirmMantenimiento({ open: false, id: null }) }}
                            variant="contained" disableRipple
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.warning.main, '&:hover': { backgroundColor: theme.palette.warning.dark } }}>
                            Confirmar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

        </Box>
    )
}

export default ListarTransporte

