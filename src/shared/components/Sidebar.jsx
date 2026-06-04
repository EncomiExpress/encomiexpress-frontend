import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, Collapse, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Tooltip, IconButton } from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  ControlPointOutlined as RolesIcon,
  GroupAddOutlined as GroupAddIcon,
  GroupOutlined as PeopleIcon,
  LocalShippingOutlined as TruckIcon,
  BadgeOutlined as BadgeIcon,
  PersonOutlined as DriverIcon,
  LocationOnOutlined as DestIcon,
  RouteOutlined as RouteIcon,
  AttachMoneyOutlined as MoneyIcon,
  ReceiptOutlined as SalesIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import logo from '../../assets/logo.png'
import logoEE from '../../assets/logoEE.png'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useDarkMode } from '../contexts/ThemeContext.jsx'

const SECTIONS = [
  {
    id: 'gestion',
    label: 'Gestión',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
      { id: 'roles', label: 'Roles', icon: RolesIcon, path: '/roles/listar' },
      { id: 'usuarios', label: 'Usuarios', icon: GroupAddIcon, path: '/usuarios/listar' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    items: [
      { id: 'vehiculos', label: 'Vehículos', icon: TruckIcon, path: '/vehiculos/listar' },
      { id: 'propietarios', label: 'Propietarios', icon: BadgeIcon, path: '/transporte/propietarios' },
      { id: 'conductores', label: 'Conductores', icon: DriverIcon, path: '/transporte/conductores' },
      { id: 'destinos', label: 'Destinos', icon: DestIcon, path: '/transporte/destinos' },
      { id: 'rutas', label: 'Programación de rutas', icon: RouteIcon, path: '/transporte/rutas' },
      { id: 'anticipos', label: 'Anticipos y Excedentes', icon: MoneyIcon, path: '/anticipos/listar' },
    ],
  },
  {
    id: 'paquetes',
    label: 'Encomienda',
    items: [
      { id: 'clientes', label: 'Clientes', icon: PeopleIcon, path: '/clientes/listar' },
      { id: 'ventas', label: 'Ventas', icon: SalesIcon, path: '/ventas/listar' },
    ],
  },
]

const NavItem = ({ item, depth = 0, location, collapsed, darkMode }) => {
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const [open, setOpen] = useState(isActive)
  const hasChildren = item.children?.length > 0
  const Icon = item.icon

  const darkColors = {
    activeBg: 'rgba(229,115,115,0.15)',
    hoverBg: 'rgba(79,195,247,0.08)',
    red: '#E57373',
    textIcon: '#A0A0A0',
    textIconHover: '#4FC3F7',
    textNav: '#E0E0E0',
    textNavHover: '#4FC3F7',
    divider: '#444444',
    textMuted: '#808080',
  }

  const lightColors = {
    activeBg: 'rgba(204,24,24,0.08)',
    hoverBg: 'rgba(26,46,110,0.05)',
    red: '#CC1818',
    textIcon: '#8b8382',
    textIconHover: '#483c3a',
    textNav: '#4a3f3c',
    textNavHover: '#1a0e0c',
    divider: 'rgba(26,46,110,0.08)',
    textMuted: 'rgba(33,33,33,0.45)',
  }

  const C = darkMode ? darkColors : lightColors

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
          ? `linear-gradient(90deg, ${C.activeBg} 0%, ${darkMode ? 'rgba(79,195,247,0.15)' : 'rgba(26,46,110,0.12)'} 100%)`
          : 'transparent',
        '&:hover': {
          background: isActive && !hasChildren
            ? `linear-gradient(90deg, ${C.activeBg} 0%, ${darkMode ? 'rgba(79,195,247,0.2)' : 'rgba(26,46,110,0.15)'} 100%)`
            : C.hoverBg,
          '& .MuiSvgIcon-root': { color: isActive && !hasChildren ? C.red : C.textIconHover },
          '& .MuiTypography-root': { color: isActive && !hasChildren ? C.red : C.textNavHover },
        },
      }}
    >
      <Icon sx={{
        fontSize: depth === 0 ? '1.1rem' : '0.9rem',
        color: isActive && !hasChildren ? C.red : C.textIcon,
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
          color: isActive && !hasChildren ? C.red : C.textNav,
          flex: 1,
          userSelect: 'none',
        }}>
          {item.label}
        </Typography>
      </Box>
      <Box sx={{
        opacity: (collapsed || !hasChildren) ? 0 : 1,
        width: (collapsed || !hasChildren) ? 0 : 'auto',
        minWidth: (collapsed || !hasChildren) ? 0 : 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {hasChildren && (open
          ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
          : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">{content}</Tooltip>
      ) : (
        content
      )}
      {hasChildren && !collapsed && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 2, mt: 0.25, mb: 0.5, borderLeft: `1px solid ${C.divider}`, pl: 0.5 }}>
            {item.children.map(child => (
              <NavItem key={child.id} item={child} depth={1} location={location} collapsed={collapsed} darkMode={darkMode} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  )
}

const SectionLabel = ({ label, isOpen, onClick, collapsed, darkMode }) => {
  const darkColors = { label: 'rgba(255,255,255,0.38)', textMuted: '#808080' }
  const lightColors = { label: 'rgba(26,46,110,0.38)', textMuted: 'rgba(33,33,33,0.45)' }
  const C = darkMode ? darkColors : lightColors

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        pt: 2.0,
        pb: 1,
        cursor: collapsed ? 'default' : 'pointer',
        userSelect: 'none',
        pointerEvents: collapsed ? 'none' : 'auto',
        opacity: collapsed ? 0 : 1,
        height: collapsed ? 0 : 'auto',
        overflow: 'hidden',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography className="section-label" sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.07em',
        color: C.label,
        transition: 'color 0.18s ease',
      }}>
        {label}
      </Typography>
      {isOpen
        ? <ExpandLessIcon sx={{ fontSize: '1rem', color: C.textMuted }} />
        : <ExpandMoreIcon sx={{ fontSize: '1rem', color: C.textMuted }} />
      }
    </Box>
  )
}

const Sidebar = ({ collapsed, onToggleCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode } = useDarkMode()
  const [openSections, setOpenSections] = useState(
    SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { usuario, logout } = useAuth()

  const darkColors = {
    white: '#1E1E1E',
    border: '#444444',
    textMuted: '#808080',
    textBase: '#FFFFFF',
    red: '#E57373',
    textNav: '#E0E0E0',
  }

  const lightColors = {
    white: '#ffffff',
    border: 'rgba(26,46,110,0.1)',
    textMuted: 'rgba(33,33,33,0.45)',
    textBase: '#212121',
    red: '#CC1818',
    textNav: '#4a3f3c',
  }

  const C = darkMode ? darkColors : lightColors

  const toggleSection = (sectionId) => {
    if (collapsed) return
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  // Timing de la transición principal del sidebar
  const TRANSITION = '0.35s cubic-bezier(0.4, 0, 0.2, 1)'

  return (
    <Box sx={{
      width: collapsed ? 70 : 250,
      height: '100vh',
      position: 'fixed',
      backgroundColor: C.white,
      borderRight: `1px solid ${C.border}`,
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
        borderBottom: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: `padding ${TRANSITION}`,
      }}>
        {/* Contenedor con ambas imágenes superpuestas — cross-fade */}
        <Box sx={{
          position: 'relative',
          width: collapsed ? 44 : '100%',
          maxWidth: collapsed ? 44 : 190,
          height: collapsed ? 44 : 'auto',
          transition: `width ${TRANSITION}, max-width ${TRANSITION}, height ${TRANSITION}`,
        }}>
          {/* Logo completo — visible cuando está expandido */}
          <Box
            component="img"
            src={logo}
            alt="EncomiExpress"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              opacity: collapsed ? 0 : 1,
              visibility: collapsed ? 'hidden' : 'visible',
              pointerEvents: 'none', 
              transition: `opacity ${TRANSITION}`,
              // Al colapsar se saca del flujo para que no ocupe espacio
              position: collapsed ? 'absolute' : 'relative',
              top: 0,
              left: 0,
            }}
          />
          {/* Logo pequeño (EE) — visible cuando está colapsado */}
          <Box
            component="img"
            src={logoEE}
            alt="EE"
            sx={{
              width: collapsed ? '100%' : '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              opacity: collapsed ? 1 : 0,
              visibility: collapsed ? 'visible' : 'hidden',
              pointerEvents: 'none',  
              transition: `opacity ${TRANSITION}`,
              position: collapsed ? 'relative' : 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </Box>

        {/* Botón toggle */}
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
        flex: 1,
        overflowY: 'auto',
        py: 1,
        minHeight: 0,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          background: darkMode ? '#444444' : 'rgba(26,46,110,0.08)',
          borderRadius: 2,
        },
      }}>
        {SECTIONS.map((section) => (
          <Box key={section.id}>
            <SectionLabel
              label={section.label}
              isOpen={openSections[section.id]}
              onClick={() => toggleSection(section.id)}
              collapsed={collapsed}
              darkMode={darkMode}
            />
            {!collapsed && (
              <Collapse in={openSections[section.id]}>
                {section.items.map(item => (
                  <NavItem key={item.id} item={item} depth={0} location={location} collapsed={collapsed} darkMode={darkMode} />
                ))}
              </Collapse>
            )}
            {collapsed && section.items.map(item => (
              <NavItem key={item.id} item={item} depth={0} location={location} collapsed={collapsed} darkMode={darkMode} />
            ))}
          </Box>
        ))}
      </Box>

      {/* ── FOOTER (avatar + logout animados) ── */}
      <Box sx={{
        borderTop: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.08)'}`,
        // Altura fija para poder hacer la animación posicional
        height: collapsed ? 88 : 60,
        flexShrink: 0,
        position: 'relative',
        transition: `height ${TRANSITION}`,
      }}>

        {/* Avatar — se desplaza al centro-top cuando colapsa */}
        <Box sx={{
          position: 'absolute',
          // expandido: centrado verticalmente a la izquierda (con px 2.5)
          // colapsado: centrado horizontalmente en top
          top: collapsed ? 14 : '50%',
          left: collapsed ? '50%' : 20,
          transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
          transition: `top ${TRANSITION}, left ${TRANSITION}, transform ${TRANSITION}`,
          width: 34,
          height: 34,
          borderRadius: '50%',
          backgroundColor: C.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 2,
        }}>
          <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', ml: 0.2, userSelect: 'none' }}>
            {usuario?.nombre?.trim()
              ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
              : 'U'}
          </Typography>
        </Box>

        {/* Texto nombre + rol — se desvanece al colapsar (sin ocupar espacio) */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          // empieza justo después del avatar (34px) + gap (12px) + px inicial (20px)
          left: 66,
          transform: 'translateY(-50%)',
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto',
          transition: `opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
          // reservamos espacio solo cuando está visible
          width: collapsed ? 0 : 'calc(100% - 100px)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <Typography sx={{
            fontWeight: 700,
            fontSize: '0.82rem',
            color: C.textBase,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {usuario?.nombre || 'Usuario'}
          </Typography>
          <Typography sx={{
            fontSize: '0.71rem',
            color: C.textMuted,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {usuario?.rol?.nombre || 'Sin Rol'}
          </Typography>
        </Box>

        {/* Botón logout — viaja desde la derecha hasta debajo del avatar */}
        <Tooltip title="Cerrar sesión" placement={collapsed ? 'right' : 'top'}>
          <Box
            onClick={() => setOpenLogoutDialog(true)}
            sx={{
              position: 'absolute',
              // expandido: lado derecho, centrado vertical
              // colapsado: centrado horizontal, debajo del avatar
              top: collapsed ? 58 : '50%',
              right: collapsed ? 'auto' : 12,
              left: collapsed ? '50%' : 'auto',
              transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
              transition: `top ${TRANSITION}, right ${TRANSITION}, left ${TRANSITION}, transform ${TRANSITION}`,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(229,115,115,0.1)' : 'rgba(204,24,24,0.08)',
                '& .MuiSvgIcon-root': { color: C.red },
              },
            }}
          >
            <LogoutIcon sx={{
              fontSize: '1.1rem',
              color: C.textMuted,
              transition: 'color 0.18s ease',
            }} />
          </Box>
        </Tooltip>
      </Box>

      {/* ── DIALOG LOGOUT ── */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', color: C.textBase }}>
          ¿Cerrar sesión?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: C.textMuted, fontSize: '0.88rem' }}>
            Estás a punto de salir del sistema. ¿Estás seguro de que deseas cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            disableRipple
            sx={{
              textTransform: 'none', color: C.textMuted, fontWeight: 500, borderRadius: 1.5,
              '&:hover': {
                backgroundColor: darkMode ? '#2A2A2A' : '#F8F9FA',
                color: darkMode ? '#FFFFFF' : '#1a0e0c',
              },
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
              backgroundColor: C.red,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': {
                backgroundColor: darkMode ? '#C62828' : '#b91c1c',
                boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
              },
            }}
          >
            Sí, cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Sidebar