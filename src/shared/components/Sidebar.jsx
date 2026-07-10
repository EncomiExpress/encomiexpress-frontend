import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Collapse, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, Tooltip, IconButton,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import logo from '../../assets/logo.png'
import logoEE from '../../assets/logoEE.png'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import LogoutConfirmDialog from './LogoutConfirmDialog.jsx'
import { SECTIONS, DASHBOARD_ITEM } from '../config/navSections.js'

// ─── NavItem ─────────────────────────────────────────────────────────────────

const NavItem = ({ item, depth = 0, location, collapsed, darkMode, colors }) => {
  const isActive    = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const [open, setOpen] = useState(isActive)
  const hasChildren = item.children?.length > 0
  const Icon = item.icon
  const C = colors

  const content = (
    <Box
      component={hasChildren ? 'div' : Link}
      to={hasChildren ? undefined : item.path}
      onClick={hasChildren ? () => setOpen(p => !p) : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 1.5,
        px: collapsed ? 1 : 2,
        py: depth === 0 ? 0.9 : 0.65,
        mx: 1,
        borderRadius: '10px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isActive && !hasChildren
          ? `linear-gradient(90deg, ${C.activeBg} 0%, ${C.activeGrad} 100%)`
          : 'transparent',
        '&:hover': {
          background: isActive && !hasChildren
            ? `linear-gradient(90deg, ${C.activeBg} 0%, ${C.activeGrad} 100%)`
            : C.hoverBg,
          '& .MuiSvgIcon-root':    { color: isActive && !hasChildren ? C.primary : C.hoverIcon },
          '& .MuiTypography-root': { color: isActive && !hasChildren ? C.primary : C.hoverText },
        },
      }}
    >
      <Icon sx={{
        fontSize: depth === 0 ? '1.1rem' : '0.9rem',
        color: isActive && !hasChildren ? C.primary : C.icon,
        flexShrink: 0,
        transition: 'color 0.18s ease',
      }} />
      <Box sx={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        opacity: collapsed ? 0 : 1,
        width: collapsed ? 0 : 'auto',
        minWidth: collapsed ? 0 : 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Typography sx={{
          fontSize: depth === 0 ? '0.875rem' : '0.8rem',
          fontWeight: 500,
          color: isActive && !hasChildren ? C.primary : C.nav,
          flex: 1,
          userSelect: 'none',
        }}>
          {item.label}
        </Typography>
      </Box>
      <Box sx={{
        opacity:  (collapsed || !hasChildren) ? 0 : 1,
        width:    (collapsed || !hasChildren) ? 0 : 'auto',
        minWidth: (collapsed || !hasChildren) ? 0 : 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {hasChildren && (open
          ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: C.muted }} />
          : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: C.muted }} />
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {collapsed
        ? <Tooltip title={item.label} placement="right">{content}</Tooltip>
        : content
      }
      {hasChildren && !collapsed && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 2, mt: 0.25, mb: 0.5, borderLeft: `1px solid ${C.divider}`, pl: 0.5 }}>
            {item.children.map(child => (
              <NavItem key={child.id} item={child} depth={1} location={location}
                collapsed={collapsed} darkMode={darkMode} colors={colors} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

const SectionLabel = ({ label, isOpen, onClick, collapsed, colors }) => {
  const C = colors
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3, pt: 2.0, pb: 1,
        cursor: collapsed ? 'default' : 'pointer',
        userSelect: 'none',
        pointerEvents: collapsed ? 'none' : 'auto',
        opacity: collapsed ? 0 : 1,
        height: collapsed ? 0 : 'auto',
        overflow: 'hidden',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography sx={{
        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em',
        color: C.sectionLabel, transition: 'color 0.18s ease',
      }}>
        {label}
      </Typography>
      {isOpen
        ? <ExpandLessIcon sx={{ fontSize: '1rem', color: C.muted }} />
        : <ExpandMoreIcon sx={{ fontSize: '1rem', color: C.muted }} />
      }
    </Box>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ collapsed, onToggleCollapsed }) => {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { darkMode } = useDarkMode()
  const { usuario, logout } = useAuth()

  const [openSections,     setOpenSections]     = useState(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  )
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

  const theme = useTheme()
  const pal   = theme.palette

  const TRANSITION = '0.35s cubic-bezier(0.4, 0, 0.2, 1)'

  const colors = darkMode
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

  const toggleSection = (id) => {
    if (collapsed) return
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Box sx={{
      width: collapsed ? 70 : 250,
      height: '100vh',
      position: 'fixed',
      backgroundColor: colors.bg,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      transition: `width ${TRANSITION}`,
      overflowX: 'hidden',
      zIndex: 20,
    }}>

      {/* ── HEADER / LOGO ── */}
      <Box sx={{
        position: 'relative',
        px: collapsed ? 1 : 2.5,
        pt: 1.5,
        pb: collapsed ? 4.5 : 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: `padding ${TRANSITION}`,
      }}>
        <Box sx={{
          position: 'relative',
          width: collapsed ? 44 : '100%',
          maxWidth: collapsed ? 44 : 190,
          height: collapsed ? 44 : 'auto',
          transition: `width ${TRANSITION}, max-width ${TRANSITION}, height ${TRANSITION}`,
        }}>
          <Box
            component="img"
            src={logo}
            alt="EncomiExpress"
            sx={{
              width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
              opacity: collapsed ? 0 : 1,
              visibility: collapsed ? 'hidden' : 'visible',
              pointerEvents: 'none',
              transition: `opacity ${TRANSITION}, visibility ${TRANSITION}`,
              position: collapsed ? 'absolute' : 'relative',
              top: 0, left: 0,
            }}
          />
          <Box
            component="img"
            src={logoEE}
            alt="EE"
            sx={{
              width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
              opacity: collapsed ? 1 : 0,
              visibility: collapsed ? 'visible' : 'hidden',
              pointerEvents: 'none',
              transition: `opacity ${TRANSITION}, visibility ${TRANSITION}`,
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
            transition: `right ${TRANSITION}`,
            zIndex: 5,
          }}
        >
          <ChevronLeftIcon sx={{
            transition: `transform ${TRANSITION}`,
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          }} />
        </IconButton>
      </Box>

      {/* ── NAV ITEMS ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', py: 1, minHeight: 0,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: colors.divider, borderRadius: 2 },
      }}>

        {/* ── Dashboard suelto ── */}
        <Box sx={{ mb: 1 }}>
          <NavItem item={DASHBOARD_ITEM} depth={0} location={location}
            collapsed={collapsed} darkMode={darkMode} colors={colors} />
        </Box>

        {/* ── Secciones ── */}
        {SECTIONS.map((section) => (
          <Box key={section.id}>
            <SectionLabel
              label={section.label}
              isOpen={openSections[section.id]}
              onClick={() => toggleSection(section.id)}
              collapsed={collapsed}
              colors={colors}
            />
            {!collapsed && (
              <Collapse in={openSections[section.id]}>
                {section.items.map(item => (
                  <NavItem key={item.id} item={item} depth={0}
                    location={location} collapsed={collapsed}
                    darkMode={darkMode} colors={colors} />
                ))}
              </Collapse>
            )}
            {collapsed && section.items.map(item => (
              <NavItem key={item.id} item={item} depth={0}
                location={location} collapsed={collapsed}
                darkMode={darkMode} colors={colors} />
            ))}
          </Box>
        ))}
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{
        borderTop: `1px solid ${colors.border}`,
        height: collapsed ? 88 : 60,
        flexShrink: 0,
        position: 'relative',
        transition: `height ${TRANSITION}`,
      }}>
        <Box sx={{
          position: 'absolute',
          top:  collapsed ? 14 : '50%',
          left: collapsed ? '50%' : 20,
          transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
          transition: `top ${TRANSITION}, left ${TRANSITION}, transform ${TRANSITION}`,
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
              transition: `top ${TRANSITION}, right ${TRANSITION}, left ${TRANSITION}, transform ${TRANSITION}`,
              cursor: 'pointer', p: 0.5, borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
              '&:hover': {
                backgroundColor: pal.primary.activeBg,
                '& .MuiSvgIcon-root': { color: colors.primary },
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: '1.1rem', color: colors.muted, transition: 'color 0.18s ease' }} />
          </Box>
        </Tooltip>
      </Box>

      {/* ── Dialog logout ── */}
      <LogoutConfirmDialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        onConfirm={() => { logout(); navigate('/'); setOpenLogoutDialog(false) }}
      />
    </Box>
  )
}

export default Sidebar