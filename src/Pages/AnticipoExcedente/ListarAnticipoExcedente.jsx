import { useState } from 'react'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'
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
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import PersonIcon from '@mui/icons-material/Person'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente'

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

// ── Estilos reutilizables para los Select de filtros ──
const filterSelectSx = {
    fontSize: '0.82rem',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
    '&:hover': { backgroundColor: 'transparent' },
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

const ESTADO_COLORS = {
    'entregado': { bg: '#E3F2FD', color: '#1565C0' },
    'en legalización': { bg: '#FFF8E1', color: '#F57F17' },
    'legalizado': { bg: '#E8F5E9', color: '#2E7D32' },
    'excedente pendiente': { bg: '#FFF3E0', color: '#E65100' },
    'cerrado': { bg: '#F3E5F5', color: '#6A1B9A' },
    'activo': { bg: 'transparent', color: '#10b981' },
    'inactivo': { bg: 'transparent', color: '#dc2626' },
    'habilitado': { bg: '#DCFCE7', color: '#16A34A' },
    'inhabilitado': { bg: '#F3F4F6', color: '#9CA3AF' },
}

const getEstadoColor = (estado) => {
    if (!estado) return { bg: '#F5F5F5', color: '#757575' }
    return ESTADO_COLORS[estado.toLowerCase()] || { bg: '#F5F5F5', color: '#757575' }
}

const FILTROS_ESTADO = [
    { value: 'todo', label: 'Todo' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
]

const FILTROS_ANTICIPO = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'en legalización', label: 'En legalización' },
    { value: 'legalizado', label: 'Legalizado' },
    { value: 'excedente pendiente', label: 'Excedente pendiente' },
    { value: 'cerrado', label: 'Cerrado' },
]

