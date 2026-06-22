import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as ventaService from '../../shared/services/ventaService'
import * as anticipoService from '../../shared/services/anticipoService'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

const ModalConsultarRutaProgramacion = ({ ruta, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabEncomiendas, setTabEncomiendas] = useState({ data: [], loading: false })
    const [tabAnticipos, setTabAnticipos] = useState({ data: [], loading: false })

    const { getVehiculos } = useVehiculo()
    const { getConductores } = useConductor()
    const { destinos } = useDestino()

    useEffect(() => {
        if (!ruta || tabIndex !== 1) return
        setTabEncomiendas({ data: [], loading: true })
        ventaService.getEncomiendas(undefined, { idRuta: ruta.idRuta, limit: 100 })
            .then(res => setTabEncomiendas({ data: res?.data || [], loading: false }))
            .catch(() => setTabEncomiendas({ data: [], loading: false }))
    }, [ruta, tabIndex])

    useEffect(() => {
        if (!ruta || tabIndex !== 2) return
        setTabAnticipos({ data: [], loading: true })
        anticipoService.getAnticipos(undefined, { idRuta: ruta.idRuta, limit: 100 })
            .then(res => setTabAnticipos({ data: res?.data || [], loading: false }))
            .catch(() => setTabAnticipos({ data: [], loading: false }))
    }, [ruta, tabIndex])

    if (!ruta) return null

    const resolveVehiculo = (r) => r.vehiculo?.placa ?? (getVehiculos().find(v => v.idVehiculo === r.idVehiculo)?.placa || 'N/A')
    const resolveConductor = (r) => {
        if (r.conductor?.usuario) return `${r.conductor.usuario.nombre} ${r.conductor.usuario.apellido}`
        const c = getConductores().find(c => c.idConductor === r.idConductor)
        return c ? `${c.nombre} ${c.apellido}` : 'N/A'
    }
    const resolveDestino = (r) => {
        if (r.destino) return `${r.destino.departamento} - ${r.destino.ciudad}`
        const d = destinos.find(d => d.idDestino === r.idDestino)
        return d ? (d.nombre || `${d.departamento} - ${d.ciudad}`) : 'N/A'
    }

    const handleClose = () => { setTabIndex(0); onClose() }

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, backgroundColor: theme.palette.background.subtle } } }}>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ backgroundColor: '#FFCDD2', color: '#C62828', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>
                        {ruta.nombreRuta?.[0] || 'R'}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {ruta.nombreRuta || 'Ruta Programada'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>{ruta.fechaSalida}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Encomiendas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Vehículo y Conductor</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vehículo</Typography><Typography variant="body2" fontWeight={500}>{resolveVehiculo(ruta)}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Conductor</Typography><Typography variant="body2" fontWeight={500}>{resolveConductor(ruta)}</Typography></Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Ruta y Horarios</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Destino</Typography><Typography variant="body2" fontWeight={500}>{resolveDestino(ruta)}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Fecha Salida</Typography><Typography variant="body2" fontWeight={500}>{ruta.fechaSalida}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Hora Salida</Typography><Typography variant="body2" fontWeight={500}>{ruta.horaSalida || '—'}</Typography></Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Typography variant="body2" fontWeight={500}
                                        color={ruta.estado === 'Programada' ? '#3730A3' : ruta.estado === 'En Curso' ? '#1E40AF' : ruta.estado === 'Completada' ? '#065F46' : '#991B1B'}>
                                        {ruta.estado}
                                    </Typography>
                                </Box>
                                {ruta.observaciones && (
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Observaciones</Typography>
                                        <Typography variant="body2" fontWeight={500}>{ruta.observaciones}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Encomiendas registradas en esta ruta</Typography>
                    {tabEncomiendas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabEncomiendas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin encomiendas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Guía</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabEncomiendas.data.map(v => (
                                        <TableRow key={v.idEncomiendaVenta} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.numeroGuia || `#${v.idEncomiendaVenta}`}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(v.valorServicio || 0).toLocaleString('es-CO')}</TableCell>
                                            <TableCell>
                                                <Chip label={v.estado} size="small" sx={{
                                                    backgroundColor: v.estado === 'pendiente' ? '#FFF3E0' : v.estado === 'entregado' ? '#E8F5E9' : '#E3F2FD',
                                                    color: v.estado === 'pendiente' ? '#E65100' : v.estado === 'entregado' ? '#2E7D32' : '#1565C0',
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

            {tabIndex === 2 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Anticipos asociados a esta ruta</Typography>
                    {tabAnticipos.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabAnticipos.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin anticipos registrados</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gastado</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabAnticipos.data.map(a => (
                                        <TableRow key={a.idAnticipoExcedente} sx={{ '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.idAnticipoExcedente}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
                                            <TableCell>
                                                <Chip label={a.estado} size="small" sx={{
                                                    backgroundColor: a.estado === 'pendiente' ? '#FFF3E0' : a.estado === 'liquidado' ? '#E8F5E9' : '#E3F2FD',
                                                    color: a.estado === 'pendiente' ? '#E65100' : a.estado === 'liquidado' ? '#2E7D32' : '#1565C0',
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

export default ModalConsultarRutaProgramacion
