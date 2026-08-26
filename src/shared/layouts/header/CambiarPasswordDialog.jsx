import { useTheme } from '@mui/material/styles'
import { Dialog, DialogContent, Box, Typography, TextField, Alert, Button, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import {
  LockResetOutlined as LockResetIcon,
  LockOutlined as LockIcon,
  VisibilityOutlined as EyeIcon,
  VisibilityOffOutlined as EyeOffIcon,
  Close,
} from '@mui/icons-material'
import { formFieldStyles } from '../../utils/formStyles.js'
import useCambiarPassword, { PASSWORD_HELP } from './useCambiarPassword.js'

const CambiarPasswordDialog = ({ open, onClose, token }) => {
  const theme = useTheme()
  const {
    passwordActual, passwordNueva, passwordConfirm,
    showActual, showNueva, showConfirm,
    setShowActual, setShowNueva, setShowConfirm,
    cambiarLoading, cambiarMensaje, erroresCambiar,
    onChangeActual, onChangeNueva, onChangeConfirm,
    submit,
  } = useCambiarPassword(token, open)

  const campoPassword = (label, value, onChange, show, setShow, errorKey, helperText) => ({
    label,
    type: show ? 'text' : 'password',
    fullWidth: true,
    value,
    onChange: (e) => onChange(e.target.value),
    disabled: cambiarLoading,
    error: errorKey ? !!erroresCambiar[errorKey] : undefined,
    helperText: errorKey ? (erroresCambiar[errorKey] || helperText) : undefined,
    sx: formFieldStyles,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <LockIcon sx={{ color: theme.palette.text.secondary }} />
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <IconButton size="small" onClick={() => setShow(p => !p)} edge="end">
            {show ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  })

  const handleClose = () => { if (!cambiarLoading) onClose() }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogContent sx={{ p: 3, pb: 1, textAlign: 'center', position: 'relative' }}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
          <Box sx={{ width: 67, height: 67, borderRadius: 2, backgroundColor: theme.palette.primary.main + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockResetIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
              Cambiar contraseña
            </Typography>
            <Typography fontSize="1rem" color={theme.palette.text.secondary} sx={{ textAlign: 'center' }}>
              Ingresa tu contraseña actual y la nueva
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3, textAlign: 'left' }}>
          <TextField {...campoPassword('Contraseña actual', passwordActual, onChangeActual, showActual, setShowActual)} />
          <TextField {...campoPassword('Nueva contraseña', passwordNueva, onChangeNueva, showNueva, setShowNueva, 'nueva', PASSWORD_HELP)} />
          <TextField {...campoPassword('Confirmar nueva contraseña', passwordConfirm, onChangeConfirm, showConfirm, setShowConfirm, 'confirm')} />
          {cambiarMensaje && (
            <Alert severity={cambiarMensaje.tipo} sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
              {cambiarMensaje.texto}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, px: 3, pt: 1, pb: 3 }}>
        <Button
          onClick={onClose}
          disableRipple disabled={cambiarLoading}
          sx={{
            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
            px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`,
            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={submit}
          variant="contained" disableRipple
          disabled={cambiarLoading || !passwordActual || !passwordNueva || !passwordConfirm}
          sx={{
            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 110, px: 5, py: 0.76, fontSize: '0.875rem',
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {cambiarLoading
            ? <><CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} /> Guardando...</>
            : 'Guardar cambios'
          }
        </Button>
      </Box>
    </Dialog>
  )
}

export default CambiarPasswordDialog
