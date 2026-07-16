import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Box, Typography, Button, Dialog, DialogContent, IconButton, CircularProgress,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import * as rutaService from '../../shared/services/rutaService'
import * as anticipoService from '../../shared/services/anticipoService'
import { getEstadoColorRuta, getAnticipoEstadoDot } from '../../shared/utils/estadoColors.js'

const ESTADOS_BLOQUEO_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente']

const RutasTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 120 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Destino</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rutas.map(r => {
                        const { color } = getEstadoColorRuta(r.estado)
                        const esProgramada = r.estado === 'Programada'
                        return (
                            <TableRow key={r.idRuta}
                                onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{r.nombreRuta || `#${r.idRuta}`}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>{r.destino?.ciudad || '—'}</TableCell>
                                <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: esProgramada ? 'transparent' : color, border: `2px solid ${color}` }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{r.estado}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

const ModalInhabilitarConductor = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)
    const [rutasDetalle, setRutasDetalle] = useState({ data: [], loading: false })
    const [anticiposDetalle, setAnticiposDetalle] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.idConductor || !data.habilitadoActual) return
        setRutasDetalle({ data: [], loading: true })
        setAnticiposDetalle({ data: [], loading: true })
        Promise.all([
            rutaService.getRutas({ idConductor: data.idConductor, habilitado: 'true', limit: 100 }),
            anticipoService.getAnticipos(undefined, { idConductor: data.idConductor, habilitado: 'true', limit: 100 }),
        ])
            .then(([rutasRes, anticiposRes]) => {
                setRutasDetalle({ data: rutasRes?.data || [], loading: false })
                setAnticiposDetalle({ data: anticiposRes?.data || [], loading: false })
            })
            .catch(() => {
                setRutasDetalle({ data: [], loading: false })
                setAnticiposDetalle({ data: [], loading: false })
            })
    }, [open, data.idConductor, data.habilitadoActual])

    const handleExited = () => {
        setRutasDetalle({ data: [], loading: false })
        setAnticiposDetalle({ data: [], loading: false })
        onExited?.()
    }

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onClose()
        } catch {
            // error handled by parent via snackbar
        } finally {
            setConfirming(false)
        }
    }

    const rutasEnCurso = rutasDetalle.data.filter(r => r.estado === 'En Curso')
    const rutasProgramadas = rutasDetalle.data.filter(r => r.estado === 'Programada')
    const anticiposBloqueo = anticiposDetalle.data.filter(a => ESTADOS_BLOQUEO_ANTICIPO.includes(a.estado))
    const cargando = rutasDetalle.loading || anticiposDetalle.loading
    const bloqueado = data.habilitadoActual && (rutasEnCurso.length > 0 || anticiposBloqueo.length > 0)

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onExited: handleExited }} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}>
            <DialogContent sx={{ p: 3, pb: (rutasEnCurso.length > 0 || rutasProgramadas.length > 0 || anticiposBloqueo.length > 0) ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: 'unset' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {data.habilitadoActual
                            ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                            : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        }
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            {data.habilitadoActual
                                ? bloqueado ? 'No se puede inhabilitar' : cargando ? 'Inhabilitar conductor' : '¿Inhabilitar conductor?'
                                : '¿Habilitar conductor?'}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                            {data.habilitadoActual
                                ? rutasEnCurso.length > 0 && anticiposBloqueo.length > 0
                                    ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras esté en ruta y tenga {anticiposBloqueo.length === 1 ? 'un anticipo pendiente' : 'anticipos pendientes'} de legalización.</>
                                    : rutasEnCurso.length > 0
                                        ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras esté en ruta.</>
                                        : anticiposBloqueo.length > 0
                                            ? <>No es posible inhabilitar a <strong>{data.nombreCompleto}</strong> mientras tenga {anticiposBloqueo.length === 1 ? 'un anticipo pendiente' : 'anticipos pendientes'} de legalización.</>
                                            : <><strong>{data.nombreCompleto}</strong> quedará inhabilitado en el sistema.</>
                                : <><strong>{data.nombreCompleto}</strong> volverá a estar activo en el sistema.</>
                            }
                        </Typography>
                    </Box>
                </Box>

                {cargando ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                        <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                    </Box>
                ) : (
                    <>
                        {rutasEnCurso.length > 0 && (
                            <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    {rutasEnCurso.length === 1 ? 'La ruta En Curso que impide la inhabilitación' : 'Las rutas En Curso que impiden la inhabilitación'}
                                </Typography>
                                <RutasTabla rutas={rutasEnCurso} theme={theme} />
                            </Box>
                        )}
                        {anticiposBloqueo.length > 0 && (
                            <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    {anticiposBloqueo.length === 1 ? 'Anticipo pendiente que impide la inhabilitación' : 'Anticipos pendientes que impiden la inhabilitación'}
                                </Typography>
                                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                    <TableContainer sx={{ maxHeight: 120 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Fecha entrega</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Valor</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {anticiposBloqueo.map(a => {
                                                    const dot = getAnticipoEstadoDot(a.estado)
                                                    return (
                                                        <TableRow key={a.idAnticipoExcedente}
                                                            onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                                                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                                                            <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                                                {a.fechaEntrega ? new Date(a.fechaEntrega + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', py: 0.75, textAlign: 'right' }}>
                                                                ${Number(a.valorAnticipo).toLocaleString('es-CO')}
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
                        {!bloqueado && rutasProgramadas.length > 0 && (
                            <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                                <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                    {rutasProgramadas.length === 1 ? 'Ruta programada que necesitará ser reasignada a otro conductor' : 'Rutas programadas que necesitarán ser reasignadas a otro conductor'}
                                </Typography>
                                <RutasTabla rutas={rutasProgramadas} theme={theme} />
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                {bloqueado ? (
                    <Button onClick={onClose} variant="contained" disableRipple
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                        Entendido
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose} disableRipple
                            sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirm} disabled={confirming || cargando} variant="contained" disableRipple
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            {confirming ? <CircularProgress size={18} sx={{ color: 'white' }} /> : data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarConductor
