import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Avatar, Menu, MenuItem, Popover, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  PaletteOutlined as PaletteIcon,
  Logout as LogoutIcon,
  CheckRounded as CheckIcon,
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

// ─── Opciones de tema y paleta ───────────────────────────────────────────────

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro',   icon: SunIcon  },
  { key: 'dark',  label: 'Oscuro',  icon: MoonIcon },
]

const COLOR_OPTIONS = [
  { key: 'red',  label: 'Rojo', color: '#CC1818' },
  { key: 'blue', label: 'Azul', color: '#1A2E6E' },
]

// ─── Header ──────────────────────────────────────────────────────────────────

const Header = ({ collapsed }) => {
  const { darkMode, toggleDarkMode, paletteKey, togglePalette } = useDarkMode()
  const theme = useTheme()
  const pal   = theme.palette

  const [anchorEl,        setAnchorEl]        = useState(null)  // avatar menu
  const [paletteAnchor,   setPaletteAnchor]   = useState(null)  // palette popover
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

  const { usuario, logout } = useAuth()
  const navigate  = useNavigate()
  const greeting  = getGreeting()

  const currentMode = darkMode ? 'dark' : 'light'

  // colores del panel según modo
  const panelBg     = darkMode ? '#1E1E1E' : '#ffffff'
  const panelBorder = darkMode ? '#444444' : 'rgba(26,46,110,0.1)'
  const labelColor  = darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.5)'
  const optionHover = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const activeOptionBg   = pal.primary.activeBg
  const activeOptionBorder = pal.primary.main

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

        {/* ── Saludo ── */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
          <Typography sx={{
            fontSize: '1.4rem',
            color: darkMode ? '#A0A0A0' : '#483c3a',
            fontWeight: 500,
            fontFamily: 'Cambria !important',
            lineHeight: 1,
          }}>
            {greeting}
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', color: darkMode ? '#FFFFFF' : '#212121', fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important' }}>
            {usuario?.nombre || 'Usuario'}
          </Typography>
        </Box>

        {/* ── Acciones ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          {/* Toggle dark/light */}
          <Box
            onClick={toggleDarkMode}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              p: 1, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.18s ease',
              '&:hover': {
                backgroundColor: darkMode ? pal.primary.activeBg : 'rgba(26,46,110,0.05)',
                '& svg': { color: darkMode ? pal.primary.main : '#483c3a' },
              },
            }}
          >
            {darkMode
              ? <SunIcon  sx={{ fontSize: '1.3rem', color: pal.primary.main, transition: 'color 0.18s ease' }} />
              : <MoonIcon sx={{ fontSize: '1.3rem', color: '#8b8382',         transition: 'color 0.18s ease' }} />
            }
          </Box>

          {/* Botón paleta */}
          <Box
            onClick={(e) => setPaletteAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              p: 1, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.18s ease',
              backgroundColor: paletteAnchor ? pal.primary.activeBg : 'transparent',
              '&:hover': {
                backgroundColor: pal.primary.activeBg,
                '& svg': { color: pal.primary.main },
              },
            }}
          >
            <PaletteIcon sx={{
              fontSize: '1.3rem',
              color: paletteAnchor ? pal.primary.main : (darkMode ? '#A0A0A0' : '#8b8382'),
              transition: 'color 0.18s ease',
            }} />
          </Box>

          {/* Avatar + menu logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ width: 33, height: 33, fontSize: '0.73rem', fontWeight: 700, bgcolor: pal.primary.main, color: '#ffffff', cursor: 'pointer' }}
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
                    mt: 0.5, minWidth: 180,
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
                onClick={() => { setOpenLogoutDialog(true); setAnchorEl(null) }}
                sx={{
                  borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1,
                  '&:hover': { backgroundColor: pal.primary.activeBg },
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.1rem', color: pal.primary.main, opacity: 0.8 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* ── Popover de personalización ── */}
        <Popover
          open={Boolean(paletteAnchor)}
          anchorEl={paletteAnchor}
          onClose={() => setPaletteAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                width: 260,
                borderRadius: '16px',
                border: `1px solid ${panelBorder}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(26,46,110,0.14)',
                backgroundColor: panelBg,
                overflow: 'hidden',
              },
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>

            {/* Encabezado */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: darkMode ? '#fff' : '#0f172a', mb: 0.5 }}>
              Personalizar
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: labelColor, mb: 2.5 }}>
              Tema y color del panel
            </Typography>

            {/* ── Sección: Tema ── */}
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2, textTransform: 'uppercase' }}>
              Tema
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
              {THEME_OPTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = currentMode === key
                return (
                  <Box
                    key={key}
                    onClick={() => { if (!isActive) toggleDarkMode() }}
                    sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 0.8, py: 1.5, borderRadius: '12px', cursor: isActive ? 'default' : 'pointer',
                      border: `1.5px solid ${isActive ? activeOptionBorder : panelBorder}`,
                      backgroundColor: isActive ? activeOptionBg : 'transparent',
                      transition: 'all 0.18s ease',
                      '&:hover': !isActive ? { backgroundColor: optionHover, borderColor: panelBorder } : {},
                    }}
                  >
                    <Icon sx={{ fontSize: '1.2rem', color: isActive ? pal.primary.main : labelColor }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? pal.primary.main : (darkMode ? '#ccc' : '#374151') }}>
                      {label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>

            {/* ── Sección: Color ── */}
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2, textTransform: 'uppercase' }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {COLOR_OPTIONS.map(({ key, label, color }) => {
                const isActive = paletteKey === key
                return (
                  <Box
                    key={key}
                    onClick={() => { if (!isActive) togglePalette(key) }}
                    sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 0.8, py: 1.5, borderRadius: '12px', cursor: isActive ? 'default' : 'pointer',
                      border: `1.5px solid ${isActive ? color : panelBorder}`,
                      backgroundColor: isActive ? `${color}12` : 'transparent',
                      transition: 'all 0.18s ease',
                      '&:hover': !isActive ? { backgroundColor: optionHover } : {},
                    }}
                  >
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '50%', backgroundColor: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isActive && <CheckIcon sx={{ fontSize: '0.85rem', color: '#fff' }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? color : (darkMode ? '#ccc' : '#374151') }}>
                      {label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>

          </Box>
        </Popover>

        {/* ── Dialog logout ── */}
        <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)} maxWidth="xs" fullWidth>
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
                backgroundColor: pal.primary.main,
                boxShadow: `0 4px 14px ${pal.primary.activeBg}`,
                '&:hover': { backgroundColor: pal.primary.dark, boxShadow: `0 6px 20px ${pal.primary.activeBg}` },
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