import { Dialog, DialogContent, IconButton, Button, Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Logout as LogoutIcon, Close } from '@mui/icons-material'

const LogoutConfirmDialog = ({ open, onClose, onConfirm }) => {
  const theme = useTheme()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>

      <DialogContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 2 }}>
          <Box sx={{ width: 67, height: 67, borderRadius: 2, backgroundColor: theme.palette.primary.main + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoutIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography fontWeight={700} fontSize="1.4rem" color={theme.palette.text.primary}>
              Cerrar sesión
            </Typography>
            <Typography fontSize={"1rem"} color={theme.palette.text.secondary}>
              ¿Estás seguro? Saldrás del sistema.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 3, px: 3, pt: 1, pb: 3
      }}>
        <Button onClick={onClose} disableRipple
          sx={{
            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2, px: 3.5, py: 0.75, fontSize: '0.875rem', border: `1px solid ${theme.palette.divider}`,
            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary, },
          }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" disableRipple
          sx={{
            textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 5, py: 0.76, fontSize: '0.875rem',
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}>
          Salir
        </Button>
      </Box>
    </Dialog>
  )
}

export default LogoutConfirmDialog