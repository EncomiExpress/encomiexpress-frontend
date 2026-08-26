import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Tooltip } from '@mui/material'
import { Logout as LogoutIcon } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext.jsx'
import LogoutConfirmDialog from '../../components/LogoutConfirmDialog.jsx'
import { SIDEBAR_TRANSITION } from './useSidebarColors.js'

const SidebarFooter = ({ collapsed, colors }) => {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

  return (
    <Box sx={{
      borderTop: `1px solid ${colors.border}`,
      height: collapsed ? 88 : 60,
      flexShrink: 0,
      position: 'relative',
      transition: `height ${SIDEBAR_TRANSITION}`,
    }}>
      <Box sx={{
        position: 'absolute',
        top:  collapsed ? 14 : '50%',
        left: collapsed ? '50%' : 20,
        transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
        transition: `top ${SIDEBAR_TRANSITION}, left ${SIDEBAR_TRANSITION}, transform ${SIDEBAR_TRANSITION}`,
        width: 34, height: 34, borderRadius: '50%',
        backgroundColor: colors.avatarBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 2,
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', ml: 0.2, userSelect: 'none' }}>
          {usuario?.nombre?.trim()
            ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
            : 'U'}
        </Typography>
      </Box>

      <Box sx={{
        position: 'absolute',
        top: '50%', left: 66,
        transform: 'translateY(-50%)',
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? 'none' : 'auto',
        transition: `opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        width: collapsed ? 0 : 'calc(100% - 100px)',
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: colors.textBase, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {usuario?.nombre || 'Usuario'}
        </Typography>
        <Typography sx={{ fontSize: '0.71rem', color: colors.textMuted, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {usuario?.rol?.nombre || 'Sin Rol'}
        </Typography>
      </Box>

      <Tooltip title="Cerrar sesión" placement={collapsed ? 'right' : 'top'}>
        <Box
          onClick={() => setOpenLogoutDialog(true)}
          sx={{
            position: 'absolute',
            top:   collapsed ? 58 : '50%',
            right: collapsed ? 'auto' : 12,
            left:  collapsed ? '50%' : 'auto',
            transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
            transition: `top ${SIDEBAR_TRANSITION}, right ${SIDEBAR_TRANSITION}, left ${SIDEBAR_TRANSITION}, transform ${SIDEBAR_TRANSITION}`,
            cursor: 'pointer', p: 0.5, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
            '&:hover': {
              backgroundColor: colors.activeBg,
              '& .MuiSvgIcon-root': { color: colors.primary },
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: '1.1rem', color: colors.muted, transition: 'color 0.18s ease' }} />
        </Box>
      </Tooltip>

      <LogoutConfirmDialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        onConfirm={() => { logout(); navigate('/'); setOpenLogoutDialog(false) }}
      />
    </Box>
  )
}

export default SidebarFooter
