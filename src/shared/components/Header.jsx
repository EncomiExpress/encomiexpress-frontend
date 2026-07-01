import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Avatar, Menu, MenuItem, Divider, Popover, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  LockResetOutlined as LockResetIcon,
  Logout as LogoutIcon,
  CheckRounded as CheckIcon,
  VisibilityOutlined as EyeIcon,
  VisibilityOffOutlined as EyeOffIcon,
  Close,
  ViewSidebarOutlined as SidebarIcon,
  ViewStreamOutlined as TopNavIcon,
} from '@mui/icons-material'
import logo from '../../assets/logo.png'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { API_URL } from '../config/api.js'
import LogoutConfirmDialog from './LogoutConfirmDialog.jsx'
import useDateTime from '../hooks/useDateTime.js'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días,'
  if (hour >= 12 && hour < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
}

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro',  icon: SunIcon  },
  { key: 'dark',  label: 'Oscuro', icon: MoonIcon },
]

const COLOR_OPTIONS = [
  { key: 'red',  label: 'Rojo', color: '#CC1818' },
  { key: 'blue', label: 'Azul', color: '#1A2E6E' },
]

const NAV_OPTIONS = [
  { key: 'sidebar', label: 'Sidebar', icon: SidebarIcon },
  { key: 'topnav',  label: 'Top Nav', icon: TopNavIcon  },
]

// ─── PaletaAnimada ───────────────────────────────────────────────────────────

const PUNTOS_PALETA = [
  { cx: 6.5,  cy: 10.5 },
  { cx: 9.5,  cy: 6.5  },
  { cx: 14.5, cy: 6.5  },
  { cx: 17.5, cy: 10.5 },
]
const PASO_ANIM = 90
const TRANS_ANIM = 120

const PaletaAnimada = ({ isOpen, onClick, pal, darkMode }) => {
  const [ocultos, setOcultos] = useState([false, false, false, false])
  const animandoRef = useRef(false)
  const timersRef   = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const schedule = (fn, delay) => { timersRef.current.push(setTimeout(fn, delay)) }

  const handleEntrar = () => {
    if (animandoRef.current) return
    animandoRef.current = true

    schedule(() => setOcultos([false, false, false, true]), 0)
    schedule(() => setOcultos([false, false, true,  true]), PASO_ANIM)
    schedule(() => setOcultos([false, true,  true,  true]), PASO_ANIM * 2)
    schedule(() => setOcultos([true,  true,  true,  true]), PASO_ANIM * 3)

    const INICIO = PASO_ANIM * 3 + TRANS_ANIM + 60

    schedule(() => setOcultos([false, true,  true,  true]),  INICIO)
    schedule(() => setOcultos([false, false, true,  true]),  INICIO + PASO_ANIM)
    schedule(() => setOcultos([false, false, false, true]),  INICIO + PASO_ANIM * 2)
    schedule(() => setOcultos([false, false, false, false]), INICIO + PASO_ANIM * 3)

    schedule(() => { animandoRef.current = false; timersRef.current = [] }, INICIO + PASO_ANIM * 3 + TRANS_ANIM + 80)
  }

  const iconColor = isOpen ? pal.primary.main : (darkMode ? '#A0A0A0' : '#8b8382')

  return (
    <Box
      onClick={onClick}
      onMouseEnter={handleEntrar}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 1, borderRadius: '10px', cursor: 'pointer', transition: 'background-color 0.18s ease',
        backgroundColor: isOpen ? pal.primary.activeBg : 'transparent',
        '&:hover': { backgroundColor: pal.primary.activeBg },
      }}
    >
      <svg width="1.3rem" height="1.3rem" viewBox="0 0 24 24" style={{ display: 'block' }}>
        <path
          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'stroke 0.18s ease' }}
        />
        {PUNTOS_PALETA.map(({ cx, cy }, i) => (
          <circle
            key={i} cx={cx} cy={cy} r="1.5"
            fill={iconColor}
            style={{
              transition: `opacity ${TRANS_ANIM}ms ease, transform ${TRANS_ANIM}ms ease, fill 0.18s ease`,
              opacity:   ocultos[i] ? 0 : 1,
              transform: ocultos[i] ? 'scale(0)' : 'scale(1)',
              transformBox:    'fill-box',
              transformOrigin: 'center',
            }}
          />
        ))}
      </svg>
    </Box>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

const Header = ({ collapsed }) => {
  const { darkMode, toggleDarkMode, paletteKey, togglePalette, navLayout, setNavLayout } = useDarkMode()
  const theme = useTheme()
  const pal   = theme.palette

  const [anchorEl,         setAnchorEl]         = useState(null)
  const [paletteAnchor,    setPaletteAnchor]    = useState(null)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

  const [openCambiarDialog, setOpenCambiarDialog] = useState(false)
  const [passwordActual,    setPasswordActual]    = useState('')
  const [passwordNueva,     setPasswordNueva]     = useState('')
  const [passwordConfirm,   setPasswordConfirm]   = useState('')
  const [showActual,        setShowActual]        = useState(false)
  const [showNueva,         setShowNueva]         = useState(false)
  const [showConfirm,       setShowConfirm]       = useState(false)
  const [cambiarLoading,    setCambiarLoading]    = useState(false)
  const [cambiarMensaje,    setCambiarMensaje]    = useState(null)

  const { usuario, logout, token } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()
  const dateTime = useDateTime()

  const currentMode = darkMode ? 'dark' : 'light'

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        left: navLayout === 'topnav' ? 0 : (collapsed ? 70 : 250),
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

        {/* ── Izquierda ── */}
        {navLayout === 'topnav' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="img" src={logo} alt="EncomiExpress"
              sx={{ height: 38, width: 'auto', objectFit: 'contain', userSelect: 'none' }} />
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
              <Typography sx={{ fontSize: '1.2rem', color: darkMode ? '#A0A0A0' : '#483c3a', fontWeight: 500, fontFamily: 'Cambria !important', lineHeight: 1 }}>
                {greeting}
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', color: darkMode ? '#FFFFFF' : '#212121', fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important' }}>
                {usuario?.nombre || 'Usuario'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
              <Typography sx={{ fontSize: '1.4rem', color: darkMode ? '#A0A0A0' : '#483c3a', fontWeight: 500, fontFamily: 'Cambria !important', lineHeight: 1 }}>
                {greeting}
              </Typography>
              <Typography sx={{ fontSize: '1.3rem', color: darkMode ? '#FFFFFF' : '#212121', fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important' }}>
                {usuario?.nombre || 'Usuario'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: darkMode ? '#666' : 'rgba(33,33,33,0.38)', fontWeight: 400, letterSpacing: '0.01em' }}>
              {dateTime}
            </Typography>
          </Box>
        )}

        {/* ── Acciones ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            onClick={toggleDarkMode}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              p: 1, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.18s ease',
              '&:hover': { backgroundColor: pal.primary.activeBg, '& svg': { color: pal.primary.main } },
            }}
          >
            {darkMode
              ? <SunIcon  sx={{ fontSize: '1.3rem', color: pal.primary.main, transition: 'color 0.18s ease' }} />
              : <MoonIcon sx={{ fontSize: '1.3rem', color: '#8b8382',        transition: 'color 0.18s ease' }} />
            }
          </Box>

          <PaletaAnimada isOpen={Boolean(paletteAnchor)} onClick={(e) => setPaletteAnchor(e.currentTarget)} pal={pal} darkMode={darkMode} />

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
              <MenuItem
                onClick={handleAbrirCambiar}
                sx={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1, '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,46,110,0.06)' } }}
              >
                <LockResetIcon sx={{ fontSize: '1.1rem', color: pal.secondary.main }} />
                Cambiar contraseña
              </MenuItem>

              <Divider sx={{ my: 0.5, borderColor: panelBorder }} />

              <MenuItem
                onClick={() => { setOpenLogoutDialog(true); setAnchorEl(null) }}
                sx={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, gap: 1.5, py: 1, '&:hover': { backgroundColor: pal.primary.activeBg } }}
              >
                <LogoutIcon sx={{ fontSize: '1.1rem', color: pal.primary.main, opacity: 0.8 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* ── Popover personalización ── */}
        <Popover
          open={Boolean(paletteAnchor)}
          anchorEl={paletteAnchor}
          onClose={() => setPaletteAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1, width: 260, borderRadius: '16px',
                border: `1px solid ${panelBorder}`,
                boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(26,46,110,0.14)',
                backgroundColor: panelBg, overflow: 'hidden',
              },
            },
          }}
        >
          <IconButton onClick={() => setPaletteAnchor(null)} sx={{ position: 'absolute', top: 11, right: 8, color: theme.palette.text.secondary }}>
            <Close sx={{ fontSize: '1.3rem' }} />
          </IconButton>
          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.96rem', color: darkMode ? '#fff' : '#0f172a', mb: 0.5 }}>
              Personalizar
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: labelColor, mb: 2.5 }}>
              Apariencia y navegación
            </Typography>

            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2 }}>Tema</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
              {THEME_OPTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = currentMode === key
                return (
                  <Box key={key} onClick={() => { if (!isActive) toggleDarkMode() }}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.5, borderRadius: '12px', cursor: isActive ? 'default' : 'pointer', border: `1.5px solid ${isActive ? activeOptionBorder : panelBorder}`, backgroundColor: isActive ? activeOptionBg : 'transparent', transition: 'all 0.18s ease', '&:hover': !isActive ? { backgroundColor: optionHover, borderColor: panelBorder } : {} }}
                  >
                    <Icon sx={{ fontSize: '1.2rem', color: isActive ? pal.primary.main : labelColor }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? pal.primary.main : (darkMode ? '#ccc' : '#374151') }}>{label}</Typography>
                  </Box>
                )
              })}
            </Box>

            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2 }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
              {COLOR_OPTIONS.map(({ key, label, color }) => {
                const isActive = paletteKey === key
                return (
                  <Box key={key} onClick={() => { if (!isActive) togglePalette(key) }}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.5, borderRadius: '12px', cursor: isActive ? 'default' : 'pointer', border: `1.5px solid ${isActive ? color : panelBorder}`, backgroundColor: isActive ? `${color}12` : 'transparent', transition: 'all 0.18s ease', '&:hover': !isActive ? { backgroundColor: optionHover } : {} }}
                  >
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive && <CheckIcon sx={{ fontSize: '0.85rem', color: '#fff' }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? color : (darkMode ? '#ccc' : '#374151') }}>{label}</Typography>
                  </Box>
                )
              })}
            </Box>

            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: labelColor, mb: 1.2 }}>Navegación</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {NAV_OPTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = navLayout === key
                return (
                  <Box key={key} onClick={() => setNavLayout(key)}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, py: 1.5, borderRadius: '12px', cursor: isActive ? 'default' : 'pointer', border: `1.5px solid ${isActive ? activeOptionBorder : panelBorder}`, backgroundColor: isActive ? activeOptionBg : 'transparent', transition: 'all 0.18s ease', '&:hover': !isActive ? { backgroundColor: optionHover, borderColor: panelBorder } : {} }}
                  >
                    <Icon sx={{ fontSize: '1.2rem', color: isActive ? pal.primary.main : labelColor }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? pal.primary.main : (darkMode ? '#ccc' : '#374151') }}>{label}</Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Popover>

        {/* ── Dialog cambiar contraseña ── */}
        <Dialog
          open={openCambiarDialog}
          onClose={() => !cambiarLoading && setOpenCambiarDialog(false)}
          maxWidth="xs" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.15)',
              border: `1px solid ${panelBorder}`,
              backgroundColor: panelBg,
            }
          }}
        >
          {/* Cabecera con ícono */}
          <Box sx={{
            px: 3, pt: 3, pb: 2,
            display: 'flex', alignItems: 'center', gap: 2,
            borderBottom: `1px solid ${panelBorder}`,
          }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '12px',
              backgroundColor: pal.secondary.main + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LockResetIcon sx={{ fontSize: '1.4rem', color: pal.secondary.main }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: darkMode ? '#FFFFFF' : '#212121', lineHeight: 1.2 }}>
                Cambiar contraseña
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.5)', mt: 0.3 }}>
                Ingresa tu contraseña actual y la nueva
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ px: 3, pt: 2.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField {...campoPassword('Contraseña actual',          passwordActual,  setPasswordActual,  showActual,  setShowActual)} />
            <TextField {...campoPassword('Nueva contraseña',           passwordNueva,   setPasswordNueva,   showNueva,   setShowNueva)} />
            <TextField {...campoPassword('Confirmar nueva contraseña', passwordConfirm, setPasswordConfirm, showConfirm, setShowConfirm)} />
            {cambiarMensaje && (
              <Alert severity={cambiarMensaje.tipo} sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                {cambiarMensaje.texto}
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
            <Button
              onClick={() => setOpenCambiarDialog(false)}
              disableRipple disabled={cambiarLoading}
              sx={{
                textTransform: 'none', fontWeight: 500, borderRadius: 2,
                color: darkMode ? '#A0A0A0' : '#8A94A6',
                border: `1px solid ${panelBorder}`, px: 2.5,
                '&:hover': { backgroundColor: darkMode ? '#2A2A2A' : '#F8F9FA', color: darkMode ? '#FFFFFF' : '#1a0e0c' },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarPassword}
              variant="contained" disableRipple
              disabled={cambiarLoading || !passwordActual || !passwordNueva || !passwordConfirm}
              sx={{
                textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 110, px: 2.5,
                backgroundColor: pal.secondary.main,
                boxShadow: `0 4px 14px ${pal.secondary.main}4D`,
                '&:hover': { backgroundColor: pal.secondary.dark, boxShadow: `0 6px 20px ${pal.secondary.main}66` },
              }}
            >
              {cambiarLoading
                ? <><CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} /> Guardando...</>
                : 'Guardar cambios'
              }
            </Button>
          </DialogActions>

          {/* Barra degradada inferior */}
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