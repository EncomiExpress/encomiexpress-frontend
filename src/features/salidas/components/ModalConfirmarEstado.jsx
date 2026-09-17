import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import * as ventaService from '../../ventas/services/ventaService.js'
import * as anticipoService from '../../anticipos/services/anticipoService.js'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { getEstadoColorRuta, getEstadoColorAnticipo, getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'
import EstadoDot from '../../rutas/components/EstadoDot.jsx'
import VentasConflictoTable from './VentasConflictoTable.jsx'
import AnticiposConflictoList from './AnticiposConflictoList.jsx'

const vehiculoDot = (estado) => {
    if (estado === 'En Ruta')       return { color: '#3B82F6', fill: true,  label: 'En Ruta' }
    if (estado === 'Mantenimiento') return { color: '#ea580c', fill: true,  label: 'Mantenimiento' }
    return                                 { color: '#10b981', fill: false, label: 'Disponible' }
}

const conductorDot = (estado) => {
    if (estado === 'en_ruta') return { color: '#3B82F6', fill: true,  label: 'En Ruta' }
    return                           { color: '#10b981', fill: false, label: 'Disponible' }
}

// Adaptado de rutas/components/ModalConfirmarEstado.jsx. `salida` reemplaza a
// `ruta`; las consultas de anticipos/ventas ahora filtran por `idSalida`.
const ModalConfirmarEstado = ({ open, nuevoEstado, info, salida, pares = [], onConfirm, onClose, onExited }) => {
    const theme = useTheme()
    const { usuario } = useAuth()
    const { color } = getEstadoColorRuta(nuevoEstado)
    const [detalle, setDetalle] = useState({ anticipos: [], ventas: [], loading: false })
    const [confirming, setConfirming] = useState(false)

    // El anticipo no es dominio de operador_sede -- nunca se le muestra nada de la
    // Sección 2. Para un regreso (idSalidaIda), el anticipo que lo cubre SIEMPRE vive
    // en la ida ("Anticipo ida+retorno") y arrancar el regreso no le mueve el estado a
    // nada -- por eso la consulta de abajo sigue filtrando por `salida.idSalida`, pero
    // el aviso "no hay anticipo registrado" deja de mostrarse para un regreso.
    const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'
    const esRegreso = salida?.idSalidaIda != null

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
        } finally {
            setConfirming(false)
        }
    }

    useEffect(() => {
        if (!open) return
        if (nuevoEstado !== 'En Ruta' || !salida?.idSalida) {
            setDetalle({ anticipos: [], ventas: [], loading: false })
            return
        }
        setDetalle({ anticipos: [], ventas: [], loading: true })
        Promise.all([
            anticipoService.getAnticipos(undefined, { idSalida: salida.idSalida, estado: 'Entregado', habilitado: 'true', limit: 1 }),
            ventaService.getEncomiendas(undefined, { idSalida: salida.idSalida, limit: 100 }),
        ])
            .then(([antRes, ventRes]) => setDetalle({
                anticipos: antRes?.data || [],
                ventas: ventRes?.data || [],
                loading: false,
            }))
            .catch(() => setDetalle({ anticipos: [], ventas: [], loading: false }))
    }, [open, nuevoEstado, salida])

    // Cuántos paquetes tiene cada par vehículo+conductor — un vehículo del convoy puede
    // salir vacío (nada lo bloquea) así que esto es solo para avisar, no para impedir
    // el cambio de estado.
    const paquetesPorPar = detalle.ventas
        .flatMap(v => v.paquetes || [])
        .reduce((acc, p) => {
            acc[p.idSalidaVehiculoConductor] = (acc[p.idSalidaVehiculoConductor] || 0) + 1
            return acc
        }, {})

    // Una salida ahora puede tener varios vehículos+conductor (convoy) — se arma un
    // renglón por cada par en vez de mostrar uno solo.
    const paresInfo = pares.map((par) => ({
        vehiculoLabel: par.vehiculo
            ? `${par.vehiculo.placa}${par.vehiculo.marca ? ` · ${par.vehiculo.marca}` : ''}`
            : 'N/A',
        conductorLabel: par.conductor
            ? `${par.conductor.nombre || ''} ${par.conductor.apellido || ''}`.trim() || 'N/A'
            : 'N/A',
        vDot: vehiculoDot(par.vehiculo?.estado),
        cDot: conductorDot(par.conductor?.estado),
        vehiculoId: par.vehiculo?.idVehiculo,
        conductorId: par.conductor?.idConductor,
        sinPaquetes: !detalle.loading && !(paquetesPorPar[par.idSalidaVehiculoConductor] > 0),
    }))
    const isEnCurso = nuevoEstado === 'En Ruta'

    const openRecord = (path) => window.open(path, '_blank')
    const openHighlight = (base, id) => openRecord(`${base}?highlight=${id}`)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onClick={(e) => e.stopPropagation()}
            TransitionProps={{ onExited: () => { setDetalle({ anticipos: [], ventas: [], loading: false }); onExited?.() } }}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}>

            <DialogContent sx={{ p: 3, pb: isEnCurso ? 1 : 3, textAlign: 'center', position: 'relative', overflowY: 'auto' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.neutral.main, '&:hover': { backgroundColor: theme.palette.neutral.dim } }}>
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{
                        width: 67, height: 67, borderRadius: '50%',
                        backgroundColor: color + '22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SwapHorizOutlinedIcon sx={{ fontSize: 35, color }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            Cambiar estado
                        </Typography>
                        {(nuevoEstado === 'Completada' || nuevoEstado === 'En Ruta' || nuevoEstado === 'Cancelada') && (
                            <Typography fontWeight={700} fontSize="0.8rem" color={theme.palette.text.secondary}>
                                Estado irreversible.
                            </Typography>
                        )}
                        <Typography fontSize="1rem" color={theme.palette.text.secondary}>
                            ¿Seguro que deseas cambiarlo a{' '}
                            <Box component="span" sx={{ fontWeight: 700, color }}>{nuevoEstado}</Box>?
                        </Typography>
                    </Box>
                </Box>

                {!isEnCurso && info && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        {info}
                    </Typography>
                )}

                {isEnCurso && (
                    <Box sx={{ mt: 2.5, textAlign: 'left' }}>

                        {/* Sección 1: Vehículo + Conductor — un bloque por cada par del convoy */}
                        <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                            {paresInfo.length > 1 ? 'Los vehículos y conductores pasarán a' : 'El vehículo y el conductor pasarán a'}{' '}
                            <Box component="span" sx={{ color: '#3B82F6' }}>"En Ruta"</Box>
                        </Typography>
                        {paresInfo.map((p, i) => (
                            <Paper key={i} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mb: i < paresInfo.length - 1 ? 1 : 2 }}>
                                <Box onClick={() => p.vehiculoId && openHighlight('/vehiculos/listar', p.vehiculoId)}
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderBottom: `1px solid ${theme.palette.divider}`, cursor: p.vehiculoId ? 'pointer' : 'default', '&:hover': p.vehiculoId ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                        <Typography variant="body2" fontWeight={500}>{p.vehiculoLabel}</Typography>
                                    </Box>
                                    <EstadoDot {...p.vDot} />
                                </Box>
                                <Box onClick={() => p.conductorId && openHighlight('/transporte/conductores', p.conductorId)}
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: p.conductorId ? 'pointer' : 'default', '&:hover': p.conductorId ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                        <Typography variant="body2" fontWeight={500}>{p.conductorLabel}</Typography>
                                    </Box>
                                    <EstadoDot {...p.cDot} />
                                </Box>
                            </Paper>
                        ))}

                        {detalle.loading
                            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
                            : (
                                <>
                                    {/* Sección 2: Anticipo — nunca para operador_sede; el aviso de "no
                                        hay anticipo" tampoco aplica a un regreso */}
                                    {!esOperadorSede && detalle.anticipos.length > 0 && (
                                        <>
                                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                                                El anticipo entregado pasará a{' '}
                                                <Box component="span" sx={{ color: getEstadoColorAnticipo('En Legalización').color }}>"En Legalización"</Box>
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mb: 1, display: 'block' }}>
                                                Desde ese momento, la salida/conductor y el valor del anticipo no se podrán modificar.
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <AnticiposConflictoList theme={theme} anticipos={detalle.anticipos} />
                                            </Box>
                                        </>
                                    )}
                                    {!esOperadorSede && detalle.anticipos.length === 0 && !esRegreso && (
                                        <Box sx={{ px: 1.5, py: 1, mb: 2, borderRadius: 2, backgroundColor: theme.palette.warning.dim, border: `1px solid ${theme.palette.warning.main}40` }}>
                                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: theme.palette.warning.dark }}>
                                                No hay ningún anticipo registrado para esta salida — puedes continuar, pero recuerda registrarlo si el conductor va a tener gastos del viaje.
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Sección 3: Ventas */}
                                    {detalle.ventas.length > 0 && (
                                        <>
                                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                                Las ventas asociadas pasarán a{' '}
                                                <Box component="span" sx={{ color: getVentaEstadoDot('En Ruta').color }}>"En Ruta"</Box>
                                            </Typography>
                                            <Box sx={{ mb: 1 }}>
                                                <VentasConflictoTable theme={theme} ventas={detalle.ventas} />
                                            </Box>
                                        </>
                                    )}
                                </>
                            )}
                    </Box>
                )}
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                <Button onClick={onClose} disableRipple sx={{
                    textTransform: 'none', color: theme.palette.neutral.main, fontWeight: 500,
                    borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { backgroundColor: theme.palette.neutral.dim, color: theme.palette.neutral.dark },
                }}>
                    Cancelar
                </Button>
                <Button onClick={handleConfirm} disabled={confirming} variant="contained" disableRipple sx={{
                    textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                    px: 5, py: 0.76, fontSize: '0.875rem',
                    backgroundColor: color,
                    '&:hover': { backgroundColor: color, filter: 'brightness(0.88)' },
                }}>
                    {confirming ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar'}
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConfirmarEstado
