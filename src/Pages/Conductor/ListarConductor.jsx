import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { useConductor } from '../../Context/ConductorContext'
import { useAuth } from '../../Context/AuthContext'
import RegistrarConductor from './RegistrarConductor'
import ActualizarConductor from './ActualizarConductor'

const COLORS = {
    primary: '#CC1818',
    primaryLight: '#FFE8E8',
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

const ESTADOS = ['Activo', 'Inactivo', 'En revisión']

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

const getTipoIdentificacionLabel = (tipo) => {
    const tipos = { 'CC': 'Cédula', 'NIT': 'NIT', 'CE': 'Cédula Extranjería', 'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil' }
    return tipos[tipo] || tipo
}

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'En revisión', label: 'En revisión' },
]

const ListarConductor = () => {
    const { tienePermiso, PERMISOS } = useAuth()
    const [conductores, setConductores] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [conductorVer, setConductorVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [conductorEditar, setConductorEditar] = useState(null)

    const { getConductores, updateEstado } = useConductor()
    const { usuario } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setConductores(getConductores())
        }
    }, [usuario, navigate, getConductores])

    const handleEstadoChange = (id, nuevoEstado) => {
        updateEstado(id, nuevoEstado)
        setConductores(getConductores())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
            severity: 'success',
        })
    }

    const filteredConductores = conductores.filter(c => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            c.nombre.toLowerCase().includes(q) ||
            c.apellido.toLowerCase().includes(q) ||
            c.numeroIdentificacion.toLowerCase().includes(q) ||
            c.licenciaConduccion.toLowerCase().includes(q) ||
            (c.email && c.email.toLowerCase().includes(q))

        const coincideEstado =
            filtroEstado === 'todo' ||
            c.estado === filtroEstado

        return coincideBusqueda && coincideEstado
    })

    const limpiarFiltros = () => {
        setSearchTerm('')
        setFiltroEstado('todo')
        setPage(1)
    }

    const hayFiltrosActivos = searchTerm.trim() !== '' || filtroEstado !== 'todo'

    return (
        <Box sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
                            Conductores
                        </Typography>
                        <Chip
                            label={`${conductores.length} registrado${conductores.length !== 1 ? 's' : ''}`}
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
                        Gestiona los conductores registrados en el sistema.
                    </Typography>
                 </Box>
                 {tienePermiso(PERMISOS.REGISTRAR_CONDUCTOR) && (
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
                         Nuevo conductor
                     </Button>
                 )}
             </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
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
                {FILTROS.map(f => (
                    <Button
                        key={f.value}
                        onClick={() => { setFiltroEstado(f.value); setPage(1) }}
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
                            fontWeight: filtroEstado === f.value ? 600 : 400,
                            backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                            color: filtroEstado === f.value ? COLORS.text : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? COLORS.text : '#5C3333',
                                border: 'none',
                            },
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Buscar conductores..."
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
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />

                {hayFiltrosActivos && (
                    <Chip
                        label="Limpiar"
                        size="small"
                        icon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={limpiarFiltros}
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                    />
                )}
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Identificación</TableCell>
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Email</TableCell>
                                <TableCell sx={thStyle}>Licencia</TableCell>
                                <TableCell sx={thStyle}>Vencimiento</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 110 }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredConductores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={COLORS.textMuted} variant="body2">
                                            {conductores.length === 0
                                                ? 'No hay conductores registrados en el sistema.'
                                                : 'No se encontraron conductores que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredConductores.map((conductor) => (
                                    <TableRow
                                        key={conductor.idConductor}
                                        sx={{
                                            '&:hover': { backgroundColor: COLORS.hoverBg },
                                            transition: 'background-color 0.15s',
                                            opacity: conductor.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                            <Box>
                                                <Chip
                                                    label={getTipoIdentificacionLabel(conductor.tipoIdentificacion)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        backgroundColor: '#FEF2F2',
                                                        color: '#CC1818',
                                                        mb: 0.5,
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                                {conductor.numeroIdentificacion}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                            {conductor.nombre} {conductor.apellido}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{conductor.telefono}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{conductor.email || '-'}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={conductor.licenciaConduccion}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    backgroundColor: '#FEF2F2',
                                                    color: '#CC1818',
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={conductor.fechaVencimientoLicencia ? new Date(conductor.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                                size="small"
                                                color={isVencido(conductor.fechaVencimientoLicencia) ? 'error' : 'success'}
                                                variant={isVencido(conductor.fechaVencimientoLicencia) ? 'filled' : 'outlined'}
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <Select
                                                    value={conductor.estado}
                                                    onChange={(e) => handleEstadoChange(conductor.idConductor, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.5,
                                                        color: conductor.estado === 'Activo' ? '#10b981' :
                                                               conductor.estado === 'Inactivo' ? '#dc2626' : '#f59e0b',
                                                    }}
                                                    MenuProps={filterMenuProps}
                                                >
                                                    {ESTADOS.map(estado => (
                                                        <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {tienePermiso(PERMISOS.CONSULTAR_CONDUCTOR) && (
                                                    <Tooltip title="Ver detalle">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setConductorVer(conductor)}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {tienePermiso(PERMISOS.ACTUALIZAR_CONDUCTOR) && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setConductorEditar(conductor); setModalActualizarOpen(true) }}
                                                            sx={{ color: COLORS.text, '&:hover': { backgroundColor: COLORS.primaryLight } }}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
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

            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.5, pt: 1.5,
            }}>
                <Typography variant="body2" color={COLORS.textMuted}>
                    Total de conductores: {filteredConductores.length}
                </Typography>
            </Box>

            {conductorVer && (
                <Dialog open onClose={() => setConductorVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Detalles del Conductor</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>
                            Información del perfil del conductor
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {conductorVer.nombre?.[0]}{conductorVer.apellido?.[0]}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={COLORS.text}>
                                    {conductorVer.nombre} {conductorVer.apellido}
                                </Typography>
                                <Typography variant="body2" color={COLORS.textMuted} mt={0.4}>
                                    {conductorVer.email || 'Sin email'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Detalles del Conductor</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                                Identificación y datos personales
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Tipo ID</Typography><Typography variant="body2" fontWeight={500}>{getTipoIdentificacionLabel(conductorVer.tipoIdentificacion)}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Número ID</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.numeroIdentificacion}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Nombre</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.nombre}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Apellido</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.apellido}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: COLORS.text }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={COLORS.text}>Licencia de Conducción</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2 }}>
                                Datos de licencia y contacto
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.telefono}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Email</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.email || '—'}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Licencia</Typography><Typography variant="body2" fontWeight={500}>{conductorVer.licenciaConduccion}</Typography></Box>
                                <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Vencimiento</Typography><Typography variant="body2" fontWeight={500} color={isVencido(conductorVer.fechaVencimientoLicencia) ? '#ef4444' : '#2E7D32'}>{conductorVer.fechaVencimientoLicencia ? new Date(conductorVer.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={conductorVer.estado === 'Activo' ? '#2E7D32' : '#ef4444'}>{conductorVer.estado}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setConductorVer(null)} variant="contained" sx={{
                            backgroundColor: COLORS.primary, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            <RegistrarConductor 
                open={modalRegistrarOpen} 
                onClose={() => setModalRegistrarOpen(false)} 
                onSuccess={() => {
                    setConductores(getConductores())
                    setSnackbar({ open: true, message: 'Conductor registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarConductor
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setConductorEditar(null) }}
                conductor={conductorEditar}
                onSuccess={() => {
                    setConductores(getConductores())
                    setSnackbar({ open: true, message: 'Conductor actualizado correctamente', severity: 'success' })
                }}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
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
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ListarConductor