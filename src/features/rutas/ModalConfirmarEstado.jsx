import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import * as ventaService from '../../shared/services/ventaService'
import * as anticipoService from '../../shared/services/anticipoService'
import { getEstadoColorRuta, getEstadoColorAnticipo, getVentaEstadoDot, getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'
import { getGuiaPrincipal } from '../../shared/utils/formatters.js'

const vehiculoDot = (estado) => {
    if (estado === 'En Ruta')       return { color: '#3B82F6', fill: true,  label: 'En Ruta' }
    if (estado === 'Mantenimiento') return { color: '#ea580c', fill: true,  label: 'Mantenimiento' }
    return                                 { color: '#10b981', fill: false, label: 'Disponible' }
}

const conductorDot = (estado) => {
    if (estado === 'en_ruta') return { color: '#3B82F6', fill: true,  label: 'En Ruta' }
    return                           { color: '#10b981', fill: false, label: 'Disponible' }
}

const EstadoDot = ({ color, fill, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: fill ? color : 'transparent', border: `2px solid ${color}` }} />
        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500, color }}>{label}</Typography>
    </Box>
)

const ModalConfirmarEstado = ({ open, nuevoEstado, info, ruta, vehiculo, conductor, onConfirm, onClose, onExited }) => {
    const theme = useTheme()
    const { color } = getEstadoColorRuta(nuevoEstado)
    const [detalle, setDetalle] = useState({ anticipos: [], ventas: [], loading: false })
    const [confirming, setConfirming] = useState(false)

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
        if (nuevoEstado !== 'En Curso' || !ruta?.idRuta) {
            setDetalle({ anticipos: [], ventas: [], loading: false })
            return
        }
        setDetalle({ anticipos: [], ventas: [], loading: true })
        Promise.all([
            anticipoService.getAnticipos(undefined, { idRuta: ruta.idRuta, estado: 'Entregado', habilitado: 'true', limit: 1 }),
            ventaService.getEncomiendas(undefined, { idRuta: ruta.idRuta, limit: 100 }),
        ])
            .then(([antRes, ventRes]) => setDetalle({
                anticipos: antRes?.data || [],
                ventas: ventRes?.data || [],
                loading: false,
            }))
            .catch(() => setDetalle({ anticipos: [], ventas: [], loading: false }))
    }, [open, nuevoEstado, ruta])

    const vehiculoLabel = vehiculo
        ? `${vehiculo.placa}${vehiculo.marca ? ` · ${vehiculo.marca}` : ''}`
        : ruta?.vehiculo?.placa || 'N/A'

    const conductorLabel = conductor
        ? `${conductor.nombre || conductor.usuario?.nombre || ''} ${conductor.apellido || conductor.usuario?.apellido || ''}`.trim()
        : ruta?.conductor?.usuario
            ? `${ruta.conductor.usuario.nombre} ${ruta.conductor.usuario.apellido}`
            : 'N/A'

    const vDot = vehiculoDot(vehiculo?.estado)
    const cDot = conductorDot(conductor?.estado)
    const isEnCurso = nuevoEstado === 'En Curso'

    const vehiculoId = vehiculo?.idVehiculo || ruta?.vehiculo?.idVehiculo
    const conductorId = conductor?.idConductor || ruta?.conductor?.idConductor
    const openRecord = (path) => window.open(path, '_blank')
    const openHighlight = (base, id) => openRecord(`${base}?highlight=${id}`)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onClick={(e) => e.stopPropagation()}
            TransitionProps={{ onExited: () => { setDetalle({ anticipos: [], ventas: [], loading: false }); onExited?.() } }}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}>

            <DialogContent sx={{ p: 3, pb: isEnCurso ? 1 : 3, textAlign: 'center', position: 'relative', overflowY: 'unset' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
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
                        {(nuevoEstado === 'Completada' || nuevoEstado === 'En Curso') && (
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

                        {/* Sección 1: Vehículo + Conductor */}
                        <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                            El vehículo y el conductor pasarán a{' '}
                            <Box component="span" sx={{ color: '#3B82F6' }}>"En Ruta"</Box>
                        </Typography>
                        <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                            <Box onClick={() => vehiculoId && openHighlight('/vehiculos/listar', vehiculoId)}
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderBottom: `1px solid ${theme.palette.divider}`, cursor: vehiculoId ? 'pointer' : 'default', '&:hover': vehiculoId ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DirectionsCarOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" fontWeight={500}>{vehiculoLabel}</Typography>
                                </Box>
                                <EstadoDot {...vDot} />
                            </Box>
                            <Box onClick={() => conductorId && openHighlight('/transporte/conductores', conductorId)}
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: conductorId ? 'pointer' : 'default', '&:hover': conductorId ? { backgroundColor: theme.palette.action.hover } : {} }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2" fontWeight={500}>{conductorLabel}</Typography>
                                </Box>
                                <EstadoDot {...cDot} />
                            </Box>
                        </Paper>

                        {detalle.loading
                            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
                            : (
                                <>
                                    {/* Sección 2: Anticipo */}
                                    {detalle.anticipos.length > 0 && (
                                        <>
                                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                                                El anticipo entregado pasará a{' '}
                                                <Box component="span" sx={{ color: getEstadoColorAnticipo('En Legalización').color }}>"En Legalización"</Box>
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mb: 1, display: 'block' }}>
                                                Desde ese momento, la ruta/conductor y el valor del anticipo no se podrán modificar.
                                            </Typography>
                                            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                                                {detalle.anticipos.map((a, i) => {
                                                    const dot = getAnticipoEstadoDot(a.estado)
                                                    const label = [
                                                        a.valorAnticipo ? `$${Number(a.valorAnticipo).toLocaleString('es-CO')}` : null,
                                                        a.fechaEntrega ? new Date(a.fechaEntrega + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                                                    ].filter(Boolean).join(' · ') || 'Anticipo'
                                                    return (
                                                        <Box key={a.idAnticipoExcedente}
                                                            onClick={() => openHighlight('/anticipos/listar', a.idAnticipoExcedente)}
                                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1,
                                                                borderBottom: i < detalle.anticipos.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                                                cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                                                {label}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                {dot.type === 'circle'
                                                                    ? <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                                    : <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>{dot.char}</Box>
                                                                }
                                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                            </Box>
                                                        </Box>
                                                    )
                                                })}
                                            </Paper>
                                        </>
                                    )}

                                    {/* Sección 3: Ventas */}
                                    {detalle.ventas.length > 0 && (
                                        <>
                                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                                Las ventas asociadas pasarán a{' '}
                                                <Box component="span" sx={{ color: getVentaEstadoDot('En Tránsito').color }}>"En Tránsito"</Box>
                                            </Typography>
                                            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                                                <TableContainer sx={{ maxHeight: 180 }}>
                                                    <Table size="small" stickyHeader>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Guía</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Cliente</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {detalle.ventas.map(v => (
                                                                <TableRow key={v.idEncomiendaVenta}
                                                                    onClick={() => openHighlight('/ventas/listar', v.idEncomiendaVenta)}
                                                                    sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                                                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{getGuiaPrincipal(v) || `#${v.idEncomiendaVenta}`}</TableCell>
                                                                    <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}</TableCell>
                                                                    <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                                                        {(() => {
                                                                            const dot = getVentaEstadoDot(v.estado)
                                                                            return (
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                                                                    {dot.type === 'circle'
                                                                                        ? <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                                                        : <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>{dot.char}</Box>
                                                                                    }
                                                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                                                </Box>
                                                                            )
                                                                        })()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>
                                        </>
                                    )}
                                </>
                            )}
                    </Box>
                )}
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                <Button onClick={onClose} disableRipple sx={{
                    textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                    borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
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
