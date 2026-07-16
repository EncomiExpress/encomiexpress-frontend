import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Dialog, DialogContent, Box, Typography, Button, CircularProgress,
    Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton,
} from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import * as ventaService from '../../shared/services/ventaService'
import * as anticipoService from '../../shared/services/anticipoService'
import { getVentaEstadoDot, getAnticipoEstadoDot } from '../../shared/utils/estadoColors'

const ESTADOS_BLOQUEO_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente']

const ModalInhabilitarRuta = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)
    const [deps, setDeps] = useState({ ventas: [], anticipos: [], loading: false })

    useEffect(() => {
        if (!open || !data?.idRuta || !data?.habilitadoActual) {
            return
        }
        setDeps({ ventas: [], anticipos: [], loading: true })
        Promise.all([
            ventaService.getEncomiendas(undefined, { idRuta: data.idRuta, habilitado: 'true', limit: 100 }),
            anticipoService.getAnticipos(undefined, { idRuta: data.idRuta, habilitado: 'true', limit: 100 }),
        ])
            .then(([ventRes, antRes]) => {
                const ventas = (ventRes?.data || []).filter(v => v.estado !== 'Entregada' && v.estado !== 'Cancelada')
                const anticipos = (antRes?.data || []).filter(a => ESTADOS_BLOQUEO_ANTICIPO.includes(a.estado))
                setDeps({ ventas, anticipos, loading: false })
            })
            .catch(() => setDeps({ ventas: [], anticipos: [], loading: false }))
    }, [open, data?.idRuta, data?.habilitadoActual])

    const handleExited = () => {
        setDeps({ ventas: [], anticipos: [], loading: false })
        onExited?.()
    }

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onClose()
        } catch {
            // onConfirm muestra el snackbar de error
        } finally {
            setConfirming(false)
        }
    }

    const enCurso = data?.habilitadoActual && data?.estadoRuta === 'En Curso'
    const nVentas = deps.ventas.length
    const hayAnticipo = deps.anticipos.length > 0
    const bloqueado = data?.habilitadoActual && (enCurso || nVentas > 0 || hayAnticipo)
    const cargando = data?.habilitadoActual && deps.loading

    const nombre = data?.nombreRuta || `#${data?.idRuta}`

    const titulo = !data?.habilitadoActual
        ? '¿Habilitar ruta?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : cargando
                ? 'Inhabilitar ruta'
                : '¿Inhabilitar ruta?'

    const subtexto = !data?.habilitadoActual
        ? <>La ruta <strong>{nombre}</strong> volverá a estar activa en el sistema.</>
        : enCurso
            ? <>La ruta <strong>{nombre}</strong> está en curso. Complétala o cancélala antes de inhabilitarla.</>
            : nVentas > 0 && hayAnticipo
                ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga ventas activas y un anticipo activo.</>
                : nVentas > 0
                    ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga {nVentas === 1 ? 'una venta activa' : 'ventas activas'}.</>
                    : hayAnticipo
                        ? <>No es posible inhabilitar la ruta <strong>{nombre}</strong> mientras tenga un anticipo activo.</>
                        : <>La ruta <strong>{nombre}</strong> quedará inhabilitada en el sistema.</>

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableAutoFocus
            TransitionProps={{ onExited: handleExited }}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}
        >
            <DialogContent sx={{ p: 3, pb: (bloqueado && !cargando) ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: 'unset' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{
                        width: 67, height: 67, borderRadius: '50%',
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {data?.habilitadoActual
                            ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                            : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        }
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            {titulo}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                            {subtexto}
                        </Typography>
                    </Box>
                </Box>

                {cargando && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                        <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                    </Box>
                )}

                {!cargando && bloqueado && (
                    <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                        {nVentas > 0 && (
                            <Box sx={{ mb: hayAnticipo ? 2.5 : 0 }}>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    {enCurso
                                        ? nVentas === 1 ? 'La venta en tránsito' : 'Las ventas en tránsito'
                                        : nVentas === 1 ? 'La venta activa que impide la inhabilitación' : 'Las ventas activas que impiden la inhabilitación'}
                                </Typography>
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <TableContainer sx={{ maxHeight: 140 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Guía</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Cliente</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {deps.ventas.map(v => {
                                                    const dot = getVentaEstadoDot(v.estado)
                                                    return (
                                                        <TableRow key={v.idEncomiendaVenta}
                                                            onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                                                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                                                {v.numeroGuia || `#${v.idEncomiendaVenta}`}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                                                {v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}
                                                            </TableCell>
                                                            <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                                                    {dot.type === 'circle'
                                                                        ? <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                                        : <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>{dot.char}</Box>
                                                                    }
                                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Box>
                        )}

                        {deps.anticipos.length > 0 && (() => {
                            const a = deps.anticipos[0]
                            const dot = getAnticipoEstadoDot(a.estado)
                            return (
                                <Box>
                                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                        {enCurso ? 'El anticipo en legalización' : 'El anticipo activo que impide la inhabilitación'}
                                    </Typography>
                                    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                        <Box
                                            onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                        >
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                                {[
                                                    a.valorAnticipo ? `$${Number(a.valorAnticipo).toLocaleString('es-CO')}` : null,
                                                    a.fechaEntrega ? new Date(a.fechaEntrega + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                                                ].filter(Boolean).join(' · ') || 'Anticipo'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                {dot.type === 'circle'
                                                    ? <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
                                                    : <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>{dot.char}</Box>
                                                }
                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>{dot.label}</Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                            )
                        })()}
                    </Box>
                )}
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                {enCurso || bloqueado ? (
                    <Button onClick={onClose} variant="contained" disableRipple sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600,
                        px: 5, py: 0.76, fontSize: '0.875rem',
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}>
                        Entendido
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose} disableRipple sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500,
                            borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirm} variant="contained" disableRipple
                            disabled={cargando || confirming}
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                                px: 5, py: 0.76, fontSize: '0.875rem',
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': { backgroundColor: theme.palette.primary.dark },
                            }}>
                            {confirming
                                ? <CircularProgress size={18} sx={{ color: 'white' }} />
                                : data?.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarRuta
