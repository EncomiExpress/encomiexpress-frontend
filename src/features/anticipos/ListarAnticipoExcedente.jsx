import theme from '../../shared/styles/theme.js'
import { useState } from 'react'
import { useAnticipos } from '../../shared/contexts/AnticipoExcedenteContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const filterSelectSx = {
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover': { backgroundColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E57373', borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
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
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: '#FFF5F5' },
                },
            },
        },
    },
}

const ESTADO_ANTICIPO_COLORS = {
    'pendiente': { bg: '#F3F4F6', color: '#6B7280' },
    'entregado': { bg: '#E3F2FD', color: '#1565C0' },
    'en legalización': { bg: '#FFF8E1', color: '#F57F17' },
    'legalizado': { bg: '#E8F5E9', color: '#2E7D32' },
    'excedente pendiente': { bg: '#FFF3E0', color: '#E65100' },
    'cerrado': { bg: '#F3E5F5', color: '#6A1B9A' },
}

const getEstadoColor = (estado) => {
    if (!estado) return { bg: '#F5F5F5', color: '#757575' }
    return ESTADO_ANTICIPO_COLORS[estado.toLowerCase()] || { bg: '#F5F5F5', color: '#757575' }
}

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

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
}

const CampoFila = ({ label, value, esEstado, estadoValue }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        {esEstado ? (
            <Chip
                label={estadoValue}
                size="small"
                sx={{
                    backgroundColor: ESTADO_ANTICIPO_COLORS[estadoValue]?.bg || '#F3F4F6',
                    color: ESTADO_ANTICIPO_COLORS[estadoValue]?.color || '#9CA3AF',
                    fontWeight: 600, fontSize: '0.72rem',
                    height: 22, borderRadius: 10, border: 'none', textTransform: 'capitalize',
                }}
            />
        ) : (
            <Typography variant="body2" fontWeight={500} color="#2D3748">
                {String(value ?? '—')}
            </Typography>
        )}
    </Box>
)

