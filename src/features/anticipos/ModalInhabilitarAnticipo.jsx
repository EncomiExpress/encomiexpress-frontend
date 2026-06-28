import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
    Dialog, DialogContent, Box, Typography, Button, CircularProgress,
    Paper, IconButton,
} from '@mui/material'
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getAnticipoEstadoDot, getRutaEstadoDot } from '../../shared/utils/estadoColors'

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

const getRutaLabel = (ruta) => {
    if (!ruta) return '—'
    const partes = [ruta.nombreRuta, ruta.destino?.nombre].filter(Boolean)
    const placa = ruta.vehiculo?.placa
    const base = partes[0] || '—'
    return placa ? `${base} · ${placa}` : base
}

const ModalInhabilitarAnticipo = ({ open, anticipo, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)

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

    const habilitadoActual = anticipo?.habilitado === true
    const bloqueado = habilitadoActual && anticipo?.estado !== 'Completado'
    const ruta = anticipo?.ruta || null

    const nombreConductor = anticipo?.conductor?.usuario
        ? `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
        : 'el conductor'

    const titulo = !habilitadoActual
        ? '¿Habilitar anticipo?'
        : bloqueado
            ? 'No se puede inhabilitar'
            : '¿Inhabilitar anticipo?'

    const subtexto = !habilitadoActual
        ? <>El anticipo de <strong>{nombreConductor}</strong> volverá a estar activo.</>
        : bloqueado
            ? anticipo.estado === 'En Legalización'
                ? <><strong>{nombreConductor}</strong> aún no ha registrado los gastos del anticipo.</>
                : anticipo.estado === 'Excedente pendiente'
                    ? <>El conductor tiene un excedente pendiente de devolución.</>
                    : <>El anticipo aún no ha sido completado.</>
            : <>El anticipo de <strong>{nombreConductor}</strong> quedará inhabilitado.</>

    const rutaLabel = bloqueado && ruta
        ? anticipo.estado === 'En Legalización'
            ? 'La ruta en curso que impide la inhabilitación'
            : 'La ruta asociada a este anticipo'
        : null

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableAutoFocus
            TransitionProps={{ onExited: onExited }}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}
        >
            <DialogContent sx={{ p: 3, pb: (bloqueado) ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: 'auto' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{
                        width: 67, height: 67, borderRadius: '50%',
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {habilitadoActual
                            ? <DoNotDisturbOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                            : <CheckCircleOutlinedIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
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

                {bloqueado && (
                    <Box sx={{ mt: 2.5, textAlign: 'left' }}>
                        {ruta ? (() => {
                            const dot = getRutaEstadoDot(ruta.estado)
                            return (
                                <>
                                    {rutaLabel && (
                                        <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                            {rutaLabel}
                                        </Typography>
                                    )}
                                    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                        <Box
                                            onClick={() => window.open(`/transporte/rutas?highlight=${ruta.idRuta}`, '_blank')}
                                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                        >
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                                {getRutaLabel(ruta)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                {renderDot(dot)}
                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>
                                                    {dot.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </>
                            )
                        })() : (() => {
                            const dot = getAnticipoEstadoDot(anticipo.estado)
                            return (
                                <>
                                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
                                        Estado actual del anticipo
                                    </Typography>
                                    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
                                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                                {nombreConductor}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                {renderDot(dot)}
                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: dot.color, whiteSpace: 'nowrap' }}>
                                                    {dot.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </>
                            )
                        })()}
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ mt: 1, display: 'block' }}>
                            Solo se puede inhabilitar un anticipo cuando esté Completado.
                        </Typography>
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
                            disabled={confirming}
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600,
                                px: 5, py: 0.76, fontSize: '0.875rem',
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': { backgroundColor: theme.palette.primary.dark },
                            }}>
                            {confirming
                                ? <CircularProgress size={18} sx={{ color: 'white' }} />
                                : habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarAnticipo
