import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as rutaService from '../../shared/services/rutaService'
import * as anticipoService from '../../shared/services/anticipoService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, Avatar, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { isVencido } from '../../shared/utils/formatters.js'

const estadoEfectivoColor = (estadoEfectivo) =>
    estadoEfectivo === 'en_ruta' ? '#3B82F6' : '#10b981'

const ModalConsultarConductor = ({ conductor, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabRutas, setTabRutas] = useState({ data: [], loading: false })
    const [tabAnticipos, setTabAnticipos] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!conductor || tabIndex !== 1) return
        setTabRutas({ data: [], loading: true })
        rutaService.getRutas({ idConductor: conductor.idConductor, limit: 100 })
            .then(res => setTabRutas({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutas({ data: [], loading: false }))
    }, [conductor, tabIndex])

    useEffect(() => {
        if (!conductor || tabIndex !== 2) return
        setTabAnticipos({ data: [], loading: true })
        anticipoService.getAnticipos(undefined, { idConductor: conductor.idConductor, limit: 100 })
            .then(res => setTabAnticipos({ data: res?.data || [], loading: false }))
            .catch(() => setTabAnticipos({ data: [], loading: false }))
    }, [conductor, tabIndex])

    if (!conductor) return null

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
                        backgroundColor: conductor.habilitado ? theme.palette.avatarDefault.bg : theme.palette.avatarDisabled.bg,
                        color: conductor.habilitado ? theme.palette.avatarDefault.color : theme.palette.avatarDisabled.color,
                        width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700
                    }}>
                        {(conductor.nombre?.[0] || '').toUpperCase()}{(conductor.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {conductor.nombre} {conductor.apellido}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Conductor</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
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
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Identificación</Typography><Typography variant="body2" fontWeight={500}>{conductor.tipoIdentificacion} {conductor.numeroIdentificacion}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Nombre</Typography><Typography variant="body2" fontWeight={500}>{conductor.nombre}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Apellido</Typography><Typography variant="body2" fontWeight={500}>{conductor.apellido}</Typography></Box>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{conductor.telefono || '—'}</Typography></Box>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white', flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Licencia</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box><Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>N° Licencia</Typography><Typography variant="body2" fontWeight={500}>{conductor.licenciaConduccion || '—'}</Typography></Box>
                                <Box>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Vencimiento</Typography>
                                    <Typography variant="body2" fontWeight={500} color={isVencido(conductor.fechaVencimientoLicencia) ? '#ef4444' : '#2E7D32'}>
                                        {conductor.fechaVencimientoLicencia ? new Date(conductor.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="caption" color={theme.palette.text.secondary} fontWeight={600}>Estado</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Box sx={{
                                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                            ...(conductor.estadoEfectivo === 'en_ruta'
                                                ? { backgroundColor: '#3B82F6', border: '2px solid #3B82F6' }
                                                : { backgroundColor: 'transparent', border: '2px solid #10b981' })
                                        }} />
                                        <Typography variant="body2" fontWeight={500} color={estadoEfectivoColor(conductor.estadoEfectivo)}>
                                            {conductor.estadoEfectivo === 'en_ruta' ? 'En Ruta' : 'Disponible'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Rutas asignadas a este conductor</Typography>
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

            {tabIndex === 2 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>Anticipos registrados para este conductor</Typography>
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

export default ModalConsultarConductor
