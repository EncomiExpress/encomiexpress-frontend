import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { DarkModeOutlined as MoonIcon, LightModeOutlined as SunIcon } from '@mui/icons-material'
import logo from '../../assets/logo.png'
import logoDark from '../../assets/logoDark.png'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import LogoutConfirmDialog from '../components/LogoutConfirmDialog.jsx'
import useDateTime from '../hooks/useDateTime.js'
import PaletaAnimada from './header/PaletaAnimada.jsx'
import HeaderPersonalizationPopover from './header/HeaderPersonalizationPopover.jsx'
import UserMenu from './header/UserMenu.jsx'
import CambiarPasswordDialog from './header/CambiarPasswordDialog.jsx'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días,'
  if (hour >= 12 && hour < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
}

const Header = ({ collapsed }) => {
  const { darkMode, toggleDarkMode, paletteKey, togglePalette, navLayout, setNavLayout } = useDarkMode()
  const theme = useTheme()
  const pal   = theme.palette

  const [anchorEl,          setAnchorEl]          = useState(null)
  const [paletteAnchor,     setPaletteAnchor]     = useState(null)
  const [openLogoutDialog,  setOpenLogoutDialog]  = useState(false)
  const [openCambiarDialog, setOpenCambiarDialog] = useState(false)

  const { usuario, logout, token } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()
  const dateTime = useDateTime()

  const panelBg     = darkMode ? '#1E1E1E' : '#ffffff'
  const panelBorder = darkMode ? '#444444' : 'rgba(26,46,110,0.1)'

  return (
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
          <Box component="img" src={darkMode ? logoDark : logo} alt="EncomiExpress"
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

        <UserMenu
          usuario={usuario}
          pal={pal}
          darkMode={darkMode}
          panelBg={panelBg}
          panelBorder={panelBorder}
          anchorEl={anchorEl}
          onOpen={(e) => setAnchorEl(e.currentTarget)}
          onClose={() => setAnchorEl(null)}
          onCambiarPassword={() => { setAnchorEl(null); setOpenCambiarDialog(true) }}
          onLogoutClick={() => { setOpenLogoutDialog(true); setAnchorEl(null) }}
        />
      </Box>

      <HeaderPersonalizationPopover
        anchorEl={paletteAnchor}
        onClose={() => setPaletteAnchor(null)}
        theme={theme}
        pal={pal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        paletteKey={paletteKey}
        togglePalette={togglePalette}
        navLayout={navLayout}
        setNavLayout={setNavLayout}
      />

      <CambiarPasswordDialog
        open={openCambiarDialog}
        onClose={() => setOpenCambiarDialog(false)}
        token={token}
      />

      <LogoutConfirmDialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        onConfirm={() => { logout(); navigate('/'); setOpenLogoutDialog(false) }}
      />

    </Box>
  )
}

export default Header
