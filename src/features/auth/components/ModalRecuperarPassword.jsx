import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton, Dialog, DialogContent, CircularProgress } from '@mui/material'
import { EmailOutlined as Email, LockResetOutlined as LockResetIcon, Close } from '@mui/icons-material'
import { recuperarPassword } from '../../../shared/services/authService.js'
import { formFieldStyles } from '../../../shared/utils/formStyles.js'
import { validarEmailValor } from '../utils/authValidation.js'

const ModalRecuperarPassword = ({ open, onClose }) => {
    const theme = useTheme()
    const [recuperarEmail, setRecuperarEmail] = useState('')
    const [recuperarEmailError, setRecuperarEmailError] = useState('')
    const [recuperarLoading, setRecuperarLoading] = useState(false)
    const [recuperarMensaje, setRecuperarMensaje] = useState(null)

    // Se reinicia cada vez que el diálogo se vuelve a abrir -- antes esto pasaba en el
    // onClick del enlace que lo abría en Login.jsx.
    useEffect(() => {
        if (open) {
            setRecuperarEmail('')
            setRecuperarEmailError('')
            setRecuperarMensaje(null)
        }
    }, [open])

    const handleRecuperar = async () => {
        const errorFormato = validarEmailValor(recuperarEmail)
        if (errorFormato) {
            setRecuperarEmailError(errorFormato)
            return
        }
        setRecuperarLoading(true)
        setRecuperarMensaje(null)
        try {
            const resultado = await recuperarPassword(recuperarEmail)
            setRecuperarMensaje({ tipo: 'success', texto: resultado.message })
        } catch (err) {
            setRecuperarMensaje({ tipo: 'error', texto: err.message || 'No se pudo enviar el correo.' })
        } finally {
            setRecuperarLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => !recuperarLoading && onClose()}
            maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
        >
            <DialogContent sx={{ p: 3, pb: 1, textAlign: 'center', position: 'relative' }}>
                <IconButton
                    onClick={() => !recuperarLoading && onClose()}
                    sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}
                >
                    <Close />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
                    <Box sx={{ width: 67, height: 67, borderRadius: 2, backgroundColor: theme.palette.primary.main + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LockResetIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
                            Recuperar contraseña
                        </Typography>
                        <Typography fontSize="1rem" color={theme.palette.text.secondary} sx={{ textAlign: 'center' }}>
                            Ingresa tu correo registrado
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'left' }}>
                    {recuperarMensaje && (
                        <Alert severity={recuperarMensaje.tipo} sx={{ mb: 2, fontSize: '0.82rem', borderRadius: 2 }}>
                            {recuperarMensaje.texto}
                        </Alert>
                    )}
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        value={recuperarEmail}
                        onChange={(e) => {
                            setRecuperarEmail(e.target.value)
                            setRecuperarEmailError('')
                            setRecuperarMensaje(null)
                        }}
                        onBlur={() => setRecuperarEmailError(validarEmailValor(recuperarEmail))}
                        disabled={recuperarLoading}
                        placeholder="correo@ejemplo.com"
                        error={!!recuperarEmailError}
                        helperText={recuperarEmailError}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email sx={{ color: theme.palette.text.secondary }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={formFieldStyles}
                    />
                </Box>
            </DialogContent>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
                <Button
                    onClick={onClose}
                    disabled={recuperarLoading}
                    disableRipple
                    sx={{
                        textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                        px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleRecuperar}
                    variant="contained"
                    disableRipple
                    disabled={recuperarLoading || !recuperarEmail || !!validarEmailValor(recuperarEmail) || recuperarMensaje?.tipo === 'success'}
                    sx={{
                        textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 110, px: 5, py: 0.76, fontSize: '0.875rem',
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}
                >
                    {recuperarLoading
                        ? <><CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} /> Enviando...</>
                        : recuperarMensaje?.tipo === 'success'
                            ? 'Correo enviado'
                            : 'Enviar enlace'
                    }
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalRecuperarPassword
