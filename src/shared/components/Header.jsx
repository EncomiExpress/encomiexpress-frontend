import { useState } from 'react'
import { Box, Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  PaletteOutlined as PaletteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../contexts/ThemeContext.jsx'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días,'
  if (hour >= 12 && hour < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
}

const Header = ({ collapsed }) => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [anchorEl, setAnchorEl] = useState(null)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()

  return (
    <>
      <Box sx={{
        position: 'fixed',
        top: 4,
        left: collapsed ? 70 : 250,
        right: 0,
        height: 68,
        backgroundColor: darkMode ? '#1E1E1E' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        zIndex: 10,
        transition: 'left 0.3s ease',
      }}>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
          <Typography 
            sx={{ 
              fontSize: '1.4rem', 
              color: darkMode ? '#A0A0A0' : '#483c3a', 
              fontWeight: 500,
              fontFamily: 'Cambria !important',
              lineHeight: 1,
            }}
          >
            {greeting}
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', color: darkMode ? '#FFFFFF' : '#212121', fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important'}}>
            {usuario?.nombre || 'Usuario'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          <Box
            onClick={toggleDarkMode}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(79,195,247,0.1)' : 'rgba(26,46,110,0.05)',
                '& svg': { color: darkMode ? '#4FC3F7' : '#483c3a' },
              },
            }}
          >
            {darkMode
              ? <SunIcon sx={{ fontSize: '1.3rem', color: '#4FC3F7', transition: 'color 0.18s ease' }} />
              : <MoonIcon sx={{ fontSize: '1.3rem', color: '#8b8382', transition: 'color 0.18s ease' }} />
            }
          </Box>

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
                backgroundColor: darkMode ? 'rgba(79,195,247,0.1)' : 'rgba(26,46,110,0.05)',
                '& svg': { color: darkMode ? '#4FC3F7' : '#483c3a' },
              },
            }}
          >
            <PaletteIcon sx={{ fontSize: '1.3rem', color: darkMode ? '#A0A0A0' : '#8b8382', transition: 'color 0.18s ease' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 33, height: 33, fontSize: '0.73rem', fontWeight: 700,
                bgcolor: '#CC1818', color: '#ffffff', cursor: 'pointer',
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
                    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(26,46,110,0.14)',
                    borderRadius: '12px',
                    border: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.1)'}`,
                    px: 0.5, py: 0.5,
                    backgroundColor: darkMode ? '#1E1E1E' : '#ffffff',
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

        <Dialog
          open={openLogoutDialog}
          onClose={() => setOpenLogoutDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', color: darkMode ? '#FFFFFF' : '#212121' }}>
            ¿Cerrar sesión?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.45)', fontSize: '0.88rem' }}>
              Estás a punto de salir del sistema. ¿Estás seguro de que deseas cerrar sesión?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
            <Button
              onClick={() => setOpenLogoutDialog(false)}
              disableRipple
              sx={{
                textTransform: 'none', color: darkMode ? '#A0A0A0' : '#8A94A6', fontWeight: 500, borderRadius: 1.5,
                '&:hover': { backgroundColor: darkMode ? '#2A2A2A' : '#F8F9FA', color: darkMode ? '#FFFFFF' : '#1a0e0c' },
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
                backgroundColor: '#CC1818',
                boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
                '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
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