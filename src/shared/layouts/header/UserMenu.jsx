import { Box, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import { LockResetOutlined as LockResetIcon, Logout as LogoutIcon } from '@mui/icons-material'

const UserMenu = ({
  usuario, pal, darkMode, panelBg, panelBorder,
  anchorEl, onOpen, onClose, onCambiarPassword, onLogoutClick,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
      <Avatar
        onClick={onOpen}
        sx={{ width: 33, height: 33, fontSize: '0.73rem', fontWeight: 700, bgcolor: pal.primary.main, color: '#ffffff', cursor: 'pointer' }}
      >
        {usuario?.nombre?.trim()
          ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
          : 'U'}
      </Avatar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5, minWidth: 200,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,46,110,0.14)',
              borderRadius: '12px',
              border: `1px solid ${panelBorder}`,
              px: 0.5, py: 0.5,
              backgroundColor: panelBg,
            },
          },
        }}
      >
        <MenuItem
          onClick={onCambiarPassword}
          sx={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1, '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,46,110,0.06)' } }}
        >
          <LockResetIcon sx={{ fontSize: '1.1rem', color: pal.primary.main }} />
          Cambiar contraseña
        </MenuItem>

        <Divider sx={{ my: 0.5, borderColor: panelBorder }} />

        <MenuItem
          onClick={onLogoutClick}
          sx={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1, '&:hover': { backgroundColor: pal.primary.activeBg } }}
        >
          <LogoutIcon sx={{ fontSize: '1.1rem', color: pal.primary.main, opacity: 0.8 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default UserMenu
