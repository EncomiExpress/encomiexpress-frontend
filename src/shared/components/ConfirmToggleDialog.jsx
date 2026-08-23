import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Dialog, DialogContent, Box, Typography, Button, CircularProgress, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// Cascarón visual compartido por los diálogos "¿Inhabilitar/Habilitar X?" de cada
// feature (clientes, conductores, vehiculos, rutas, ventas, anticipos, destinos,
// propietarios, roles, usuarios). Cada feature conserva su propia lógica de
// bloqueo y su propio contenido de dependencias (tablas, avisos) vía `children`;
// este componente solo centraliza el Dialog, el ícono, el título/subtítulo y los
// botones de acción, que eran idénticos byte a byte en los 10 archivos originales.
const ConfirmToggleDialog = ({
    open,
    onClose,
    onExited,
    onConfirm,
    icono,
    titulo,
    subtitulo,
    soloCerrar = false,
    textoConfirmar = 'Confirmar',
    deshabilitarConfirmar = false,
    children,
}) => {
    const theme = useTheme()
    const [confirming, setConfirming] = useState(false)

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onClose()
        } catch {
            // error manejado por el padre
        } finally {
            setConfirming(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableAutoFocus
            TransitionProps={{ onExited }}
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '85vh', overflow: 'hidden' } } }}
        >
            <DialogContent sx={{ p: 3, pb: children ? 1 : 2, textAlign: 'center', position: 'relative', overflowY: 'auto' }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{
                        width: 67, height: 67, borderRadius: '50%',
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {icono}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            {titulo}
                        </Typography>
                        <Typography fontSize="0.95rem" color={theme.palette.text.secondary} sx={{ textAlign: 'center' }}>
                            {subtitulo}
                        </Typography>
                    </Box>
                </Box>

                {children}
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                {soloCerrar ? (
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
                            disabled={confirming || deshabilitarConfirmar}
                            sx={{
                                textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 140,
                                px: 5, py: 0.76, fontSize: '0.875rem',
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': { backgroundColor: theme.palette.primary.dark },
                            }}>
                            {(confirming || deshabilitarConfirmar)
                                ? <CircularProgress size={18} sx={{ color: 'white' }} />
                                : textoConfirmar}
                        </Button>
                    </>
                )}
            </Box>
        </Dialog>
    )
}

export default ConfirmToggleDialog
