import { useTheme } from '@mui/material/styles'

export const SIDEBAR_TRANSITION = '0.35s cubic-bezier(0.4, 0, 0.2, 1)'

const useSidebarColors = (darkMode) => {
  const theme = useTheme()
  const pal   = theme.palette

  return darkMode
    ? {
        bg:           pal.background.paper,
        border:       pal.divider,
        primary:      pal.primary.main,
        activeBg:     pal.primary.activeBg,
        activeGrad:   pal.primary.activeGrad,
        avatarBg:     pal.primary.main,
        hoverBg:      pal.primary.hoverBg,
        hoverIcon:    pal.primary.hoverIcon,
        hoverText:    pal.primary.hoverText,
        icon:         pal.text.icon,
        nav:          pal.text.nav,
        muted:        '#808080',
        sectionLabel: 'rgba(255,255,255,0.38)',
        divider:      pal.divider,
        textBase:     pal.text.dark,
        textMuted:    pal.text.secondary,
      }
    : {
        bg:           pal.background.paper,
        border:       'rgba(26,46,110,0.1)',
        primary:      pal.primary.main,
        activeBg:     pal.primary.activeBg,
        activeGrad:   pal.primary.activeGrad,
        avatarBg:     pal.primary.main,
        hoverBg:      pal.primary.hoverBg,
        hoverIcon:    pal.primary.hoverIcon,
        hoverText:    pal.primary.hoverText,
        icon:         pal.text.icon,
        nav:          pal.text.nav,
        muted:        'rgba(33,33,33,0.45)',
        sectionLabel: 'rgba(26,46,110,0.38)',
        divider:      pal.divider,
        textBase:     pal.text.dark,
        textMuted:    pal.text.secondary,
      }
}

export default useSidebarColors
