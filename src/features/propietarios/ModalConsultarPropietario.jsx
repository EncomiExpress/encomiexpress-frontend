import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as vehiculoService from '../../shared/services/vehiculoService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'

const ModalConsultarPropietario = ({ propietario, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabVehiculos, setTabVehiculos] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!propietario || tabIndex !== 1) return
        setTabVehiculos({ data: [], loading: true })
        vehiculoService.getVehiculos(undefined, { idPropietario: propietario.idPropietario, limit: 100 })
            .then(res => setTabVehiculos({ data: res?.data || [], loading: false }))
            .catch(() => setTabVehiculos({ data: [], loading: false }))
    }, [propietario, tabIndex])

    if (!propietario) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={handleClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{
                        backgroundColor: propietario.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: propietario.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {(propietario.nombre?.[0] || '').toUpperCase()}{(propietario.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {propietario.nombre} {propietario.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Propietario</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Vehículos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Datos Personales</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo doc.</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.tipoIdentificacion}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>N° identificación</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.numeroIdentificacion}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.nombre}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.apellido || '—'}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Contacto y Flota</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.telefono || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Email</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.email || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tarjeta propiedad</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.tarjetaPropiedad || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo de flota</Typography>
                                    <Typography variant="body2" fontWeight={500}>{propietario.tipoFlota || '—'}</Typography>
                                </Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Typography variant="body2" fontWeight={500} color={propietario.habilitado ? '#2E7D32' : '#ef4444'}>
                                        {propietario.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
                        Vehículos registrados para este propietario
                    </Typography>
                    {tabVehiculos.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabVehiculos.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin vehículos registrados</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Placa</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Marca / Modelo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Habilitado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabVehiculos.data.map(v => (
                                        <TableRow key={v.idVehiculo} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.placa}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.marca} {v.modelo}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.tipo || '—'}</TableCell>
                                            <TableCell>
                                                <Chip label={v.estado || '—'} size="small" sx={{
                                                    backgroundColor: v.estado === 'Disponible' ? '#E3F2FD' : v.estado === 'En Ruta' ? '#DBEAFE' : v.estado === 'Mantenimiento' ? '#FFF7ED' : '#FCE4EC',
                                                    color: v.estado === 'Disponible' ? '#1565C0' : v.estado === 'En Ruta' ? '#3B82F6' : v.estado === 'Mantenimiento' ? '#EA580C' : '#C62828',
                                                    fontWeight: 600, fontSize: '0.72rem'
                                                }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={v.habilitado ? 'Habilitado' : 'Inhabilitado'} size="small" sx={{
                                                    backgroundColor: v.habilitado ? '#E8F5E9' : '#F5F5F5',
                                                    color: v.habilitado ? '#2E7D32' : '#757575',
                                                    fontWeight: 600, fontSize: '0.72rem'
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={handleClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarPropietario
