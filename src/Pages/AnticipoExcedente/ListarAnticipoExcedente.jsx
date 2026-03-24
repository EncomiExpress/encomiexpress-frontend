import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    TextField, IconButton, Chip, Tooltip, InputAdornment,
    MenuItem, Select, FormControl, InputLabel, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, Grid, Divider
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import RouteIcon from '@mui/icons-material/Route'
import PersonIcon from '@mui/icons-material/Person'
import ImageIcon from '@mui/icons-material/Image'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

const COLORS = {
    primary: '#CC1818',
    secondary: '#1A2E6E',
    text: '#2D3748',
    textMuted: '#8A94A6',
    border: '#E0E0E0',
    activeBg: '#FFE8E8',
    hoverBg: '#F9F9F9',
}

const ESTADO_COLORS = {
    'entregado':           { bg: '#E3F2FD', color: '#1565C0' },
    'en legalización':     { bg: '#FFF8E1', color: '#F57F17' },
    'legalizado':          { bg: '#E8F5E9', color: '#2E7D32' },
    'excedente pendiente': { bg: '#FFF3E0', color: '#E65100' },
    'cerrado':             { bg: '#F3E5F5', color: '#6A1B9A' },
}

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

// ── Modal ver imagen ampliada ──
const ModalImagenAmpliada = ({ soporte, onClose }) => {
    if (!soporte) return null
    return (
        <Dialog open onClose={onClose} maxWidth="md" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                    <Typography fontWeight={700} color={COLORS.secondary} fontSize="0.9rem">{soporte.nombre}</Typography>
                </Box>
                <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <img src={soporte.url} alt={soporte.nombre}
                    style={{ width: '100%', display: 'block', maxHeight: '65vh', objectFit: 'contain', backgroundColor: '#f5f5f5' }} />
                <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 3 }}>
                    <Typography variant="caption" color={COLORS.textMuted}>Subido por: <strong>{soporte.subidoPor}</strong></Typography>
                    <Typography variant="caption" color={COLORS.textMuted}>Fecha: <strong>{soporte.fecha}</strong></Typography>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

// ── Miniatura de soporte en modal consultar ──
const MiniaturaConsulta = ({ soporte, onVer }) => {
    const esImagen = soporte.tipo === 'image'
    return (
        <Box
            onClick={() => esImagen && onVer(soporte)}
            sx={{
                border: `1px solid ${COLORS.border}`, borderRadius: 2, overflow: 'hidden',
                cursor: esImagen ? 'pointer' : 'default',
                position: 'relative',
                '&:hover .mini-overlay': { opacity: esImagen ? 1 : 0 },
            }}
        >
            {esImagen ? (
                <Box component="img" src={soporte.url} alt={soporte.nombre}
                    sx={{ width: '100%', height: 80, objectFit: 'cover', display: 'block', backgroundColor: '#f5f5f5' }} />
            ) : (
                <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                    <InsertDriveFileIcon sx={{ fontSize: 32, color: COLORS.textMuted }} />
                </Box>
            )}
            <Box className="mini-overlay" sx={{
                position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
            }}>
                <ZoomInIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            {soporte.subidoPor === 'Conductor' && (
                <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                    <Chip label="Conductor" size="small"
                        sx={{ fontSize: '0.58rem', height: 16, backgroundColor: 'rgba(26,46,110,0.85)', color: '#fff', fontWeight: 600 }} />
                </Box>
            )}
            <Box sx={{ px: 0.8, py: 0.5 }}>
                <Typography variant="caption" color={COLORS.textMuted} noWrap display="block" fontSize="0.65rem">{soporte.nombre}</Typography>
            </Box>
        </Box>
    )
}

// ── Modal Consultar ──
const ModalConsultar = ({ anticipo, onClose }) => {
    const [imagenVista, setImagenVista] = useState(null)
    if (!anticipo) return null

    const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
    const estadoStyle = ESTADO_COLORS[anticipo.estado] || { bg: '#F5F5F5', color: '#757575' }
    const soportes = anticipo.soportes || []

    return (
        <>
            <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <Avatar sx={{ backgroundColor: COLORS.secondary, width: 36, height: 36 }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
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
                    <Grid container spacing={2}>
                        {/* Datos principales */}
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Conductor</Typography>
                            <Typography variant="body2" fontWeight={500} color={COLORS.text}>{getNombreConductor(anticipo.idConductor)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Ruta</Typography>
                            <Typography variant="body2" fontWeight={500} color={COLORS.text}>{getNombreRuta(anticipo.idRuta)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Valor anticipo</Typography>
                            <Typography variant="body2" fontWeight={600} color={COLORS.secondary}>{formatMoney(anticipo.valorAnticipo)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Valor gastado</Typography>
                            <Typography variant="body2" fontWeight={500} color={COLORS.text}>{anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">
                                {excedente >= 0 ? 'Excedente' : 'Faltante'}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color={excedente >= 0 ? '#2E7D32' : COLORS.primary}>
                                {excedente >= 0 ? '+' : '-'}{formatMoney(Math.abs(excedente))}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Estado</Typography>
                            <Chip label={anticipo.estado} size="small" sx={{
                                mt: 0.3, fontSize: '0.7rem', fontWeight: 600, height: 20,
                                backgroundColor: estadoStyle.bg, color: estadoStyle.color, textTransform: 'capitalize',
                            }} />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">F. Entrega</Typography>
                            <Typography variant="body2" color={COLORS.text}>{formatFecha(anticipo.fechaEntrega)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">F. Legalización</Typography>
                            <Typography variant="body2" color={COLORS.text}>{formatFecha(anticipo.fechaLegalizacion)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">F. Excedente</Typography>
                            <Typography variant="body2" color={COLORS.text}>{formatFecha(anticipo.fechaEntregaExcedente)}</Typography>
                        </Grid>
                        {anticipo.observaciones && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color={COLORS.textMuted} fontWeight={600} display="block">Observaciones</Typography>
                                <Typography variant="body2" color={COLORS.text}>{anticipo.observaciones}</Typography>
                            </Grid>
                        )}

                        {/* ── Soportes ── */}
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 1.5 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color={COLORS.textMuted} fontWeight={700} display="block">
                                    Soportes de pago
                                </Typography>
                                <Chip
                                    label={`${soportes.length} archivo${soportes.length !== 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{ fontSize: '0.68rem', height: 20, backgroundColor: soportes.length > 0 ? '#E8F5E9' : '#F5F5F5', color: soportes.length > 0 ? '#2E7D32' : COLORS.textMuted, fontWeight: 600 }}
                                />
                            </Box>

                            {soportes.length === 0 ? (
                                <Box sx={{ py: 2, textAlign: 'center', backgroundColor: '#FAFAFA', borderRadius: 2, border: `1px dashed ${COLORS.border}` }}>
                                    <Typography variant="caption" color={COLORS.textMuted} fontStyle="italic">
                                        El conductor aún no ha subido soportes
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1 }}>
                                    {soportes.map(s => (
                                        <MiniaturaConsulta key={s.id} soporte={s} onVer={setImagenVista} />
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} variant="contained"
                        sx={{ backgroundColor: COLORS.secondary, borderRadius: 2, textTransform: 'none' }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <ModalImagenAmpliada soporte={imagenVista} onClose={() => setImagenVista(null)} />
        </>
    )
}

// ── Componente principal ──
const ListarAnticipoExcedente = () => {
    const navigate = useNavigate()
    const { anticipos, cambiarEstado } = useAnticipos()

    const [busqueda, setBusqueda] = useState('')
    const [filtroPor, setFiltroPor] = useState('todo')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [filtroRuta, setFiltroRuta] = useState('todos')
    const [filtroConductor, setFiltroConductor] = useState('todos')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [anticipoConsulta, setAnticipoConsulta] = useState(null)

    const anticiposFiltrados = anticipos.filter(a => {
        const q = busqueda.toLowerCase()
        let coincideBusqueda = true

        if (q) {
            const nombreConductor = getNombreConductor(a.idConductor).toLowerCase()
            const nombreRuta = getNombreRuta(a.idRuta).toLowerCase()
            switch (filtroPor) {
                case 'conductor': coincideBusqueda = nombreConductor.includes(q); break
                case 'ruta': coincideBusqueda = nombreRuta.includes(q); break
                case 'soporte': coincideBusqueda = (a.observaciones || '').toLowerCase().includes(q); break
                default:
                    coincideBusqueda =
                        nombreConductor.includes(q) ||
                        nombreRuta.includes(q) ||
                        (a.observaciones || '').toLowerCase().includes(q)
            }
        }

        const coincideEstado = filtroEstado === 'todos' || a.estado === filtroEstado
        const coincideRuta = filtroRuta === 'todos' || parseInt(a.idRuta) === parseInt(filtroRuta)
        const coincideConductor = filtroConductor === 'todos' || parseInt(a.idConductor) === parseInt(filtroConductor)

        return coincideBusqueda && coincideEstado && coincideRuta && coincideConductor
    })

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroPor('todo')
        setFiltroEstado('todos')
        setFiltroRuta('todos')
        setFiltroConductor('todos')
        setPage(0)
    }

    // Función para cambiar el estado directamente en la tabla
    const handleEstadoChange = (id, nuevoEstado) => {
        cambiarEstado(id, nuevoEstado)
    }

    const hayFiltrosActivos = busqueda || filtroEstado !== 'todos' || filtroRuta !== 'todos' || filtroConductor !== 'todos'

    return (
        <Box sx={{ p: 1 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccountBalanceWalletIcon sx={{ color: COLORS.primary, fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>
                            Anticipos y Excedentes
                        </Typography>
                        <Typography variant="caption" color={COLORS.textMuted}>
                            {anticiposFiltrados.length} resultado{anticiposFiltrados.length !== 1 ? 's' : ''} encontrado{anticiposFiltrados.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    onClick={() => navigate('/anticipos/registrar')}
                    variant="contained" size="small"
                    sx={{ backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: '#a01212' } }}
                >
                    + Nuevo anticipo
                </Button>
            </Box>

            {/* ── Filtros ── */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <FilterListIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} />
                    <Typography variant="caption" fontWeight={700} color={COLORS.textMuted} display="block">
                        Filtros y búsqueda
                    </Typography>
                    {hayFiltrosActivos && (
                        <Chip label="Limpiar" size="small"
                            icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={limpiarFiltros}
                            sx={{ ml: 'auto', fontSize: '0.72rem', height: 24, cursor: 'pointer', backgroundColor: COLORS.activeBg, color: COLORS.primary }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Buscar por</InputLabel>
                        <Select value={filtroPor} label="Buscar por"
                            onChange={e => { setFiltroPor(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todo">Todo</MenuItem>
                            <MenuItem value="conductor">Conductor</MenuItem>
                            <MenuItem value="ruta">Ruta</MenuItem>
                            <MenuItem value="soporte">Observaciones</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small" placeholder="Escribe para buscar..."
                        value={busqueda} onChange={e => { setBusqueda(e.target.value); setPage(0) }}
                        sx={{ flex: 1, minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.textMuted, fontSize: 18 }} /></InputAdornment>,
                            endAdornment: busqueda && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setBusqueda('')}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 175 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonIcon sx={{ fontSize: 14 }} /> Conductor</Box>
                        </InputLabel>
                        <Select value={filtroConductor} label="  Conductor"
                            onChange={e => { setFiltroConductor(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            {conductoresMock.map(c => (
                                <MenuItem key={c.idConductor} value={c.idConductor} sx={{ fontSize: '0.82rem' }}>{c.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><RouteIcon sx={{ fontSize: 14 }} /> Ruta</Box>
                        </InputLabel>
                        <Select value={filtroRuta} label="  Ruta"
                            onChange={e => { setFiltroRuta(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todas</MenuItem>
                            {rutasMock.map(r => (
                                <MenuItem key={r.idRuta} value={r.idRuta} sx={{ fontSize: '0.82rem' }}>{r.idRuta} - {r.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 175 }}>
                        <InputLabel sx={{ fontSize: '0.82rem' }}>Estado</InputLabel>
                        <Select value={filtroEstado} label="Estado"
                            onChange={e => { setFiltroEstado(e.target.value); setPage(0) }}
                            sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="entregado">Entregado</MenuItem>
                            <MenuItem value="en legalización">En legalización</MenuItem>
                            <MenuItem value="legalizado">Legalizado</MenuItem>
                            <MenuItem value="excedente pendiente">Excedente pendiente</MenuItem>
                            <MenuItem value="cerrado">Cerrado</MenuItem>
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
                                {['#', 'Conductor', 'Ruta', 'Anticipo', 'Gastado', 'Excedente', 'Soportes', 'Fecha entrega', 'Estado', 'Acciones'].map(col => (
                                    <TableCell key={col} sx={{
                                        fontWeight: 700, fontSize: '0.75rem', color: COLORS.textMuted,
                                        py: 1.5,
                                        borderBottom: `2px solid ${COLORS.border}`, whiteSpace: 'nowrap',
                                    }}>
                                        {col}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {anticiposFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            No se encontraron registros con los filtros aplicados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                anticiposFiltrados
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((anticipo, index) => {
                                        const excedente = parseFloat(anticipo.valorAnticipo || 0) - parseFloat(anticipo.valorGastado || 0)
                                        const estadoStyle = ESTADO_COLORS[anticipo.estado] || { bg: '#F5F5F5', color: '#757575' }
                                        const totalSoportes = (anticipo.soportes || []).length

                                        return (
                                            <TableRow key={anticipo.idAnticipoExcedente}
                                                sx={{ '&:hover': { backgroundColor: COLORS.hoverBg }, transition: 'background-color 0.15s' }}>

                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.textMuted, py: 1.5 }}>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 28, height: 28, backgroundColor: COLORS.secondary, fontSize: '0.65rem', fontWeight: 700 }}>
                                                            {getNombreConductor(anticipo.idConductor).split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight={600} color={COLORS.text} noWrap sx={{ maxWidth: 130 }}>
                                                            {getNombreConductor(anticipo.idConductor)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" color={COLORS.textMuted} fontSize="0.75rem">Ruta {anticipo.idRuta}</Typography>
                                                    <Typography variant="body2" fontWeight={500} color={COLORS.text} fontSize="0.8rem" noWrap sx={{ maxWidth: 140 }}>
                                                        {rutasMock.find(r => r.idRuta === parseInt(anticipo.idRuta))?.nombre || '—'}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={600} color={COLORS.secondary} fontSize="0.82rem">
                                                        {formatMoney(anticipo.valorAnticipo)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" color={anticipo.valorGastado ? COLORS.text : COLORS.textMuted} fontSize="0.82rem">
                                                        {anticipo.valorGastado ? formatMoney(anticipo.valorGastado) : '—'}
                                                    </Typography>
                                                </TableCell>

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

                                                {/* Columna soportes */}
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Chip
                                                        icon={<ImageIcon sx={{ fontSize: '13px !important' }} />}
                                                        label={totalSoportes === 0 ? 'Sin soportes' : `${totalSoportes} archivo${totalSoportes !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        onClick={() => setAnticipoConsulta(anticipo)}
                                                        sx={{
                                                            fontSize: '0.7rem', fontWeight: 600, height: 22, cursor: 'pointer',
                                                            backgroundColor: totalSoportes > 0 ? '#E8F5E9' : '#F5F5F5',
                                                            color: totalSoportes > 0 ? '#2E7D32' : COLORS.textMuted,
                                                            '&:hover': { opacity: 0.8 },
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ fontSize: '0.8rem', color: COLORS.text, py: 1.5 }}>
                                                    {formatFecha(anticipo.fechaEntrega)}
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                                        <Select
                                                            value={anticipo.estado}
                                                            onChange={(e) => handleEstadoChange(anticipo.idAnticipoExcedente, e.target.value)}
                                                            sx={{ 
                                                                fontSize: '0.7rem',
                                                                '& .MuiSelect-select': { py: 0.5 },
                                                            }}
                                                        >
                                                            <MenuItem value="entregado">Entregado</MenuItem>
                                                            <MenuItem value="en legalización">En Legalización</MenuItem>
                                                            <MenuItem value="legalizado">Legalizado</MenuItem>
                                                            <MenuItem value="excedente pendiente">Excedente Pendiente</MenuItem>
                                                            <MenuItem value="cerrado">Cerrado</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title="Consultar">
                                                            <IconButton size="small" onClick={() => setAnticipoConsulta(anticipo)}
                                                                sx={{ color: COLORS.secondary, '&:hover': { backgroundColor: '#EEF2FF' } }}>
                                                                <VisibilityIcon sx={{ fontSize: 17 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small"
                                                                onClick={() => navigate(`/anticipos/actualizar/${anticipo.idAnticipoExcedente}`)}
                                                                sx={{ color: '#F59E0B', '&:hover': { backgroundColor: '#FFFBEB' } }}>
                                                                <EditIcon sx={{ fontSize: 17 }} />
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
                    component="div" count={anticiposFiltrados.length}
                    page={page} onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                    sx={{ borderTop: `1px solid ${COLORS.border}`, fontSize: '0.8rem' }}
                />
            </Paper>

            <ModalConsultar anticipo={anticipoConsulta} onClose={() => setAnticipoConsulta(null)} />
        </Box>
    )
}

export default ListarAnticipoExcedente