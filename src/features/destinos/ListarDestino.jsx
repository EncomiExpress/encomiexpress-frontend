import theme from '../../shared/styles/theme.js'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Snackbar, Alert,
    Tooltip, Button, Dialog, Avatar, CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarDestino from './RegistrarDestino'
import ActualizarDestino from './ActualizarDestino'

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const ListarDestino = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [destinoVer, setDestinoVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [destinoEditar, setDestinoEditar] = useState(null)
    const [togglingId, setTogglingId] = useState(null)

    const { destinos, loading, error, fetchDestinos, toggleHabilitado } = useDestino()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            fetchDestinos()
        }
    }, [usuario, navigate, fetchDestinos])

    const handleToggleHabilitado = async (id, habilitadoActual) => {
        setTogglingId(id)
        try {
            const updated = await toggleHabilitado(id)
            setSnackbar({
                open: true,
                message: `Destino ${updated.habilitado ? 'habilitado' : 'inhabilitado'} correctamente.`,
                severity: 'success',
            })
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'No se pudo cambiar el estado del destino.',
                severity: 'error',
            })
        } finally {
            setTogglingId(null)
        }
    }

    const filteredDestinos = destinos.filter(d => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            (d.ciudad || '').toLowerCase().includes(q) ||
            (d.departamento || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && d.habilitado) ||
            (filtroHabilitado === 'inhabilitado' && !d.habilitado)

        return coincideBusqueda && coincideHabilitado
    })

    const limpiarFiltros = () => { setSearchTerm(''); setFiltroHabilitado('todo') }
    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo'

    return (
        <Box sx={{ p: 3.5 }}>

            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Destinos
                        </Typography>
                        <Chip
                            label={`${destinos.length} registrado${destinos.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ backgroundColor: '#F3F4F6', color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.72rem', height: 22, borderRadius: 10 }}
                        />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los destinos de entrega registrados en el sistema.
                    </Typography>
                </Box>
                {tienePermiso(PERMISOS.REGISTRAR_DESTINO) && (
                    <Button
                        onClick={() => setModalRegistrarOpen(true)}
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2,
                            textTransform: 'none', fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}
                    >
                        Nuevo destino
                    </Button>
                )}
            </Box>

            {/* ── Pill filter ── */}
            <Box sx={{ display: 'inline-flex', backgroundColor: '#FFECEC', borderRadius: 4, p: '4px', mb: 2.5, gap: '5px' }}>
                {FILTROS.map(f => (
                    <Button key={f.value} onClick={() => setFiltroHabilitado(f.value)}
                        size="small" disableElevation disableRipple
                        sx={{
                            borderRadius: 3, textTransform: 'none', fontSize: '0.75rem', px: 2, py: 0.5, minWidth: 0,
                            fontWeight: filtroHabilitado === f.value ? 600 : 400,
                            backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent',
                            color: filtroHabilitado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroHabilitado === f.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                            border: 'none',
                            '&:hover': { backgroundColor: filtroHabilitado === f.value ? 'white' : 'transparent', color: filtroHabilitado === f.value ? theme.palette.text.primary : '#5C3333', border: 'none' },
                        }}>
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* ── Buscador ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <TextField
                    size="small" placeholder="Buscar por ciudad o departamento..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                        },
                    }}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} /></InputAdornment>,
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                {hayFiltrosActivos && (
                    <Chip label="Limpiar" size="small" icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: theme.palette.primary.light, color: theme.palette.primary.main }} />
                )}
            </Box>

            {/* ── Tabla ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Ciudad</TableCell>
                                <TableCell sx={thStyle}>Departamento</TableCell>
                                <TableCell sx={thStyle}>Tarifa Base</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography variant="body2" color="error">{error}</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDestinos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {destinos.length === 0
                                                ? 'No hay destinos registrados en el sistema.'
                                                : 'No se encontraron destinos que coincidan con la búsqueda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDestinos.map(destino => (
                                    <TableRow key={destino.idDestino}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: destino.habilitado ? 1 : 0.55,
                                        }}>

                                        {/* Ciudad */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 34, height: 34,
                                                    backgroundColor: destino.habilitado ? '#FFCDD2' : theme.palette.divider,
                                                    fontSize: '0.73rem', fontWeight: 700,
                                                    color: destino.habilitado ? '#C62828' : '#8E8E8E',
                                                }}>
                                                    {(destino.ciudad?.[0] || '').toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {destino.ciudad}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Departamento */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {destino.departamento}
                                        </TableCell>

                                        {/* Tarifa base */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={destino.tarifaBase !== undefined
                                                    ? `$${Number(destino.tarifaBase).toLocaleString('es-CO')}`
                                                    : '—'}
                                                size="small"
                                                sx={{ fontWeight: 600, backgroundColor: '#FEF2F2', color: theme.palette.primary.main, fontSize: '0.7rem' }}
                                            />
                                        </TableCell>

                                        {/* Estado habilitado */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={destino.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.72rem', fontWeight: 600, height: 22, borderRadius: 10,
                                                    backgroundColor: destino.habilitado ? '#E8F5E9' : '#FEF2F2',
                                                    color: destino.habilitado ? '#2E7D32' : '#ef4444',
                                                }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_DESTINO) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setDestinoVer(destino)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small"
                                                            onClick={() => { setDestinoEditar(destino); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                                                    <Tooltip title={destino.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small"
                                                            disabled={togglingId === destino.idDestino}
                                                            onClick={() => handleToggleHabilitado(destino.idDestino, destino.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            {togglingId === destino.idDestino
                                                                ? <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />
                                                                : destino.habilitado
                                                                    ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || '#9E9E9E' }} />
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5, pt: 1.5 }}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Total: {filteredDestinos.length} destino{filteredDestinos.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {/* ── Modal detalle ── */}
            {destinoVer && (
                <Dialog open onClose={() => setDestinoVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Destino</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>Información del destino seleccionado</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {(destinoVer.ciudad?.[0] || '').toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {destinoVer.ciudad}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    {destinoVer.departamento}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BusinessOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Ubicación</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Datos de ubicación del destino</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Ciudad</Typography>
                                    <Typography variant="body2" fontWeight={500}>{destinoVer.ciudad}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Departamento</Typography>
                                    <Typography variant="body2" fontWeight={500}>{destinoVer.departamento}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoneyOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Tarifa y Estado</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información de tarifa y habilitación</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tarifa Base</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {destinoVer.tarifaBase !== undefined
                                            ? `$${Number(destinoVer.tarifaBase).toLocaleString('es-CO')}`
                                            : '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Typography variant="body2" fontWeight={500} color={destinoVer.habilitado ? '#2E7D32' : '#ef4444'}>
                                        {destinoVer.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setDestinoVer(null)} variant="contained"
                            sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none', boxShadow: '0 4px 14px rgba(204,24,24,0.2)', '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            {/* ── Modales registrar / actualizar ── */}
            <RegistrarDestino
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchDestinos()
                    setSnackbar({ open: true, message: 'Destino registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarDestino
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setDestinoEditar(null) }}
                destino={destinoEditar}
                onSuccess={() => {
                    fetchDestinos()
                    setSnackbar({ open: true, message: 'Destino actualizado correctamente', severity: 'success' })
                }}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled"
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarDestino