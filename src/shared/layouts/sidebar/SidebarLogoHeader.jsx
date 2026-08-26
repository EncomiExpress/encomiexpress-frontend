import { Box, IconButton } from '@mui/material'
import { ChevronLeft as ChevronLeftIcon } from '@mui/icons-material'
import logo from '../../../assets/logo.png'
import logoDark from '../../../assets/logoDark.png'
import logoEE from '../../../assets/logoEE.png'
import logoEEDark from '../../../assets/logoEEDark.png'
import { SIDEBAR_TRANSITION } from './useSidebarColors.js'

const SidebarLogoHeader = ({ collapsed, darkMode, onToggleCollapsed }) => {
  return (
    <Box sx={{
      position: 'relative',
      px: collapsed ? 1 : 2.5,
      pt: 1.5,
      pb: collapsed ? 4.5 : 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      transition: `padding ${SIDEBAR_TRANSITION}`,
    }}>
      <Box sx={{
        position: 'relative',
        width: collapsed ? 44 : '100%',
        maxWidth: collapsed ? 44 : 190,
        height: collapsed ? 44 : 'auto',
        transition: `width ${SIDEBAR_TRANSITION}, max-width ${SIDEBAR_TRANSITION}, height ${SIDEBAR_TRANSITION}`,
      }}>
        <Box
          component="img"
          src={darkMode ? logoDark : logo}
          alt="EncomiExpress"
          sx={{
            width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            pointerEvents: 'none',
            transition: `opacity ${SIDEBAR_TRANSITION}, visibility ${SIDEBAR_TRANSITION}`,
            position: collapsed ? 'absolute' : 'relative',
            top: 0, left: 0,
          }}
        />
        <Box
          component="img"
          src={darkMode ? logoEEDark : logoEE}
          alt="EE"
          sx={{
            width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
            opacity: collapsed ? 1 : 0,
            visibility: collapsed ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: `opacity ${SIDEBAR_TRANSITION}, visibility ${SIDEBAR_TRANSITION}`,
            position: collapsed ? 'relative' : 'absolute',
            top: 0, left: 0,
          }}
        />
      </Box>

      <IconButton
        onClick={onToggleCollapsed}
        size="small"
        sx={{
          position: 'absolute',
          bottom: 0,
          right: collapsed ? 'calc(50% - 16px)' : '8px',
          transition: `right ${SIDEBAR_TRANSITION}`,
          zIndex: 5,
        }}
      >
        <ChevronLeftIcon sx={{
          transition: `transform ${SIDEBAR_TRANSITION}`,
          transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </IconButton>
    </Box>
  )
}

export default SidebarLogoHeader
