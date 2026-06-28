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
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'

const RutasMiniTabla = ({ rutas, theme }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mt: 1.5, width: '100%' }}>
        <TableContainer sx={{ maxHeight: 140 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Ruta</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Fecha salida</TableCell>
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
                                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                    {r.nombreRuta || `#${r.idRuta}`}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                    {r.fechaSalida ? new Date(r.fechaSalida + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </TableCell>
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

const ModalInhabilitarDestino = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)
    const [rutasInhabilitar, setRutasInhabilitar] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.id || !data.habilitadoActual) return
        setRutasInhabilitar({ data: [], loading: true })
        rutaService.getRutas({ idDestino: data.id, habilitado: 'true', limit: 100 })
            .then(res => {
                const activas = (res?.data || []).filter(r => r.estado === 'Programada' || r.estado === 'En Curso')
                setRutasInhabilitar({ data: activas, loading: false })
            })
            .catch(() => setRutasInhabilitar({ data: [], loading: false }))
    }, [open, data.id, data.habilitadoActual])

    const handleExited = () => {
        setRutasInhabilitar({ data: [], loading: false })
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

    const bloqueado = data.habilitadoActual && rutasInhabilitar.data.length > 0

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onExited: handleExited }} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}>
            <DialogContent sx={{ p: 3, pb: bloqueado ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: bloqueado ? 'auto' : 'unset' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {data.habilitadoActual
                            ? <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                            : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                        }
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            {data.habilitadoActual
                                ? bloqueado ? 'No se puede inhabilitar' : rutasInhabilitar.loading ? 'Inhabilitar destino' : '¿Inhabilitar destino?'
                                : '¿Habilitar destino?'}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                            {data.habilitadoActual
                                ? bloqueado
                                    ? <>El destino <strong>{data.ciudad}</strong> tiene {rutasInhabilitar.data.length === 1 ? 'una ruta activa' : 'rutas activas'} que {rutasInhabilitar.data.length === 1 ? 'debe completarse o cancelarse' : 'deben completarse o cancelarse'} antes de inhabilitar el destino.</>
                                    : <>El destino <strong>{data.ciudad}</strong> quedará inhabilitado en el sistema.</>
                                : <>El destino <strong>{data.ciudad}</strong> volverá a estar activo en el sistema.</>
                            }
                        </Typography>
                    </Box>
                </Box>

                {rutasInhabilitar.loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mt: 2 }}>
                        <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                    </Box>
                ) : bloqueado && (
                    <Box sx={{ mt: 1, textAlign: 'left' }}>
                        <RutasMiniTabla rutas={rutasInhabilitar.data} theme={theme} />
                    </Box>
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
                        <Button onClick={handleConfirm} disabled={confirming || rutasInhabilitar.loading} variant="contained" disableRipple
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            {confirming ? <CircularProgress size={18} sx={{ color: 'white' }} /> : data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarDestino
