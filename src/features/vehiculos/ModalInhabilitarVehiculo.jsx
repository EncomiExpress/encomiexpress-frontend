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

const ModalInhabilitarVehiculo = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)
    const [rutasInhabilitar, setRutasInhabilitar] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!open || !data.id || !data.habilitadoActual) return
        setRutasInhabilitar({ data: [], loading: true })
        rutaService.getRutas({ idVehiculo: data.id, habilitado: 'true', limit: 100 })
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

    const modalCargando = rutasInhabilitar.loading
    const modalBloqueado = data.habilitadoActual && rutasInhabilitar.data.some(r => r.estado === 'En Curso')
    const modalProgramadas = rutasInhabilitar.data.filter(r => r.estado === 'Programada')

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onExited: handleExited }} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}>
            <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative', overflowY: modalProgramadas.length > 0 || modalBloqueado ? 'auto' : 'unset' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>

                {!data.habilitadoActual ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>¿Habilitar vehículo?</Typography>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                El vehículo <strong>{data.placa}</strong> volverá a estar activo en el sistema.
                            </Typography>
                        </Box>
                    </Box>
                ) : modalCargando ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>¿Inhabilitar vehículo?</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
                        </Box>
                    </Box>
                ) : modalBloqueado ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>No se puede inhabilitar</Typography>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                No es posible inhabilitar el vehículo <strong>{data.placa}</strong> mientras esté en ruta.
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 0.5, width: '100%', textAlign: 'left' }}>
                            <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                                Ruta activa que impide la inhabilitación
                            </Typography>
                            <RutasMiniTabla rutas={rutasInhabilitar.data.filter(r => r.estado === 'En Curso')} theme={theme} />
                        </Box>
                    </Box>
                ) : data.estadoVehiculo === 'Mantenimiento' && modalProgramadas.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>¿Inhabilitar vehículo?</Typography>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                El vehículo <strong>{data.placa}</strong> está actualmente en mantenimiento. Al inhabilitarlo dejará de estar disponible en el sistema.
                            </Typography>
                        </Box>
                    </Box>
                ) : modalProgramadas.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>¿Inhabilitar vehículo?</Typography>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                {data.estadoVehiculo === 'Mantenimiento'
                                    ? <>El vehículo <strong>{data.placa}</strong> está en mantenimiento. Además tiene {modalProgramadas.length === 1 ? 'una ruta programada' : 'rutas programadas'} que {modalProgramadas.length === 1 ? 'necesitará ser reasignada' : 'necesitarán ser reasignadas'} a otro vehículo.</>
                                    : <>El vehículo <strong>{data.placa}</strong> tiene {modalProgramadas.length === 1 ? 'una ruta programada' : 'rutas programadas'} que {modalProgramadas.length === 1 ? 'necesitará ser reasignada' : 'necesitarán ser reasignadas'} a otro vehículo.</>
                                }
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%', textAlign: 'left' }}>
                            <RutasMiniTabla rutas={modalProgramadas} theme={theme} />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                        <Box sx={{ width: 67, height: 67, borderRadius: '50%', backgroundColor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BlockOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.darker }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>¿Inhabilitar vehículo?</Typography>
                            <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                                El vehículo <strong>{data.placa}</strong> quedará inhabilitado en el sistema.
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                {data.habilitadoActual && modalBloqueado ? (
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
                        <Button onClick={handleConfirm} disabled={confirming || modalCargando} variant="contained" disableRipple
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                            {confirming ? <CircularProgress size={18} sx={{ color: 'white' }} /> : data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarVehiculo
