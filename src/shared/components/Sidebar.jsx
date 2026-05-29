import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, Collapse, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Tooltip, IconButton } from '@mui/material'
import {
  DashboardOutlined as DashboardIcon,
  PersonAdd as PersonAddIcon,
  List as ListIcon,
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
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
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
        transition: 'all 0.18s ease',
        background: isActive && !hasChildren ? `linear-gradient(90deg, ${C.activeBg} 0%, ${darkMode ? 'rgba(79,195,247,0.15)' : 'rgba(26,46,110,0.12)'} 100%)` : 'transparent',
        '&:hover': {
          background: isActive && !hasChildren
            ? `linear-gradient(90deg, ${C.activeBg} 0%, ${darkMode ? 'rgba(79,195,247,0.2)' : 'rgba(26,46,110,0.15)'} 100%)`
            : C.hoverBg,
          '& .MuiSvgIcon-root': {
            color: isActive && !hasChildren ? C.red : C.textIconHover
          },
          '& .MuiTypography-root': {
            color: isActive && !hasChildren ? C.red : C.textNavHover
          },
        },
      }}
    >
      <Icon sx={{
        fontSize: depth === 0 ? '1.1rem' : '0.9rem',
        color: isActive && !hasChildren ? C.red : C.textIcon,
        flexShrink: 0,
      }} />
      {!collapsed && (
        <Typography sx={{
          fontSize: depth === 0 ? '0.875rem' : '0.8rem',
          fontWeight: 500,
          color: isActive && !hasChildren ? C.red : C.textNav,
          flex: 1,
          userSelect: 'none',
        }}>
          {item.label}
        </Typography>
      )}
      {!collapsed && hasChildren && (
        open
          ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
          : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
      )}
    </Box>
  )

  return (
    <>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {content}
        </Tooltip>
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

  if (collapsed) return null
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
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover .section-label': { color: darkMode ? '#4FC3F7' : '#483c3a' },
        transition: 'color 0.18s ease',
      }}
    >
      <Typography
        className="section-label"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.07em',
          color: C.label,
          transition: 'color 0.18s ease',
        }}
      >
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
      transition: 'width 0.3s ease',
      overflowX: 'hidden',
      zIndex: 20,
    }}>
      <Box sx={{
        position: 'relative',
        px: collapsed ? 1 : 2.5,
        pt: 1.5,
        pb: collapsed ? 4.5 : 4,
        borderBottom: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <Box sx={{
          width: collapsed ? 44 : '100%',
          maxWidth: collapsed ? 44 : 190,
          height: collapsed ? 44 : 'auto',
          overflow: collapsed ? 'hidden' : 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={collapsed ? logoEE : logo}
            alt="EncomiExpress"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Box sx={{
          position: 'absolute',
          right: collapsed ? 'auto' : 12,
          left: collapsed ? '50%' : 'auto',
          bottom: -18,
          transform: collapsed ? 'translateX(-50%)' : 'none',
          zIndex: 5,
        }}>
          <IconButton onClick={onToggleCollapsed} size="small" sx={{}}>
            {collapsed ? <ChevronLeftIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        py: 1,
        minHeight: 0,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: darkMode ? '#444444' : 'rgba(26,46,110,0.08)', borderRadius: 2 },
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
            {collapsed && (
              section.items.map(item => (
                <NavItem key={item.id} item={item} depth={0} location={location} collapsed={collapsed} darkMode={darkMode} />
              ))
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: `1px solid ${darkMode ? '#444444' : 'rgba(26,46,110,0.08)'}`, pt: 1.5, pb: 2 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 1 : 2.5,
          py: 0.85,
        }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: C.red,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }}>
              {usuario?.nombre?.trim()
                ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                : 'U'}
            </Typography>
          </Box>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.textBase, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {usuario?.nombre || 'Usuario'}
                </Typography>
                <Typography sx={{ fontSize: '0.71rem', color: C.textMuted, lineHeight: 1.3 }}>
                  {usuario?.rol?.nombre || 'Sin Rol'}
                </Typography>
              </Box>
              <Box
                onClick={() => setOpenLogoutDialog(true)}
                sx={{
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: darkMode ? 'rgba(229,115,115,0.1)' : 'rgba(204,24,24,0.08)' },
                  transition: 'background 0.18s ease',
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.1rem', color: C.textMuted, transition: 'color 0.18s ease', '&:hover': { color: C.red } }} />
              </Box>
            </>
          )}
          {collapsed && (
            <Tooltip title="Cerrar sesión" placement="right">
              <Box
                onClick={() => setOpenLogoutDialog(true)}
                sx={{
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: darkMode ? 'rgba(229,115,115,0.1)' : 'rgba(204,24,24,0.08)' },
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.1rem', color: C.textMuted }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

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
              backgroundColor: C.red,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': { backgroundColor: darkMode ? '#C62828' : '#b91c1c', boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
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