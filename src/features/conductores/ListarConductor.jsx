import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar, CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'

const getThStyle = (theme) => ({
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
})

// Los estados que acepta el backend
const ESTADOS_CONDUCTOR = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
]

const getFilterMenuProps = (theme) => ({
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
})

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'inhabilitado', label: 'Inhabilitado' },
]

const estadoColor = (estado, theme) => {
    if (!estado) return theme.palette.text.secondary
    switch (estado.toLowerCase()) {
        case 'activo': return '#10b981'
        case 'inactivo': return '#dc2626'
        default: return theme.palette.text.secondary
    }
}

const ListarConductor = () => {
    const theme = useTheme()
    const thStyle = getThStyle(theme)
    const filterMenuProps = getFilterMenuProps(theme)
    const { tienePermiso, PERMISOS, usuario } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [conductorVer, setConductorVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroHabilitado, setFiltroHabilitado] = useState('todo')
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [conductorEditar, setConductorEditar] = useState(null)

    const { conductores, loading, fetchConductores, updateEstado, toggleHabilitado } = useConductor()
    const navigate = useNavigate()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            fetchConductores()
        }
    }, [usuario, navigate, fetchConductores])

    const handleEstadoChange = async (id, nuevoEstado) => {
        const success = await updateEstado(id, nuevoEstado)
        if (success) {
            setSnackbar({ open: true, message: `Estado actualizado a "${nuevoEstado}".`, severity: 'success' })
        } else {
            setSnackbar({ open: true, message: 'Error al actualizar el estado.', severity: 'error' })
        }
    }

    const handleToggleHabilitado = async (id, habilitadoActual) => {
        const success = await toggleHabilitado(id)
        if (success) {
            setSnackbar({
                open: true,
                message: `Conductor ${habilitadoActual ? 'inhabilitado' : 'habilitado'} correctamente.`,
                severity: 'success',
            })
        } else {
            setSnackbar({ open: true, message: 'No se pudo cambiar el estado del conductor.', severity: 'error' })
        }
    }

    const filteredConductores = conductores.filter(c => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            (c.nombre || '').toLowerCase().includes(q) ||
            (c.apellido || '').toLowerCase().includes(q) ||
            (c.numeroIdentificacion || '').toLowerCase().includes(q) ||
            (c.tipoIdentificacion || '').toLowerCase().includes(q) ||
            (c.licenciaConduccion || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)

        const coincideHabilitado =
            filtroHabilitado === 'todo' ||
            (filtroHabilitado === 'habilitado' && c.habilitado) ||
            (filtroHabilitado === 'inhabilitado' && !c.habilitado)

        return coincideBusqueda && coincideHabilitado
    })

    const limpiarFiltros = () => { setSearchTerm(''); setFiltroHabilitado('todo') }
    const limpiarBusqueda = () => setSearchTerm('')
    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroHabilitado !== 'todo'

    return (
        <Box sx={{ p: 3.5 }}>
            {/* ── Encabezado ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Conductores
                        </Typography>
                        <Chip
                            label={`${conductores.length} registrado${conductores.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ backgroundColor: '#F3F4F6', color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.72rem', height: 22, borderRadius: 10 }}
                        />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} mt={0.3}>
                        Gestiona los conductores registrados en el sistema.
                    </Typography>
                </Box>
                {tienePermiso(PERMISOS.REGISTRAR_CONDUCTOR) && (
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
                        Nuevo conductor
                    </Button>
                )}
            </Box>

            {/* ── Filtros habilitado / inhabilitado ── */}
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
                    size="small" placeholder="Buscar conductores..."
                    sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' } } }}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} /></InputAdornment>,
                            endAdornment: searchTerm && <InputAdornment position="end"><IconButton size="small" onClick={limpiarBusqueda}><ClearIcon sx={{ fontSize: 16 }} /></IconButton></InputAdornment>
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
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={thStyle}>Licencia</TableCell>
                                <TableCell sx={thStyle}>Vencimiento</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredConductores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {conductores.length === 0
                                                ? 'No hay conductores registrados en el sistema.'
                                                : 'No se encontraron conductores que coincidan con la búsqueda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredConductores.map((conductor) => (
                                    <TableRow key={conductor.idConductor}
                                        sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle }, transition: 'background-color 0.15s', opacity: conductor.habilitado ? 1 : 0.55 }}>
                                        {/* Nombre */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 34, height: 34, backgroundColor: conductor.habilitado ? '#FFCDD2' : theme.palette.divider, fontSize: '0.73rem', fontWeight: 700, color: conductor.habilitado ? '#C62828' : '#8E8E8E' }}>
                                                    {conductor.nombre?.[0] || ''}{conductor.apellido?.[0] || ''}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.primary} noWrap>
                                                    {conductor.nombre} {conductor.apellido}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {/* Identificación */}
                                        <TableCell sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, py: 1.5 }}>
                                            {conductor.tipoIdentificacion} {conductor.numeroIdentificacion}
                                        </TableCell>
                                        {/* Teléfono */}
                                        <TableCell sx={{ py: 1.5 }}>{conductor.telefono || '-'}</TableCell>
                                        {/* Email */}
                                        <TableCell sx={{ py: 1.5 }}>{conductor.email || '-'}</TableCell>
                                        {/* Licencia */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip label={conductor.licenciaConduccion || '-'} size="small"
                                                sx={{ fontWeight: 600, backgroundColor: '#FEF2F2', color: theme.palette.primary.main, fontSize: '0.7rem' }} />
                                        </TableCell>
                                        {/* Vencimiento */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={conductor.fechaVencimientoLicencia ? new Date(conductor.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                color={isVencido(conductor.fechaVencimientoLicencia) ? 'error' : 'success'}
                                                variant={isVencido(conductor.fechaVencimientoLicencia) ? 'filled' : 'outlined'}
                                                sx={{ fontSize: '0.7rem' }} />
                                        </TableCell>
                                        {/* Estado operativo */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 110 }}>
                                                <Select
                                                    value={conductor.estado || 'activo'}
                                                    onChange={(e) => handleEstadoChange(conductor.idConductor, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{ fontSize: '0.75rem', py: 0.5, color: estadoColor(conductor.estado, theme) }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS_CONDUCTOR.map(e => (
                                                        <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        {/* Acciones */}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_CONDUCTOR) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton size="small" onClick={() => setConductorVer(conductor)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small" onClick={() => { setConductorEditar(conductor); setModalActualizarOpen(true) }}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                                                    <Tooltip title={conductor.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                        <IconButton size="small"
                                                            onClick={() => handleToggleHabilitado(conductor.idConductor, conductor.habilitado)}
                                                            sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}>
                                                            {conductor.habilitado
                                                                ? <CheckBoxIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: theme.palette.status?.disabled2?.color || '#9E9E9E' }} />}
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

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, pt: 1.5 }}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Total de conductores: {filteredConductores.length}
                </Typography>
            </Box>

            {/* ── Modal detalle ── */}
            {conductorVer && (
                <Dialog open onClose={() => setConductorVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Conductor</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>Información del perfil del conductor</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {(conductorVer.nombre?.[0] || '') + (conductorVer.apellido?.[0] || '') || 'C'}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {conductorVer.nombre} {conductorVer.apellido}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    {conductorVer.email || 'Sin email'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Datos Personales</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Identificación y datos personales</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Identificación</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.tipoIdentificacion} {conductorVer.numeroIdentificacion}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.nombre}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.apellido}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.telefono || '-'}</Typography></Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Licencia de Conducción</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Datos de licencia y contacto</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Licencia</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.licenciaConduccion || '-'}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vencimiento</Typography>
                                    <Typography variant="body2" fontWeight={500} color={isVencido(conductorVer.fechaVencimientoLicencia) ? '#ef4444' : '#2E7D32'}>
                                        {conductorVer.fechaVencimientoLicencia ? new Date(conductorVer.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Typography variant="body2" fontWeight={500} color={estadoColor(conductorVer.estado, theme)}>
                                        {conductorVer.estado ? conductorVer.estado.charAt(0).toUpperCase() + conductorVer.estado.slice(1) : '-'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setConductorVer(null)} variant="contained"
                            sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none', boxShadow: '0 4px 14px rgba(204,24,24,0.2)', '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            {/* ── Modales registrar / actualizar ── */}
            <RegistrarConductor
                open={modalRegistrarOpen}
                onClose={() => setModalRegistrarOpen(false)}
                onSuccess={() => {
                    fetchConductores()
                    setSnackbar({ open: true, message: 'Conductor registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarConductor
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setConductorEditar(null) }}
                conductor={conductorEditar}
                onSuccess={() => {
                    fetchConductores()
                    setSnackbar({ open: true, message: 'Conductor actualizado correctamente', severity: 'success' })
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

export default ListarConductor