const ESTADOS_HABILITADO = [
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
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

const getNombreConductor = (id) => {
    const c = conductoresMock.find(c => c.idConductor === parseInt(id))
    return c ? c.nombre : '—'
}

const getNombreRuta = (id) => {
    const r = rutasMock.find(r => r.idRuta === parseInt(id))
    return r ? `${r.idRuta} - ${r.nombre}` : '—'
}

// ── Fila de campo reutilizable ──
const CampoFila = ({ label, value, esEstado, estadoValue }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
        <Typography variant="body2" sx={{ color: '#9C4040', fontWeight: 500 }}>{label}</Typography>
        {esEstado ? (
            <Chip
                label={estadoValue}
                size="small"
                sx={{
                    backgroundColor: ESTADO_COLORS[estadoValue]?.bg || '#F3F4F6',
                    color: ESTADO_COLORS[estadoValue]?.color || '#9CA3AF',
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

// ── Modal Consultar ──
const ModalConsultar = ({ anticipo, onClose }) => {
    if (!anticipo) return null

    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
    const estadoStyle = ESTADO_COLORS[anticipo.estado] || { bg: '#F5F5F5', color: '#757575' }
    const soportes = anticipo.soportes || []

    const cardSx = { borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white' }
    const tituloSx = { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>

            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 36, height: 36 }}>
                    <RouteIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                    <Typography fontWeight={700} color={COLORS.secondary}>
                        Anticipo #{anticipo.idAnticipoExcedente}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>
                        {getNombreConductor(anticipo.idConductor)} · {getNombreRuta(anticipo.idRuta)}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper elevation={0} sx={{ ...cardSx, flex: 1 }}>
                        <Box sx={tituloSx}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Datos del Anticipo</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
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
                            <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Fechas</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                            Fechas relacionadas al anticipo
                        </Typography>
                        <CampoFila label="F. Entrega" value={formatFecha(anticipo.fechaEntrega)} />
                        <CampoFila label="F. Legalización" value={formatFecha(anticipo.fechaLegalizacion)} />
                        <CampoFila label="F. Excedente" value={formatFecha(anticipo.fechaEntregaExcedente)} />
                        {anticipo.observaciones && (
                            <>
                                <Box sx={{ pt: 1 }}>
                                    <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Observaciones</Typography>
                                    <Typography variant="body2" color={COLORS.text}>{anticipo.observaciones}</Typography>
                                </Box>
                            </>
                        )}
                    </Paper>
                </Box>

                {soportes.length > 0 && (
                    <Paper elevation={0} sx={{ ...cardSx }}>
                        <Box sx={tituloSx}>
                            <ImageIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Soportes de pago</Typography>
                            <Chip label={`${soportes.length} archivo${soportes.length !== 1 ? 's' : ''}`} size="small" sx={{ ml: 'auto', fontSize: '0.68rem', height: 20, backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                            {soportes.map((s, idx) => (
                                <Box key={idx} sx={{ width: 80, borderRadius: 1, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
                                    {s.tipo === 'image' ? (
                                        <Box component="img" src={s.url} alt={s.nombre} sx={{ width: '100%', height: 60, objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                                            <InsertDriveFileIcon sx={{ color: COLORS.textMuted }} />
                                        </Box>
                                    )}
                                    <Typography variant="caption" sx={{ display: 'block', p: 0.5, fontSize: '0.6rem', color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.nombre}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// ── Componente principal ──
const ListarAnticipoExcedente = () => {
    const { anticipos, toggleHabilitado, cambiarEstado } = useAnticipos()

    const [busqueda, setBusqueda] = useState('')
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [filtroEstadoAnticipo, setFiltroEstadoAnticipo] = useState('todos')
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [cambiandoEstado, setCambiandoEstado] = useState(null)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [anticipoEditar, setAnticipoEditar] = useState(null)

    const anticiposFiltrados = anticipos.filter(a => {
        const q = busqueda.toLowerCase().trim()
        const nombreConductor = getNombreConductor(a.idConductor).toLowerCase()
        const nombreRuta = getNombreRuta(a.idRuta).toLowerCase()

        const coincideBusqueda = !q ||
            nombreConductor.includes(q) ||
            nombreRuta.includes(q) ||
            (a.observaciones || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'Activo' && a.habilitado !== false) ||
            (filtroHabilitado === 'Inactivo' && a.habilitado === false)

        const coincideEstadoAnticipo = filtroEstadoAnticipo === 'todos' || a.estado === filtroEstadoAnticipo

        return coincideBusqueda && coincideHabilitado && coincideEstadoAnticipo
    })

    const totalPages = Math.max(1, Math.ceil(anticiposFiltrados.length / rowsPerPage))
    const safePage = Math.min(page, totalPages)
    const paginatedAnticipos = anticiposFiltrados.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    const from = anticiposFiltrados.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
    const to = Math.min(safePage * rowsPerPage, anticiposFiltrados.length)



    const handleCambiarEstado = (id, nuevoEstado) => {
        const anticipo = anticipos.find(a => a.idAnticipoExcedente === id)
        if (!anticipo) return

        if (nuevoEstado === 'Activo') {
            if (anticipo.habilitado === false) {
                toggleHabilitado(id)
                setSnackbar({ open: true, message: 'Anticipo activo correctamente.', severity: 'success' })
            }
            return
        }

        if (nuevoEstado === 'Inactivo') {
            if (anticipo.habilitado !== false) {
                toggleHabilitado(id)
                setSnackbar({ open: true, message: 'Anticipo inactivo correctamente.', severity: 'warning' })
            }
            return
        }

        cambiarEstado(id, nuevoEstado)
        setSnackbar({ open: true, message: 'Estado actualizado correctamente.', severity: 'success' })
    }

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Anticipos y Excedentes
                        </Typography>
                        <Chip
                            label={`${anticipos.length} registrado${anticipos.length !== 1 ? 's' : ''}`}
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
                    </Box>
                    <Typography variant="body2" color={COLORS.textMuted} mt={0.3}>
                        Gestiona los anticipos y excedentes de los conductores.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setModalRegistrarOpen(true)}
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
                    Nuevo anticipo
                </Button>
            </Box>

            {/* ── Filtros de estado ── */}
            <Box sx={{
                display: 'inline-flex',
                backgroundColor: '#FFECEC',
                borderRadius: 4,
                p: '4px',
                mb: 2.5,
                gap: '5px',
            }}>
                {FILTROS_ESTADO.map(f => (
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
                            boxShadow: filtroHabilitado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
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

            {/* ── Búsqueda + filtros ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar anticipos..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': {
                                boxShadow: '0 0 0 3px rgba(229,115,115,0.18)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#CC1818',
                                borderWidth: '1px',
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

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ fontSize: '0.82rem', '&.Mui-focused': { color: '#E57373' } }}>Estado anticipo</InputLabel>
                    <Select value={filtroEstadoAnticipo} label="Estado anticipo"
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

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
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
                                    <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            {anticipos.length === 0
                                                ? 'No hay anticipos registrados en el sistema.'
                                                : busqueda.trim() !== '' || filtroHabilitado !== 'todo' || filtroEstadoAnticipo !== 'todos'
                                                    ? 'No se encontraron resultados con la búsqueda y los filtros aplicados.'
                                                    : 'No se encontraron anticipos.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAnticipos.map((anticipo) => {
                                    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)

                                    return (
                                        <TableRow
                                            key={anticipo.idAnticipoExcedente}
                                            sx={{
                                                '&:hover': { backgroundColor: COLORS.hoverBg },
                                                transition: 'background-color 0.15s',
                                                opacity: anticipo.habilitado !== false ? 1 : 0.55,
                                            }}
                                        >
                                            {/* Conductor */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        width: 34, height: 34,
                                                        backgroundColor: '#FFCDD2',
                                                        fontSize: '0.73rem',
                                                        fontWeight: 700,
                                                        color: '#C62828',
                                                    }}>
                                                        {getNombreConductor(anticipo.idConductor).split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} color={COLORS.text} noWrap>
                                                        {getNombreConductor(anticipo.idConductor)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* Ruta */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={COLORS.textMuted} fontSize="0.75rem">
                                                    Ruta {anticipo.idRuta}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color={COLORS.text} fontSize="0.8rem" noWrap>
                                                    {getNombreRuta(anticipo.idRuta).split(' - ')[1] || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Anticipo */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600} color={COLORS.secondary} fontSize="0.82rem">
                                                    {formatMoney(anticipo.valorAnticipo)}
                                                </Typography>
                                            </TableCell>

                                            {/* Gastado */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color={anticipo.valorGastado ? COLORS.text : COLORS.textMuted} fontSize="0.82rem">
                                                    {anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Excedente */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                {anticipo.valorGastado ? (
                                                    <Typography variant="body2" fontWeight={600} fontSize="0.82rem"
                                                        color={excedente >= 0 ? '#2E7D32' : COLORS.primary}>
                                                        {excedente >= 0 ? '+' : '-'}{formatMoney(Math.abs(excedente))}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color={COLORS.textMuted} fontSize="0.82rem">—</Typography>
                                                )}
                                            </TableCell>

                                            {/* Fecha */}
                                            <TableCell sx={{ fontSize: '0.8rem', color: COLORS.text, py: 1.5 }}>
                                                {formatFecha(anticipo.fechaEntrega)}
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell sx={{ py: 1.5, minWidth: 140 }}>
                                                {cambiandoEstado === anticipo.idAnticipoExcedente ? (
                                                    <CircularProgress size={20} sx={{ color: COLORS.primary }} />
                                                ) : (
                                                    <Select
                                                        value={anticipo.habilitado === false ? 'Inactivo' : anticipo.estado || 'entregado'}
                                                        onChange={(e) => handleCambiarEstado(anticipo.idAnticipoExcedente, e.target.value)}
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
                                                                    {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
                                                                </Box>
                                                            )
                                                        }}
                                                        IconComponent={KeyboardArrowDownOutlinedIcon}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                            color: '#1a0e0c',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 600,
                                                            height: 26,
                                                            borderRadius: 0,
                                                            border: '1px solid #E0E0E0',
                                                            '& .MuiSelect-select': {
                                                                py: 0.8,
                                                                px: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                border: 'none',
                                                            },
                                                            '& .MuiSelect-icon': {
                                                                color: '#8A94A6',
                                                                fontSize: 18,
                                                            },
                                                        }}
                                                        MenuProps={{
                                                            slotProps: {
                                                                paper: {
                                                                    sx: {
                                                                        borderRadius: 2,
                                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                                        mt: 0.5,
                                                                    },
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {[...FILTROS_ANTICIPO.slice(1).map(est => est.value), 'Activo', 'Inactivo'].map(estado => {
                                                            const style = getEstadoColor(estado)
                                                            return (
                                                                <MenuItem key={estado} value={estado} dense>
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
                                                                        {String(estado).charAt(0).toUpperCase() + String(estado).slice(1)}
                                                                    </Box>
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                )}
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setAnticipoConsulta(anticipo)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => { setAnticipoEditar(anticipo); setModalActualizarOpen(true) }}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color={COLORS.textMuted} fontWeight={500}>
                    Mostrando {from}–{to} de {anticiposFiltrados.length} resultado{anticiposFiltrados.length !== 1 ? 's' : ''}
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

            <ModalConsultar anticipo={anticipoConsulta} onClose={() => setAnticipoConsulta(null)} />

            <RegistrarAnticipoExcedente
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Anticipo registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarAnticipoExcedente
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setAnticipoEditar(null) }}
                anticipo={anticipoEditar}
                onSuccess={() => {
                    setSnackbar({ open: true, message: 'Anticipo actualizado correctamente', severity: 'success' })
                }}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarAnticipoExcedente