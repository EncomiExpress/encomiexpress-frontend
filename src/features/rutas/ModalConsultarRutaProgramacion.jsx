import { useTheme, alpha } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as ventaService from '../../shared/services/ventaService'
import * as anticipoService from '../../shared/services/anticipoService'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { useConductor } from '../../shared/contexts/ConductorContext.jsx'
import { useDestino } from '../../shared/contexts/DestinoContext.jsx'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton, CircularProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AdsClickOutlinedIcon from '@mui/icons-material/AdsClickOutlined'
import RouteIcon from '@mui/icons-material/Route'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { getEstadoColorRuta, getAnticipoEstadoDot, getVentaEstadoDot } from '../../shared/utils/estadoColors.js'
import { formatFecha, getGuiaPrincipal } from '../../shared/utils/formatters.js'
import { getDocumentoVehiculoVencido, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'

const formatHora12 = (hora) => {
    if (!hora) return null
    const [h, m] = hora.split(':').map(Number)
    const periodo = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${periodo}`
}

const renderEstadoRuta = (estado) => {
    const color = getEstadoColorRuta(estado).color
    if (estado === 'Cancelada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    if (estado === 'Completada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    if (estado === 'Programada')
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

const CampoFila = ({ label, value, esChip }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            {esChip ? (
                <Chip
                    label={value || '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}

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

    // Una ruta ahora puede tener varios vehículos+conductor (convoy) — se expone el
    // array completo de pares en vez de un solo vehículo/conductor.
    const resolvePares = (r) => (r.paresVehiculoConductor || []).map(par => {
        const conductorCtx = getConductores().find(c => c.idConductor === par.idConductor)
        return {
            idRutaVehiculoConductor: par.idRutaVehiculoConductor,
            idVehiculo: par.idVehiculo,
            placa: par.vehiculo?.placa ?? (getVehiculos().find(v => v.idVehiculo === par.idVehiculo)?.placa || 'N/A'),
            idConductor: par.idConductor,
            conductorNombre: par.conductor?.usuario
                ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}`
                : (conductorCtx ? `${conductorCtx.nombre} ${conductorCtx.apellido}` : 'N/A'),
            // El backend solo revalida documentos/licencia al crear/cambiar el par o al
            // pasar a "En Curso" — nunca de forma continua — así que se marca acá para
            // que no quede invisible mientras la ruta sigue Programada.
            documentoVencido: par.vehiculo ? getDocumentoVehiculoVencido(par.vehiculo) : null,
            licenciaVencida: par.conductor ? !conductorLicenciaVigente(par.conductor.categoriasLicencia) : false,
        }
    })
    const resolveDestino = (r) => {
        if (r.destino) return `${r.destino.ciudad}, ${r.destino.departamento}`
        const d = destinos.find(d => d.idDestino === r.idDestino)
        return d ? `${d.ciudad}, ${d.departamento}` : 'N/A'
    }

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
                            {ruta.nombreRuta || 'Ruta Programada'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>{resolveDestino(ruta)}</Typography>
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
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <RouteOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Datos de la Ruta y Horario</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Nombre, destino, fecha, horas y estado de la ruta
                            </Typography>
                            <CampoFila label="Nombre" value={ruta.nombreRuta} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Destino</Typography>
                                <Chip label={resolveDestino(ruta) || '—'} size="small"
                                    onClick={() => window.open(`/transporte/destinos?highlight=${ruta.idDestino}`, '_blank')}
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', cursor: 'pointer', '&:hover': { filter: 'brightness(0.92)' } }} />
                            </Box>
                            <CampoFila label="Fecha salida" value={formatFecha(ruta.fechaSalida)} />
                            <CampoFila label="Hora salida" value={formatHora12(ruta.horaSalida) || '—'} />
                            <CampoFila label="Hora llegada est." value={formatHora12(ruta.horaLlegadaEstimada) || '—'} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    {renderEstadoRuta(ruta.estado)}
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                        {ruta.estado || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            <CampoFila label="Observaciones" value={ruta.observaciones} />
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DirectionsCarOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">
                                    {resolvePares(ruta).length > 1 ? 'Vehículos y Conductores' : 'Vehículo y Conductor'}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Recursos asignados a esta ruta
                            </Typography>
                            {resolvePares(ruta).map((par, i, arr) => (
                                <Box key={par.idRutaVehiculoConductor ?? i}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                                            {arr.length > 1 ? `Vehículo ${i + 1}` : 'Vehículo'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            {par.documentoVencido && (
                                                <Chip label={`${par.documentoVencido} vencido`} size="small"
                                                    sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.dark, border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`, fontSize: '0.65rem', height: 20 }} />
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
                                                    sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.dark, border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`, fontSize: '0.65rem', height: 20 }} />
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
                            {resolvePares(ruta).length === 0 && (
                                <Typography variant="body2" color={theme.palette.text.secondary}>Sin vehículos asignados</Typography>
                            )}
                        </Paper>
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
                                                {(() => {
                                                    const info = getVentaEstadoDot(v.estado)
                                                    return (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            {info.type === 'symbol'
                                                                ? <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>{info.char}</Box>
                                                                : <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
                                                            }
                                                            <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{info.label}</Typography>
                                                        </Box>
                                                    )
                                                })()}
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
                                    {tabAnticipos.data.map(a => {
                                        const info = getAnticipoEstadoDot(a.estado)
                                        return (
                                            <TableRow key={a.idAnticipoExcedente}
                                                onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                                <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorAnticipo).toLocaleString('es-CO')}</TableCell>
                                                <TableCell sx={{ fontSize: '0.82rem' }}>${Number(a.valorGastado || 0).toLocaleString('es-CO')}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                        {info.type === 'symbol'
                                                            ? <Box component="span" sx={{ width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: info.char === '✓' ? '0.8rem' : '0.85rem', color: info.color, lineHeight: 1, flexShrink: 0 }}>{info.char}</Box>
                                                            : <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: info.fill ? info.color : 'transparent', border: `2px solid ${info.color}` }} />
                                                        }
                                                        <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{info.label}</Typography>
                                                    </Box>
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
