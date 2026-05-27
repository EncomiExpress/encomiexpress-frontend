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
import { useAuth } from '../contexts/AuthContext.jsx'
import theme from '../styles/theme.js'

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  red: theme.palette.primary.main,
  navy: theme.palette.secondary.main,
  bg: '#f5f5f5',
  white: '#ffffff',
  label: 'rgba(26,46,110,0.38)',
  textMuted: 'rgba(33,33,33,0.45)',
  textBase: theme.palette.text.dark,
  textIcon: '#8b8382',
  textIconHover: '#483c3a',
  textNav: '#4a3f3c',
  textNavHover: theme.palette.text.primary,
  activeBg: 'rgba(204,24,24,0.08)',
  hoverBg: 'rgba(26,46,110,0.05)',
  border: 'rgba(26,46,110,0.1)',
  divider: 'rgba(26,46,110,0.08)',
}

// ─── Estructura del menú ────────────────────────────────────────────────────
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

// ─── NavItem (soporta collapsed y tooltip) ─────────────────────────────────
const NavItem = ({ item, depth = 0, location, collapsed }) => {
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const [open, setOpen] = useState(isActive)
  const hasChildren = item.children?.length > 0
  const Icon = item.icon

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
        background: isActive && !hasChildren ? `linear-gradient(90deg, ${C.activeBg} 0%, rgba(26,46,110,0.12) 100%)` : 'transparent',
        '&:hover': {
          background: isActive && !hasChildren
            ? `linear-gradient(90deg, ${C.activeBg} 0%, rgba(26,46,110,0.15) 100%)`
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
              <NavItem key={child.id} item={child} depth={1} location={location} collapsed={collapsed} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  )
}

// ─── Etiqueta de sección (no se muestra cuando collapsed) ───────────────────
const SectionLabel = ({ label, isOpen, onClick, collapsed }) => {
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
        '&:hover .section-label': { color: C.textIcon },
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

// ─── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, onToggleCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openSections, setOpenSections] = useState(
    SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { usuario, logout } = useAuth()

  const toggleSection = (sectionId) => {
    if (collapsed) return // En modo colapsado no se pueden expandir secciones (no tienen texto)
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
      {/* Logo + botón de colapso */}
      <Box sx={{
        px: collapsed ? 1 : 2.5,
        pt: 1.5,
        pb: 0.5,
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 1,
      }}>
        {!collapsed && (
          <Box sx={{ width: 130, height: 55, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="EncomiExpress" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}
        {collapsed && (
          <Box sx={{ width: 40, height: 40, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="EncomiExpress" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
        )}
        <IconButton
          onClick={onToggleCollapsed}
          size="small"
          sx={{
            color: C.textMuted,
            '&:hover': { color: C.red, backgroundColor: C.hoverBg },
            transition: 'all 0.2s',
          }}
        >
          {collapsed ? <ChevronLeftIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>

      {/* Navegación con scroll */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        py: 1,
        minHeight: 0,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: C.divider, borderRadius: 2 },
      }}>
        {SECTIONS.map((section) => (
          <Box key={section.id}>
            <SectionLabel
              label={section.label}
              isOpen={openSections[section.id]}
              onClick={() => toggleSection(section.id)}
              collapsed={collapsed}
            />
            {!collapsed && (
              <Collapse in={openSections[section.id]}>
                {section.items.map(item => (
                  <NavItem key={item.id} item={item} depth={0} location={location} collapsed={collapsed} />
                ))}
              </Collapse>
            )}
            {collapsed && (
              // Cuando está colapsado, mostramos los items directamente sin secciones
              section.items.map(item => (
                <NavItem key={item.id} item={item} depth={0} location={location} collapsed={collapsed} />
              ))
            )}
          </Box>
        ))}
      </Box>

      {/* Bottom: perfil + logout (también se colapsa el texto) */}
      <Box sx={{ borderTop: `1px solid ${C.divider}`, pt: 1.5, pb: 2 }}>
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
            <Typography sx={{ color: C.white, fontWeight: 700, fontSize: '0.75rem' }}>
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
                  '&:hover': { backgroundColor: 'rgba(204,24,24,0.08)' },
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
                  '&:hover': { backgroundColor: 'rgba(204,24,24,0.08)' },
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.1rem', color: C.textMuted }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Dialog de confirmación de cierre de sesión */}
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
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 1.5,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
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
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 14px rgba(204,24,24,0.2)',
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: '0 6px 20px rgba(204,24,24,0.2)' },
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