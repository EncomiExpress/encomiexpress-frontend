import { useNavigate } from 'react-router-dom'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Box, Typography
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useAuth } from '../contexts/AuthContext'

export default function SessionExpiredDialog() {
  const { sessionExpired, usuario, logout } = useAuth()
  const navigate = useNavigate()

  // Solo mostrar si la sesión expiró mientras el usuario estaba activo (no en el arranque)
  if (!sessionExpired || !usuario) return null

  const handleLogin = () => {
    logout()
    navigate('/login')
  }

  return (
    <Dialog
      open
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LockOutlinedIcon color="warning" sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Sesión expirada
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Ha pasado mucho tiempo desde tu última actividad y tu sesión se cerró automáticamente.
          Inicia sesión de nuevo para seguir usando el sistema.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          onClick={handleLogin}
          fullWidth
          size="large"
        >
          Iniciar sesión
        </Button>
      </DialogActions>
    </Dialog>
  )
}