// ── Modal de consulta ────────────────────────────────────────────────────────
const ModalConsultar = ({ anticipo, conductores, rutas, onClose }) => {
    if (!anticipo) return null

    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
    const estadoStyle = ESTADO_ANTICIPO_COLORS[anticipo.estado] || { bg: '#F5F5F5', color: '#757575' }
    const soportes = anticipo.soportes || []

    const getNombreConductor = (id) => {
        const c = conductores.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 36, height: 36 }}>
                    <RouteIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={theme.palette.secondary.main}>
                        Anticipo #{anticipo.idAnticipoExcedente}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary}>
                        {getNombreConductor(anticipo.idConductor)} · {getNombreRuta(anticipo.idRuta)}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Datos del Anticipo</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Información principal del anticipo
                        </Typography>
                        <CampoFila label="Conductor" value={getNombreConductor(anticipo.idConductor)} />
                        <CampoFila label="Ruta" value={getNombreRuta(anticipo.idRuta)} />
                        <CampoFila label="Valor anticipo" value={formatMoney(anticipo.valorAnticipo)} />
                        <CampoFila label="Valor gastado" value={anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'} />
                        <CampoFila
                            label={excedente >= 0 ? 'Excedente' : 'Faltante'}
                            value={(excedente >= 0 ? '+' : '-') + formatMoney(Math.abs(excedente))}
                        />
                        <CampoFila label="Estado" value={anticipo.estado} esEstado estadoValue={anticipo.estado} />
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Fechas</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                            Fechas relacionadas al anticipo
                        </Typography>
                        <CampoFila label="F. Entrega" value={formatFecha(anticipo.fechaEntrega)} />
                        <CampoFila label="F. Legalización" value={formatFecha(anticipo.fechaLegalizacion)} />
                        <CampoFila label="F. Excedente" value={formatFecha(anticipo.fechaEntregaExcedente)} />
                        {anticipo.observaciones && (
                            <Box sx={{ pt: 1 }}>
                                <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600} display="block">Observaciones</Typography>
                                <Typography variant="body2" color={theme.palette.text.primary}>{anticipo.observaciones}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {soportes.length > 0 && (
                    <Paper elevation={0} sx={{ ...cardSx }}>
                        <Box sx={tituloSx}>
                            <ImageIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Soportes de pago</Typography>
                            <Chip label={`${soportes.length} archivo${soportes.length !== 1 ? 's' : ''}`} size="small"
                                sx={{ ml: 'auto', fontSize: '0.68rem', height: 20, backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                            {soportes.map((s, idx) => (
                                <Box key={idx} sx={{ width: 80, borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                                    {s.tipo === 'image' ? (
                                        <Box component="img" src={s.url} alt={s.nombre} sx={{ width: '100%', height: 60, objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                                            <InsertDriveFileIcon sx={{ color: theme.palette.text.secondary }} />
                                        </Box>
                                    )}
                                    <Typography variant="caption" sx={{ display: 'block', p: 0.5, fontSize: '0.6rem', color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.nombre}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Componente principal ─────────────────────────────────────────────────────
const ListarAnticipoExcedente = () => {
    const { anticipos, conductores, rutas, loading, toggleHabilitado, cambiarEstado } = useAnticipos()
    const { tienePermiso, PERMISOS } = useAuth()

    const [busqueda, setBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)

    // Helpers para resolver nombres desde los arrays del contexto
    const getNombreConductor = (id) => {
        const c = conductores.find(c => c.idConductor === parseInt(id))
        return c ? c.nombre : '—'
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? r.nombre : '—'
    }

    const anticiposFiltrados = anticipos.filter(a => {
        const q = busqueda.toLowerCase().trim()
        const nombreConductor = getNombreConductor(a.idConductor).toLowerCase()
        const nombreRuta = getNombreRuta(a.idRuta).toLowerCase()

        const coincideBusqueda = !q ||
            nombreConductor.includes(q) ||
            nombreRuta.includes(q) ||
            (a.observaciones || '').toLowerCase().includes(q) ||
            String(a.idAnticipoExcedente).includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && a.habilitado !== false) ||
            (filtroHabilitado === 'inhabilitado' && a.habilitado === false)

        const coincideEstadoAnticipo = filtroEstadoAnticipo === 'todos' || a.estado === filtroEstadoAnticipo

        return coincideBusqueda && coincideHabilitado && coincideEstadoAnticipo
    })

    const totalPages = Math.max(1, Math.ceil(anticiposFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedAnticipos = anticiposFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = anticiposFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, anticiposFiltrados.length)

    const handleToggleHabilitado = async (id) => {
        try {
            await toggleHabilitado(id)
            setSnackbar({ open: true, message: 'Estado de habilitación actualizado', severity: 'success' })
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'No se pudo cambiar el estado', severity: 'error' })
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress color="primary" />
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3.5 }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Anticipos y Excedentes
                        </Typography>
                        <Chip
                            label={`${anticipos.length} registrado${anticipos.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ backgroundColor: '#F3F4F6', color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.72rem', height: 22, borderRadius: 10 }}
                        />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los anticipos y excedentes de los conductores.
                    </Typography>
                </Box>
                {tienePermiso(PERMISOS.REGISTRAR_ANTICIPO) && (
                    <Button
                        onClick={() => setModalRegistrarOpen(true)}
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}
                    >
                        Nuevo anticipo
                    </Button>
                )}
            </Box>

            {/* Filtros de habilitado */}
            <Box sx={{ display: 'inline-flex', backgroundColor: '#FFECEC', borderRadius: 4, p: '4px', mb: 2.5, gap: '5px' }}>
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
                            px: 2, py: 0.5,
                            minWidth: 0,
                            fontWeight: filtroHabilitado === f.value ? 600 : 400,
                            backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                            color: filtroHabilitado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                                color: filtroHabilitado === f.value ? theme.palette.text.primary : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* Búsqueda + filtro estado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar anticipos..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
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

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: '#E57373' } }}>Estado del anticipo</InputLabel>
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

            {/* Tabla */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Conductor</TableCell>
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
                            {paginatedAnticipos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {anticipos.length === 0
                                                ? 'No hay anticipos registrados en el sistema.'
                                                : 'No se encontraron resultados con los filtros aplicados.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAnticipos.map((anticipo) => {
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
                                                        backgroundColor: anticipo.habilitado !== false ? '#FFCDD2' : theme.palette.divider,
                                                        fontSize: '0.73rem', fontWeight: 700,
                                                        color: anticipo.habilitado !== false ? '#C62828' : '#9CA3AF',
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
                                                        border: '1px solid #E0E0E0',
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
                    Mostrando {from}–{to} de {anticiposFiltrados.length} resultado{anticiposFiltrados.length !== 1 ? 's' : ''}
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
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E57373', borderWidth: '1px' },
                                '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
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
                                backgroundColor: theme.palette.background.subtle, borderColor: '#BDBDBD',
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Modales */}
            <ModalConsultar
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