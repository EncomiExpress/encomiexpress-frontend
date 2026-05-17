import { useState } from 'react'
import { Box, Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  PaletteOutlined as PaletteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import theme from '../styles/theme.js'

//────────────────────────────────────────────────
const C = {
  red: theme.palette.primary.main,
  navy: theme.palette.secondary.main,
  white: '#ffffff',
  textMuted: 'rgba(33,33,33,0.45)',
  textBase: theme.palette.text.dark,
  textIcon: '#8b8382',
  textIconHover: '#483c3a',
  bg: '#f5f5f5',
  border: 'rgba(26,46,110,0.1)',
  divider: 'rgba(26,46,110,0.08)',
  hoverBg: 'rgba(26,46,110,0.05)',
}

// Función para obtener saludo según la hora
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días,'
  if (hour >= 12 && hour < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
}

const Header = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()

  return (
    <>
      <Box sx={{
      position: 'fixed',
      top: 4, // Debajo de la barra roja
      left: 250,
      right: 0,
      height: 68,
      backgroundColor: C.white,
      borderBottom: `1px solid ${C.divider}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      zIndex: 10,
    }}>
      
      {/* Saludo - izquierda */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
        <Typography 
          sx={{ 
            fontSize: '1.4rem', 
            color: C.textIconHover, 
            fontWeight: 500,
            fontFamily: 'Cambria !important',
            lineHeight: 1,
          }}
        >
          {greeting}
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', color: C.textBase, fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important'}}>
          {usuario?.nombre || 'Usuario'}
        </Typography>
      </Box>

      {/* Iconos y perfil - derecha */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        
        {/* Luna - modo oscuro */}
        <Box
          onClick={() => setDarkMode(p => !p)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: C.hoverBg,
              '& svg': { color: C.textIconHover },
            },
          }}
        >
          {darkMode
            ? <MoonIcon sx={{ fontSize: '1.3rem', color: C.navy, transition: 'color 0.18s ease' }} />
            : <MoonIcon sx={{ fontSize: '1.3rem', color: C.textIcon, transition: 'color 0.18s ease' }} />
          }
        </Box>

        {/* Paleta - selector de colores */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: C.hoverBg,
              '& svg': { color: C.textIconHover },
            },
          }}
        >
          <PaletteIcon sx={{ fontSize: '1.3rem', color: C.textIcon, transition: 'color 0.18s ease' }} />
        </Box>

        {/* Perfil con dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
          <Avatar
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 33, height: 33, fontSize: '0.73rem', fontWeight: 700,
              bgcolor: theme.palette.primary.main, color: '#ffffff', cursor: 'pointer',
            }}
          >
            {usuario?.nombre?.trim()
              ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
              : 'U'}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.5,
                  minWidth: 180,
                  boxShadow: '0 8px 32px rgba(26,46,110,0.14)',
                  borderRadius: '12px',
                  border: `1px solid ${C.border}`,
                  px: 0.5, py: 0.5,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => { setOpenLogoutDialog(true); setAnchorEl(null); }}
              sx={{
                borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1,
                '&:hover': { backgroundColor: 'rgba(204,24,24,0.08)' },
              }}
            >
              <LogoutIcon sx={{ fontSize: '1.1rem', color: 'rgba(204,24,24,0.8)' }} />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>

      </Box>

      {/* Dialog de confirmación de cierre de sesión */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', color: C.textBase }}>
          ¿Cerrar sesión?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: C.textMuted, fontSize: '0.88rem' }}>
            Estás a punto de salir del sistema. ¿Estás seguro de que deseas cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 1.5,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => { logout(); navigate('/'); setOpenLogoutDialog(false) }}
            variant="contained"
            disableRipple
            sx={{
              textTransform: 'none', borderRadius: 1.5, fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
            }}
          >
            Sí, cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  )
}

export default Header
