import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as ventaService from '../../ventas/services/ventaService.js'
import * as anticipoService from '../../anticipos/services/anticipoService.js'
import { useVehiculo } from '../../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../../conductores/context/ConductorContext.jsx'
import { useDestino } from '../../destinos/context/DestinoContext.jsx'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { buildSalidaHighlightUrl } from '../../../shared/utils/salidaLinks.js'
import { getRutaLabel } from '../../rutas/utils/rutaResolvers.js'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Tooltip
} from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import RouteIcon from '@mui/icons-material/Route'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { getAnticipoEstadoDot, getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'
import { formatFecha, formatHora12, getGuiaPrincipal } from '../../../shared/utils/formatters.js'
import CampoFila from '../../../shared/components/CampoFila.jsx'
import FichaCard from '../../../shared/components/FichaCard.jsx'
import EstadoDot, { RutaEstadoDot as SalidaEstadoDot } from '../../rutas/components/EstadoDot.jsx'
import { resolvePares, resolveDestino, resolveDestinoPartes } from '../utils/salidaResolvers.js'
import { errorChipSx } from '../style/chips.js'

// Adaptado de rutas/components/ModalConsultarRutaProgramacion.jsx.
const ModalConsultarSalidaProgramada = ({ salida, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState('info')
    const [tabEncomiendas, setTabEncomiendas] = useState({ data: [], total: 0, loading: false })
    const [tabAnticipos, setTabAnticipos] = useState({ data: [], total: 0, loading: false })

    const { getVehiculos } = useVehiculo()
    const { getConductores } = useConductor()
    const { destinos } = useDestino()
    const { usuario } = useAuth()

    // Mismo criterio de exclusividad que useSalidaColumns.jsx/salidaProgramadaService.js
    // ("Sedes remotas"): el regreso de una sede con operador propio es gestión
    // operativa DE ESA SEDE, ni Medellín lo ve acá -- y los anticipos son gestión de
    // Medellín exclusivamente, operador_sede nunca los toca.
    const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
    const ocultarEncomiendas = !esOperadorSede && salida?.esRegresoDeSedePropia
    const ocultarAnticipos = esOperadorSede
    const idSalidaAnticipo = salida?.idSalidaIda || salida?.idSalida

    useEffect(() => {
        if (!salida || tabIndex !== 'encomiendas') return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabEncomiendas({ data: [], total: 0, loading: true })
        ventaService.getEncomiendas(undefined, { idSalida: salida.idSalida, limit: 100 })
            .then(res => setTabEncomiendas({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabEncomiendas({ data: [], total: 0, loading: false }))
    }, [salida, tabIndex])

    useEffect(() => {
        if (!salida || tabIndex !== 'anticipos') return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabAnticipos({ data: [], total: 0, loading: true })
        anticipoService.getAnticipos(undefined, { idSalida: idSalidaAnticipo, limit: 100 })
            .then(res => setTabAnticipos({ data: res?.data || [], total: res?.total ?? 0, loading: false }))
            .catch(() => setTabAnticipos({ data: [], total: 0, loading: false }))
    }, [salida, tabIndex, idSalidaAnticipo])

    if (!salida) return null

    const handleClose = () => { setTabIndex('info'); onClose() }

    // Se resuelve una sola vez acá (antes se llamaba inline en cada Box del
    // paso "Información") -- también lo usa la pestaña "Encomiendas" para
    // decidir si vale la pena mostrar la columna "Conductor" (con un solo par
    // en el convoy, sería redundante, ya se ve en "Información").
    const paresConvoy = resolvePares(salida, { getVehiculos, getConductores })

    // Mismo criterio que ListarAnticipoExcedente.jsx (getNombreConductor) -- el
    // include de anticipoService.getAll ya trae conductor.usuario, así que acá
    // no hace falta el fallback contra el contexto de conductores.
    const nombreConductorAnticipo = (a) => {
        const usuario = a.conductor?.usuario
        if (!usuario) return '—'
        return usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : (usuario.nombre || '—')
    }

    // Un convoy puede tener varios pares vehículo+conductor -- cada PAQUETE de una
    // venta trae su propia asignación (p.asignacion.conductor), así que dos
    // paquetes de la MISMA venta podrían ir con conductores distintos. Se
    // deduplican por nombre para no repetir el mismo conductor si todos sus
    // paquetes van con el mismo par.
    const conductoresDeVenta = (v) => {
        const nombres = (v.paquetes || [])
            .map(p => p.asignacion?.conductor?.usuario)
            .filter(Boolean)
            .map(u => u.apellido ? `${u.nombre} ${u.apellido}` : u.nombre)
        return [...new Set(nombres)]
    }

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
                            {salida.origen ? `${salida.origen} - ${resolveDestinoPartes(salida, destinos).municipio}` : 'Salida Programada'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>Hacia {resolveDestinoPartes(salida, destinos).departamento}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab value="info" label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    {!ocultarEncomiendas && <Tab value="encomiendas" label="Encomiendas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />}
                    {!ocultarAnticipos && <Tab value="anticipos" label="Anticipos" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />}
                </Tabs>
            </Box>

            {tabIndex === 'info' && (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FichaCard icon={RouteOutlinedIcon} title="Recorrido">
                            <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 1 }}>Ruta (plantilla), origen y destino</Typography>
                            <CampoFila label="Ruta (plantilla)" value={getRutaLabel(salida.ruta)} />
                            <CampoFila label="Origen" value={salida.origen} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Destino</Typography>
                                <Chip label={resolveDestino(salida, destinos) || '—'} size="small"
                                    onClick={() => window.open(`/transporte/destinos?highlight=${salida.ruta?.idDestino}`, '_blank')}
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                            </Box>
                        </FichaCard>

                        <FichaCard icon={DirectionsCarOutlinedIcon}
                            title={paresConvoy.length > 1 ? 'Vehículos y Conductores' : 'Vehículo y Conductor'}
                            subtitle="Recursos asignados a esta salida">
                            {paresConvoy.map((par, i, arr) => (
                                <Box key={par.idSalidaVehiculoConductor ?? i}>
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
                            {paresConvoy.length === 0 && (
                                <Typography variant="body2" color={theme.palette.text.secondary}>Sin vehículos asignados</Typography>
                            )}
                        </FichaCard>
                    </Box>

                    <FichaCard icon={ScheduleOutlinedIcon} title="Horario y Detalles" subtitle="Fecha, horas y estado de la salida">
                        <CampoFila label="Fecha salida" value={formatFecha(salida.fechaSalida)} />
                        <CampoFila label="Hora salida" value={formatHora12(salida.horaSalida) || '—'} />
                        <CampoFila label="Fecha llegada est." value={formatFecha(salida.fechaLlegadaEstimada)} />
                        <CampoFila label="Hora llegada est." value={formatHora12(salida.horaLlegadaEstimada) || '—'} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <SalidaEstadoDot estado={salida.estado} />
                                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                    {salida.estado || '—'}
                                </Typography>
                            </Box>
                        </Box>
                        <CampoFila label="Observaciones" value={salida.observaciones} />
                        {salida.salidaIda && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Es el regreso de</Typography>
                                <Chip label={`${salida.salidaIda.origen || '—'} → ${salida.salidaIda.ruta?.destino?.municipio || '—'}`} size="small"
                                    onClick={() => window.open(buildSalidaHighlightUrl(salida.salidaIda), '_blank')}
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                            </Box>
                        )}
                        {salida.salidaRegreso && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Viaje de regreso</Typography>
                                <Chip label={`${salida.salidaRegreso.estado || '—'}`} size="small"
                                    onClick={() => window.open(buildSalidaHighlightUrl(salida.salidaRegreso), '_blank')}
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                            </Box>
                        )}
                    </FichaCard>
                </Box>
            )}

            {tabIndex === 'encomiendas' && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: tabEncomiendas.total > 100 ? 0.5 : 2 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                            Encomiendas registradas en esta salida
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
                                        {paresConvoy.length > 1 && (
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Conductor</TableCell>
                                        )}
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Valor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabEncomiendas.data.map(v => {
                                        const conductores = conductoresDeVenta(v)
                                        return (
                                        <TableRow key={v.idEncomiendaVenta}
                                            onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{getGuiaPrincipal(v) || `#${v.idEncomiendaVenta}`}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}</TableCell>
                                            {paresConvoy.length > 1 && (
                                                <TableCell sx={{ fontSize: '0.82rem' }}>
                                                    {conductores.length === 0 ? '—'
                                                        : conductores.length === 1 ? conductores[0]
                                                        : (
                                                            <Tooltip title={conductores.join(', ')}>
                                                                <span>{conductores[0]} +{conductores.length - 1}</span>
                                                            </Tooltip>
                                                        )}
                                                </TableCell>
                                            )}
                                            <TableCell sx={{ fontSize: '0.82rem' }}>${Math.round(Number(v.total || 0)).toLocaleString('es-CO')}</TableCell>
                                            <TableCell>
                                                <EstadoDot {...getVentaEstadoDot(v.estado)} />
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Box>
            )}

            {tabIndex === 'anticipos' && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: tabAnticipos.total > 100 ? 0.5 : 2 }}>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                            {salida.idSalidaIda
                                ? 'Anticipo de la ida (cubre también este regreso)'
                                : salida.salidaRegreso
                                    ? 'Anticipos asociados a esta salida (cubren también su regreso)'
                                    : 'Anticipos asociados a esta salida'}
                        </Typography>
                        {!tabAnticipos.loading && tabAnticipos.data.length > 0 && (
                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                <AdsClickOutlinedIcon sx={{ fontSize: 14 }} />
                                Puedes hacer clic en cada fila para abrirla en otra pestaña
                            </Typography>
                        )}
                    </Box>
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
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Conductor</TableCell>
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
                                            <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{nombreConductorAnticipo(a)}</TableCell>
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

export default ModalConsultarSalidaProgramada
