import theme from '../../../shared/styles/theme.js'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TextField, InputAdornment, Select, MenuItem, FormControl, Switch,
    Snackbar, Alert, Tooltip, Button, Dialog, Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import { useDestino } from '../../../shared/contexts/DestinoContext'
import { useAuth } from '../../../shared/contexts/AuthContext'
import RegistrarDestino from './RegistrarDestino'
import ActualizarDestino from './ActualizarDestino'

const COLORS = theme.palette

const thStyle = {
    fontWeight: 700,
    fontSize: '0.80rem',
    color: theme.palette.text.primary,
    letterSpacing: 0.5,
    py: 1.5,
    borderBottom: `1px solid #E0E0E0`,
    whiteSpace: 'nowrap',
}

const ESTADOS = ['Activo', 'Inactivo']

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

const FILTROS = [
    { value: 'todo', label: 'Todo' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
]

const ListarDestino = () => {
    const [destinos, setDestinos] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [destinoVer, setDestinoVer] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [filtroEstado, setFiltroEstado] = useState('todo')
    const [page, setPage] = useState(1)
    const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false)
    const [modalActualizarOpen, setModalActualizarOpen] = useState(false)
    const [destinoEditar, setDestinoEditar] = useState(null)

    const { getDestinos, updateEstado } = useDestino()
    const { usuario, tienePermiso, PERMISOS } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!usuario) {
            navigate('/login')
        } else {
            setDestinos(getDestinos())
        }
    }, [usuario, navigate, getDestinos])

    const handleEstadoChange = (id, nuevoEstado) => {
        updateEstado(id, nuevoEstado)
        setDestinos(getDestinos())
        setSnackbar({
            open: true,
            message: `Estado actualizado a ${nuevoEstado}.`,
            severity: 'success',
        })
    }

    const filteredDestinos = destinos.filter(d => {
        const q = searchTerm.toLowerCase()
        const coincideBusqueda = !q ||
            d.nombre.toLowerCase().includes(q) ||
            d.ciudad.toLowerCase().includes(q) ||
            d.departamento.toLowerCase().includes(q) ||
            d.direccion.toLowerCase().includes(q)

        const coincideEstado =
            filtroEstado === 'todo' ||
            d.estado === filtroEstado

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
                        <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary}>
                            Destinos
                        </Typography>
                        <Chip
                            label={`${destinos.length} registrado${destinos.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#F3F4F6',
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                                fontSize: '0.72rem',
                                height: 22,
                                borderRadius: 10,
                            }}
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
                             backgroundColor: theme.palette.primary.main,
                             borderRadius: 2,
                             textTransform: 'none',
                             fontWeight: 600,
                             boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                             '&:hover': {
                                 backgroundColor: theme.palette.primary.dark,
                                 boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
                             },
                         }}
                     >
                         Nuevo destino
                     </Button>
                 )}
             </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            </Box>

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
                            color: filtroEstado === f.value ? theme.palette.text.primary : '#B05050',
                            boxShadow: filtroEstado === f.value
                                ? '0 1px 4px rgba(0,0,0,0.12)'
                                : 'none',
                            border: 'none',
                            '&:hover': {
                                backgroundColor: filtroEstado === f.value ? 'white' : 'transparent',
                                color: filtroEstado === f.value ? theme.palette.text.primary : '#5C3333',
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
                    placeholder="Buscar destinos..."
                    sx={{
                        width: 320,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main, borderWidth: '1px',
                            },
                        },
                    }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
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
                        sx={{ fontSize: '0.72rem', height: 28, cursor: 'pointer', backgroundColor: theme.palette.primary.light, color: theme.palette.primary.main }}
                    />
                )}
            </Box>

            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                                <TableCell sx={thStyle}>Nombre</TableCell>
                                <TableCell sx={thStyle}>Dirección</TableCell>
                                <TableCell sx={thStyle}>Ciudad</TableCell>
                                <TableCell sx={thStyle}>Departamento</TableCell>
                                <TableCell sx={thStyle}>Teléfono</TableCell>
                                <TableCell sx={thStyle}>Contacto</TableCell>
                                <TableCell sx={thStyle}>Estado</TableCell>
                                <TableCell sx={{ ...thStyle, width: 130 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDestinos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                                        <Typography color={theme.palette.text.secondary} variant="body2">
                                            {destinos.length === 0
                                                ? 'No hay destinos registrados en el sistema.'
                                                : 'No se encontraron destinos que coincidan con la búsqueda.'
                                            }
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDestinos.map((destino) => (
                                    <TableRow
                                        key={destino.idDestino}
                                        sx={{
                                            '&:hover': { backgroundColor: theme.palette.background.subtle },
                                            transition: 'background-color 0.15s',
                                            opacity: destino.habilitado ? 1 : 0.55,
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                                            {destino.nombre}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{destino.direccion}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{destino.ciudad}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{destino.departamento}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{destino.telefono}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{destino.contacto}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <Select
                                                    value={destino.estado}
                                                    onChange={(e) => handleEstadoChange(destino.idDestino, e.target.value)}
                                                    IconComponent={KeyboardArrowDownOutlinedIcon}
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        py: 0.5,
                                                        color: destino.estado === 'Activo' ? '#10b981' :
                                                               destino.estado === 'Inactivo' ? '#dc2626' : '#f59e0b',
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
                                                 {tienePermiso(PERMISOS.CONSULTAR_DESTINO) && (
                                                     <Tooltip title="Ver detalle">
                                                         <IconButton
                                                             size="small"
                                                             onClick={() => setDestinoVer(destino)}
                                                             sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                         >
                                                             <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                                         </IconButton>
                                                     </Tooltip>
                                                 )}
                                                 {tienePermiso(PERMISOS.ACTUALIZAR_DESTINO) && (
                                                     <Tooltip title="Editar">
                                                         <IconButton
                                                             size="small"
                                                             onClick={() => { setDestinoEditar(destino); setModalActualizarOpen(true) }}
                                                             sx={{ color: theme.palette.text.primary, '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                         >
                                                             <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                         </IconButton>
                                                     </Tooltip>
                                                 )}
                                                 {tienePermiso(PERMISOS.INHABILITAR_DESTINO) && (
                                                     <Tooltip title={destino.habilitado ? 'Inhabilitar' : 'Habilitar'}>
                                                         <IconButton
                                                             size="small"
                                                             onClick={() => handleEstadoChange(destino.idDestino, !destino.habilitado ? 'Activo' : 'Inactivo')}
                                                             sx={{ color: destino.habilitado ? '#ef4444' : '#10b981', '&:hover': { backgroundColor: theme.palette.primary.light } }}
                                                         >
                                                             <BlockOutlinedIcon sx={{ fontSize: 18, color: destino.habilitado ? '#ef4444' : '#10b981' }} />
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
                <Typography variant="body2" color={theme.palette.text.secondary}>
                    Total de destinos: {filteredDestinos.length}
                </Typography>
            </Box>

            {destinoVer && (
                <Dialog open onClose={() => setDestinoVer(null)} maxWidth="md" fullWidth
                    slotProps={{ paper: { sx: { borderRadius: 3, p: 3, backgroundColor: '#FAFAFA' } } }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                            <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Detalles del Destino</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2.5 }}>
                            Información del destino
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 70, height: 70, fontSize: '1.5rem', fontWeight: 700 }}>
                                {destinoVer.nombre?.[0]}
                            </Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="1.1rem" color={theme.palette.text.primary}>
                                    {destinoVer.nombre}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.text.secondary} mt={0.4}>
                                    {destinoVer.direccion}
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
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos de ubicación del destino
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Dirección</Typography><Typography variant="body2" fontWeight={500}>{destinoVer.direccion}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Ciudad</Typography><Typography variant="body2" fontWeight={500}>{destinoVer.ciudad}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Departamento</Typography><Typography variant="body2" fontWeight={500}>{destinoVer.departamento}</Typography></Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneOutlinedIcon sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary}>Información de Contacto</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Datos de contacto del destino
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{destinoVer.telefono}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Contacto</Typography><Typography variant="body2" fontWeight={500}>{destinoVer.contacto}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={destinoVer.estado === 'Activo' ? '#2E7D32' : '#ef4444'}>{destinoVer.estado}</Typography></Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setDestinoVer(null)} variant="contained" sx={{
                            backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
                        }}>
                            Cerrar
                        </Button>
                    </Box>
                </Dialog>
            )}

            <RegistrarDestino 
                open={modalRegistrarOpen} 
                onClose={() => setModalRegistrarOpen(false)} 
                onSuccess={() => {
                    setDestinos(getDestinos())
                    setSnackbar({ open: true, message: 'Destino registrado correctamente', severity: 'success' })
                }}
            />

            <ActualizarDestino
                open={modalActualizarOpen}
                onClose={() => { setModalActualizarOpen(false); setDestinoEditar(null) }}
                destino={destinoEditar}
                onSuccess={() => {
                    setDestinos(getDestinos())
                    setSnackbar({ open: true, message: 'Destino actualizado correctamente', severity: 'success' })
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

export default ListarDestino