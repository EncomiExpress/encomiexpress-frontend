import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as ventaService from '../../ventas/services/ventaService.js'
import * as anticipoService from '../../anticipos/services/anticipoService.js'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'
import { useDestino } from '../../destinos/context/DestinoContext.jsx'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import RouteIcon from '@mui/icons-material/Route'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { getAnticipoEstadoDot, getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'
import { formatFecha, formatHora12, getGuiaPrincipal } from '../../../shared/utils/formatters.js'
import CampoFila from '../../../shared/components/CampoFila.jsx'
import FichaCard from '../../../shared/components/FichaCard.jsx'
import EstadoDot, { RutaEstadoDot } from './EstadoDot.jsx'
import { resolvePares, resolveDestino } from '../utils/rutaResolvers.js'
import { errorChipSx } from '../style/chips.js'

const ModalConsultarRutaProgramacion = ({ ruta, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabEncomiendas, setTabEncomiendas] = useState({ data: [], total: 0, loading: false })
    const [tabAnticipos, setTabAnticipos] = useState({ data: [], total: 0, loading: false })

    const { getVehiculos } = useVehiculo()
    const { getConductores } = useConductor()
    const { destinos } = useDestino()

    useEffect(() => {
        if (!ruta || tabIndex !== 1) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabEncomiendas({ data: [], total: 0, loading: true })
        ventaService.getEncomiendas(undefined, { idRuta: ruta.idRuta, limit: 100 })
            .then(res => setTabEncomiendas({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabEncomiendas({ data: [], total: 0, loading: false }))
    }, [ruta, tabIndex])

    useEffect(() => {
        if (!ruta || tabIndex !== 2) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabAnticipos({ data: [], total: 0, loading: true })
        anticipoService.getAnticipos(undefined, { idRuta: ruta.idRuta, limit: 100 })
            .then(res => setTabAnticipos({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabAnticipos({ data: [], total: 0, loading: false }))
    }, [ruta, tabIndex])

    if (!ruta) return null

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
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <RouteIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {ruta.origen || 'Ruta Programada'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>{resolveDestino(ruta, destinos)}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Encomiendas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FichaCard icon={RouteOutlinedIcon} title="Datos de la Ruta y Horario" subtitle="Origen, destino, fecha, horas y estado de la ruta">
                            <CampoFila label="Origen" value={ruta.origen} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Destino</Typography>
                                <Chip label={resolveDestino(ruta, destinos) || '—'} size="small"
                                    onClick={() => window.open(`/transporte/destinos?highlight=${ruta.idDestino}`, '_blank')}
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                            </Box>
                            <CampoFila label="Fecha salida" value={formatFecha(ruta.fechaSalida)} />
                            <CampoFila label="Hora salida" value={formatHora12(ruta.horaSalida) || '—'} />
                            <CampoFila label="Fecha llegada est." value={formatFecha(ruta.fechaLlegadaEstimada)} />
                            <CampoFila label="Hora llegada est." value={formatHora12(ruta.horaLlegadaEstimada) || '—'} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <RutaEstadoDot estado={ruta.estado} />
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                        {ruta.estado || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            <CampoFila label="Observaciones" value={ruta.observaciones} />
                        </FichaCard>

                        <FichaCard icon={DirectionsCarOutlinedIcon}
                            title={resolvePares(ruta, { getVehiculos, getConductores }).length > 1 ? 'Vehículos y Conductores' : 'Vehículo y Conductor'}
                            subtitle="Recursos asignados a esta ruta">
                            {resolvePares(ruta, { getVehiculos, getConductores }).map((par, i, arr) => (
                                <Box key={par.idRutaVehiculoConductor ?? i}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                                            {arr.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {par.documentoVencido && (
                                                <Chip label={`${par.documentoVencido} vencido`} size="small"
                                                    sx={errorChipSx(theme)} />
                                            )}
                                            <Chip label={par.placa || '—'} size="small"
                                                onClick={() => window.open(`/vehiculos/listar?highlight=${par.idVehiculo}`, '_blank')}
                                                sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                                            {arr.length > 1 ? `Conductor ${i + 1}` : 'Conductor'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {par.licenciaVencida && (
                                                <Chip label="Licencia vencida" size="small"
                                                    sx={errorChipSx(theme)} />
                                            )}
                                            <Typography variant="body2" fontWeight={500}
                                                onClick={() => window.open(`/transporte/conductores?highlight=${par.idConductor}`, '_blank')}
                                                sx={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', '&:hover': { opacity: 0.75 } }}>
                                                {par.conductorNombre}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {i < arr.length - 1 && <Divider sx={{ my: 1 }} />}
                                </Box>
                            ))}
                            {resolvePares(ruta, { getVehiculos, getConductores }).length === 0 && (
                                <Typography variant="body2" color={theme.palette.text.secondary}>Sin vehículos asignados</Typography>
                            )}
                        </FichaCard>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: tabEncomiendas.total > 100 ? 0.5 : 2 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                            Encomiendas registradas en esta ruta
                        </Typography>
                        {!tabEncomiendas.loading && tabEncomiendas.data.length > 0 && (
                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                <AdsClickOutlinedIcon sx={{ fontSize: 14 }} />
                                Puedes hacer clic en cada fila para abrirla en otra pestaña
                            </Typography>
                        )}
                    </Box>
                    {tabEncomiendas.total > 100 && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 2 }}>
                            Mostrando los 100 más recientes de {tabEncomiendas.total}.
                        </Typography>
                    )}
                    {tabEncomiendas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabEncomiendas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin encomiendas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
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
                                        <TableRow key={v.idEncomiendaVenta}
                                            onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{getGuiaPrincipal(v) || `#${v.idEncomiendaVenta}`}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(v.valorServicio || 0).toLocaleString('es-CO')}</TableCell>
                                            <TableCell>
                                                <EstadoDot {...getVentaEstadoDot(v.estado)} />
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
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: tabAnticipos.total > 100 ? 0.5 : 2 }}>
                        Anticipos asociados a esta ruta
                    </Typography>
                    {tabAnticipos.total > 100 && (
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'block', mb: 2 }}>
                            Mostrando los 100 más recientes de {tabAnticipos.total}.
                        </Typography>
                    )}
                    {tabAnticipos.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabAnticipos.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin anticipos registrados</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gastado</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabAnticipos.data.map(a => (
                                        <TableRow key={a.idAnticipoExcedente}
                                            onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
                                            <TableCell>
                                                <EstadoDot {...getAnticipoEstadoDot(a.estado)} />
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
