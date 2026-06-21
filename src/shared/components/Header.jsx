import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Avatar, Menu, MenuItem, Divider, Popover, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  PaletteOutlined as PaletteIcon,
  LockResetOutlined as LockResetIcon,
  Logout as LogoutIcon,
  CheckRounded as CheckIcon,
  VisibilityOutlined as EyeIcon,
  VisibilityOffOutlined as EyeOffIcon,
  Close,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { fetchWithAuth } from '../services/authService'
import { API_URL } from '../config/api.js'
import LogoutConfirmDialog from './LogoutConfirmDialog.jsx'

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

  const [anchorEl,          setAnchorEl]          = useState(null)
  const [paletteAnchor,     setPaletteAnchor]     = useState(null)
  const [openLogoutDialog,  setOpenLogoutDialog]  = useState(false)

  // Estados para cambio de contraseña
  const [openCambiarDialog, setOpenCambiarDialog] = useState(false)
  const [passwordActual,    setPasswordActual]    = useState('')
  const [passwordNueva,     setPasswordNueva]     = useState('')
  const [passwordConfirm,   setPasswordConfirm]   = useState('')
  const [showActual,        setShowActual]        = useState(false)
  const [showNueva,         setShowNueva]         = useState(false)
  const [showConfirm,       setShowConfirm]       = useState(false)
  const [cambiarLoading,    setCambiarLoading]    = useState(false)
  const [cambiarMensaje,    setCambiarMensaje]    = useState(null) // { tipo: 'success'|'error', texto: '' }

  const { usuario, logout, token } = useAuth()
  const navigate  = useNavigate()
  const greeting  = getGreeting()

  const currentMode = darkMode ? 'dark' : 'light'

  // colores del panel según modo
  const panelBg     = darkMode ? '#1E1E1E' : '#ffffff'
  const panelBorder = darkMode ? '#444444' : 'rgba(26,46,110,0.1)'
  const labelColor  = darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.5)'
  const optionHover = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const activeOptionBg     = pal.primary.activeBg
  const activeOptionBorder = pal.primary.main

  const handleAbrirCambiar = () => {
    setAnchorEl(null)
    setPasswordActual('')
    setPasswordNueva('')
    setPasswordConfirm('')
    setCambiarMensaje(null)
    setOpenCambiarDialog(true)
  }

  const handleCambiarPassword = async () => {
  if (passwordNueva !== passwordConfirm) {
    setCambiarMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' })
    return
  }
  if (passwordNueva.length < 6) {
    setCambiarMensaje({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' })
    return
  }
  setCambiarLoading(true)
  setCambiarMensaje(null)
  try {
    const response = await fetch(`${API_URL}/auth/cambiar-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ← token del contexto, no de localStorage
      },
      body: JSON.stringify({ passwordActual, passwordNueva })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Error al cambiar la contraseña')
    setCambiarMensaje({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' })
    setPasswordActual('')
    setPasswordNueva('')
    setPasswordConfirm('')
  } catch (error) {
    setCambiarMensaje({ tipo: 'error', texto: error.message || 'No se pudo actualizar la contraseña.' })
  } finally {
    setCambiarLoading(false)
  }
}

  const campoPassword = (label, value, setter, show, setShow) => ({
    label,
    type: show ? 'text' : 'password',
    fullWidth: true,
    size: 'small',
    value,
    onChange: (e) => setter(e.target.value),
    disabled: cambiarLoading,
    InputProps: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton size="small" onClick={() => setShow(p => !p)} edge="end">
            {show ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  })

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
                backgroundColor: pal.primary.activeBg,
                '& svg': { color: pal.primary.main },
              },
            }}
          >
            {darkMode
              ? <SunIcon  sx={{ fontSize: '1.3rem', color: pal.primary.main, transition: 'color 0.18s ease' }} />
              : <MoonIcon sx={{ fontSize: '1.3rem', color: '#8b8382',      transition: 'color 0.18s ease' }} />
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

          {/* Avatar + menu */}
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
              {/* Cambiar contraseña */}
              <MenuItem
                onClick={handleAbrirCambiar}
                sx={{
                  borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1,
                  '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,46,110,0.06)' },
                }}
              >
                <LockResetIcon sx={{ fontSize: '1.1rem', color: pal.secondary.main }} />
                Cambiar contraseña
              </MenuItem>

              <Divider sx={{ my: 0.5, borderColor: panelBorder }} />

              {/* Cerrar sesión */}
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
            <IconButton onClick={() => setPaletteAnchor(null)} sx={{ position: 'absolute', top: 11, right: 8, color: theme.palette.text.secondary }}>
              <Close sx={{ fontSize: '1.3rem' }}/>
            </IconButton>
            <Box sx={{ p: 2.5, pt: 2.5 }}>

            {/* Encabezado */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.96rem', color: darkMode ? '#fff' : '#0f172a', mb: 0.5 }}>
              Personalizar
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: labelColor, mb: 2.5 }}>
              Tema y color del panel
            </Typography>

            {/* ── Sección: Tema ── */}
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2 }}>
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
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2 }}>
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

        {/* ── Dialog cambiar contraseña ── */}
        <Dialog open={openCambiarDialog} onClose={() => !cambiarLoading && setOpenCambiarDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', color: darkMode ? '#FFFFFF' : '#212121' }}>
            Cambiar contraseña
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
            <DialogContentText sx={{ color: darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.45)', fontSize: '0.88rem' }}>
              Ingresa tu contraseña actual y la nueva contraseña.
            </DialogContentText>
            <TextField {...campoPassword('Contraseña actual', passwordActual, setPasswordActual, showActual, setShowActual)} />
            <TextField {...campoPassword('Nueva contraseña', passwordNueva, setPasswordNueva, showNueva, setShowNueva)} />
            <TextField {...campoPassword('Confirmar nueva contraseña', passwordConfirm, setPasswordConfirm, showConfirm, setShowConfirm)} />
            {cambiarMensaje && (
              <Alert severity={cambiarMensaje.tipo} sx={{ fontSize: '0.82rem' }}>
                {cambiarMensaje.texto}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
            <Button
              onClick={() => setOpenCambiarDialog(false)}
              disableRipple
              disabled={cambiarLoading}
              sx={{
                textTransform: 'none', color: darkMode ? '#A0A0A0' : '#8A94A6', fontWeight: 500, borderRadius: 1.5,
                '&:hover': { backgroundColor: darkMode ? '#2A2A2A' : '#F8F9FA', color: darkMode ? '#FFFFFF' : '#1a0e0c' },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarPassword}
              variant="contained"
              disableRipple
              disabled={cambiarLoading || !passwordActual || !passwordNueva || !passwordConfirm}
              sx={{
                textTransform: 'none', borderRadius: 1.5, fontWeight: 600, minWidth: 100,
                backgroundColor: pal.secondary.main,
                boxShadow: `0 4px 14px rgba(26,46,110,0.2)`,
                '&:hover': { backgroundColor: pal.secondary.dark, boxShadow: `0 6px 20px rgba(26,46,110,0.2)` },
              }}
            >
              {cambiarLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Dialog logout ── */}
        <LogoutConfirmDialog
          open={openLogoutDialog}
          onClose={() => setOpenLogoutDialog(false)}
          onConfirm={() => { logout(); navigate('/'); setOpenLogoutDialog(false) }}
        />

      </Box>
    </>
  )
}

export default Header