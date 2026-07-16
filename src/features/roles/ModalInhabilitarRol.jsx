import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Button, Dialog, DialogContent, IconButton, CircularProgress } from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../../shared/contexts/AuthContext.jsx'

const ModalInhabilitarRol = ({ open, data, onClose, onExited, onConfirm }) => {
    const theme = useTheme()
    const { usuario: usuarioActual } = useAuth()
    const [confirming, setConfirming] = useState(false)

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

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onExited }} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogContent sx={{ p: 3, pb: 2, textAlign: 'center', position: 'relative' }}>
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
                            {data.habilitadoActual ? '¿Inhabilitar rol?' : '¿Habilitar rol?'}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary}>
                            {data.habilitadoActual
                                ? data.rolNombre === usuarioActual?.rol?.nombre
                                    ? <>Se inhabilitarán <strong>todos los usuarios</strong> de este rol, excepto tu cuenta activa. No podrán iniciar sesión.</>
                                    : <>Se inhabilitarán <strong>todos los usuarios</strong> de este rol. No podrán iniciar sesión.</>
                                : <>Se habilitarán <strong>todos los usuarios</strong> de este rol. Volverán a tener acceso.</>
                            }
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                <Button onClick={onClose} disableRipple
                    sx={{ textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`, '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary } }}>
                    Cancelar
                </Button>
                <Button onClick={handleConfirm} disabled={confirming} variant="contained" disableRipple
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140, px: 5, py: 0.76, fontSize: '0.875rem', backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                    {confirming ? <CircularProgress size={18} sx={{ color: 'white' }} /> : data.habilitadoActual ? 'Inhabilitar' : 'Habilitar'}
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalInhabilitarRol
