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
import { getEncomiendas } from '../../shared/services/ventaService'
import { getVentaEstadoDot } from '../../shared/utils/estadoColors'

const renderDot = (dot) => {
    if (dot.type === 'circle') {
        return (
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, backgroundColor: dot.fill ? dot.color : 'transparent', border: `2px solid ${dot.color}` }} />
        )
    }
    return (
        <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: dot.color, lineHeight: 1 }}>
            {dot.char}
        </Box>
    )
}

const ModalInhabilitarCliente = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)
    const [ventas, setVentas] = useState([])
    const [loadingVentas, setLoadingVentas] = useState(false)


    useEffect(() => {
        if (!open || !data?.idCliente || !data?.habilitadoActual) return
        setLoadingVentas(true)
        setVentas([])
        getEncomiendas(undefined, { idCliente: data.idCliente, habilitado: 'true', limit: 100 })
            .then(res => {
                const activas = (res?.data || []).filter(v => v.estado !== 'Entregada' && v.estado !== 'Cancelada')
                setVentas(activas)
            })
            .catch(() => setVentas([]))
            .finally(() => setLoadingVentas(false))
    }, [open, data?.idCliente, data?.habilitadoActual])

    const handleExited = () => {
        setVentas([])
        setLoadingVentas(false)
        onExited?.()
    }

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onClose()
        } catch {
        } finally {
            setConfirming(false)
        }
    }

    const nVentas = ventas.length
    const cargando = data?.habilitadoActual && loadingVentas
    const bloqueado = data?.habilitadoActual && !loadingVentas && nVentas > 0
    const nombre = data ? `${data.nombre} ${data.apellido}`.trim() : ''

    const titulo = !data?.habilitadoActual
        ? '¿Habilitar cliente?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar cliente?'

    const subtexto = !data?.habilitadoActual
        ? <><strong>{nombre}</strong> volverá a estar activo en el sistema.</>
        : bloqueado
            ? <>No es posible inhabilitar a <strong>{nombre}</strong> mientras tenga {nVentas === 1 ? 'una venta activa' : 'ventas activas'}.</>
            : <><strong>{nombre}</strong> quedará inhabilitado en el sistema.</>

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
            <DialogContent sx={{ p: 3, pb: bloqueado ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: 'auto' }}>
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
                            ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                            : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                        }
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            {titulo}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ textAlign: 'center' }}>
                            {subtexto}
                        </Typography>
                    </Box>
                </Box>

                {bloqueado && (
                    <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                        <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                            {nVentas === 1 ? 'La venta activa que impide la inhabilitación' : 'Las ventas activas que impiden la inhabilitación'}
                        </Typography>
                        <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: 160 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Guía</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ventas.map(v => {
                                            const dot = getVentaEstadoDot(v.estado)
                                            return (
                                                <TableRow
                                                    key={v.idEncomiendaVenta}
                                                    onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                                                    sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}
                                                >
                                                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                                        {v.numeroGuia || '—'}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                                            {renderDot(dot)}
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
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                {bloqueado ? (
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
                            disabled={confirming || cargando}
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                px: 5, py: 0.76, fontSize: '0.875rem',
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': { backgroundColor: theme.palette.primary.dark },
                            }}>
                            {(confirming || cargando)
                                ? <CircularProgress size={18} sx={{ color: 'white' }} />
                                : data?.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarCliente
