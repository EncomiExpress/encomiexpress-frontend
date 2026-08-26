import { Popover, Box, Typography, IconButton } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  LightModeOutlined as SunIcon,
  CheckRounded as CheckIcon,
  Close,
  ViewSidebarOutlined as SidebarIcon,
  ViewStreamOutlined as TopNavIcon,
} from '@mui/icons-material'

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

const HeaderPersonalizationPopover = ({
  anchorEl, onClose, theme, pal, darkMode, toggleDarkMode, paletteKey, togglePalette, navLayout, setNavLayout,
}) => {
  const currentMode = darkMode ? 'dark' : 'light'
  const panelBg     = darkMode ? '#1E1E1E' : '#ffffff'
  const panelBorder = darkMode ? '#444444' : 'rgba(26,46,110,0.1)'
  const labelColor  = darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.5)'
  const optionHover = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const activeOptionBg     = pal.primary.activeBg
  const activeOptionBorder = pal.primary.main

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
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
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 11, right: 8, color: theme.palette.text.secondary }}>
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
          {THEME_OPTIONS.map(({ key, label, icon }) => {
            const Icon = icon
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
          {NAV_OPTIONS.map(({ key, label, icon }) => {
            const Icon = icon
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
  )
}

export default HeaderPersonalizationPopover
