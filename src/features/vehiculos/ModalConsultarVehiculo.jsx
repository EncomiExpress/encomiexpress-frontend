import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as rutaService from '../../shared/services/rutaService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'

const vehicleStatusLabel = (estado) => {
    switch (estado) {
        case 'Activo': return 'Activo'
        case 'Inactivo': return 'Inactivo'
        case 'Mantenimiento': return 'Mantenimiento'
        case 'En Reparación': return 'En Reparación'
        case 'ocupado': return 'Ocupado'
        default: return estado
    }
}

const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
}

const ModalConsultarVehiculo = ({ vehiculo, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabRutas, setTabRutas] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!vehiculo || tabIndex !== 1) return
        setTabRutas({ data: [], loading: true })
        rutaService.getRutas({ idVehiculo: vehiculo.idVehiculo, limit: 100 })
            .then(res => setTabRutas({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutas({ data: [], loading: false }))
    }, [vehiculo, tabIndex])

    if (!vehiculo) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, backgroundColor: theme.palette.background.subtle } } }}>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>
                        {vehiculo.marca?.[0]}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {vehiculo.marca} {vehiculo.modelo}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Placa: {vehiculo.placa}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SpeedOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Características</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Marca</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.marca}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Modelo</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.modelo}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Tipo</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.tipo}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Color</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.color}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Capacidad</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.capacidad} kg</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Placa</Typography><Typography variant="body2" fontWeight={500}>{vehiculo.placa}</Typography></Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <EventOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Estado y Documentos</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Typography variant="body2" fontWeight={500}
                                        color={vehiculo.estadoEfectivo === 'disponible' ? '#2E7D32' : vehiculo.estadoEfectivo === 'ocupado' ? '#E65100' : '#9ca3af'}>
                                        {vehicleStatusLabel(vehiculo.estadoEfectivo)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Venc. SOAT</Typography>
                                    <Typography variant="body2" fontWeight={500}
                                        color={isVencido(vehiculo.vencimientoSOAT) ? '#ef4444' : '#2E7D32'}>
                                        {vehiculo.vencimientoSOAT ? new Date(vehiculo.vencimientoSOAT).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Rutas asignadas a este vehículo</Typography>
                    {tabRutas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabRutas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin rutas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Destino</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Fecha salida</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabRutas.data.map(r => (
                                        <TableRow key={r.idRuta} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.idRuta}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.nombreRuta || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.destino?.ciudad || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.fechaSalida ? new Date(r.fechaSalida).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell>
                                                <Chip label={r.estado} size="small" sx={{
                                                    backgroundColor: r.estado === 'Programada' ? '#E3F2FD' : r.estado === 'En Curso' ? '#FFF3E0' : r.estado === 'Completada' ? '#E8F5E9' : '#FCE4EC',
                                                    color: r.estado === 'Programada' ? '#1565C0' : r.estado === 'En Curso' ? '#E65100' : r.estado === 'Completada' ? '#2E7D32' : '#C62828',
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
                <Button onClick={handleClose} variant="contained" sx={{
                    backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarVehiculo
