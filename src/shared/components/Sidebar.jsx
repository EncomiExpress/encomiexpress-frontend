import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography, Collapse } from '@mui/material'
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
  LightMode as SunIcon,
  DarkMode as MoonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import logo from '../../assets/logo.png'
import { useAuth } from '../contexts/AuthContext'

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  red: '#CC1818',
  navy: '#1a2e6e',
  bg: '#f5f5f5',
  white: '#ffffff',
  label: 'rgba(26,46,110,0.38)',
  textMuted: 'rgba(33,33,33,0.45)',
  textBase: '#212121',
  textIcon: '#8b8382',
  textIconHover: '#483c3a',
  textNav: '#4a3f3c',
  textNavHover: '#1a0e0c',
  activeBg: 'rgba(204,24,24,0.08)',
  hoverBg: 'rgba(26,46,110,0.05)',
  border: 'rgba(26,46,110,0.1)',
  divider: 'rgba(26,46,110,0.08)',
}

// ─── Estructura del menú ────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'general',
    label: 'General',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    ],
  },
  {
    id: 'personas',
    label: 'Personas',
    items: [
      {
        id: 'roles', label: 'Roles', icon: RolesIcon, path: '/roles/listar'
      },
      {
        id: 'usuarios', label: 'Usuarios', icon: GroupAddIcon, path: '/usuarios/listar',
      },
      { id: 'clientes', label: 'Clientes', icon: PeopleIcon, path: '/clientes/listar' },
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
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    items: [
      { id: 'anticipos', label: 'Anticipos y Excedentes', icon: MoneyIcon, path: '/anticipos/listar' },
    ],
  },
  {
    id: 'paquetes',
    label: 'Paquetes',
    items: [
      { id: 'ventas', label: 'Ventas', icon: SalesIcon, path: '/ventas/listar' },
    ],
  },
]

// ─── NavItem ────────────────────────────────────────────────────────────────
const NavItem = ({ item, depth = 0, location }) => {
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const [open, setOpen] = useState(isActive)
  const hasChildren = item.children?.length > 0
  const Icon = item.icon

  return (
    <>
      <Box
        component={hasChildren ? 'div' : Link}
        to={hasChildren ? undefined : item.path}
        onClick={hasChildren ? () => setOpen(p => !p) : undefined}
        sx={{
          display: 'flex', alignItems: 'center',
          gap: 1.5,
          px: depth === 0 ? 2 : 2.5,
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
            // Hover para el icono (hijo)
            '& .MuiSvgIcon-root': { 
              color: isActive && !hasChildren ? C.red : C.textIconHover 
            },
            // Hover para el texto (hijo)
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
        <Typography sx={{
          fontSize: depth === 0 ? '0.875rem' : '0.8rem',
          fontWeight: 500,
          color: isActive && !hasChildren ? C.red : C.textNav,
          flex: 1,
          userSelect: 'none',
        }}>
          {item.label}
        </Typography>
        {hasChildren && (
          open
            ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
            : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: C.textMuted }} />
        )}
      </Box>

      {hasChildren && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 2, mt: 0.25, mb: 0.5, borderLeft: `1px solid ${C.divider}`, pl: 0.5 }}>
            {item.children.map(child => (
              <NavItem key={child.id} item={child} depth={1} location={location} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  )
}

// ─── Etiqueta de sección ────────────────────────────────────────────────────
const SectionLabel = ({ label, isOpen, onClick }) => (
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

// ─── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [openSections, setOpenSections] = useState(
    SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  )
  const { usuario, logout } = useAuth()

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Box sx={{
      width: 250,
      height: '100vh',
      position: 'fixed',
      backgroundColor: C.white,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>

      {/* Logo */}
      <Box sx={{
        px: 2.5, pt: 1.5, pb: 0.5,
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center',
      }}>
        <Box sx={{ width: 130, height: 55, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="EncomiExpress" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
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
        {SECTIONS.map((section, idx) => (
          <Box key={section.id}>
            {idx !== 0 && (
              <Box sx={{ mx: 3, my: 1, height: '1px', backgroundColor: C.divider }} />
            )}
            <SectionLabel
              label={section.label}
              isOpen={openSections[section.id]}
              onClick={() => toggleSection(section.id)}
            />
            <Collapse in={openSections[section.id]}>
              {section.items.map(item => (
                <NavItem key={item.id} item={item} depth={0} location={location} />
              ))}
            </Collapse>
          </Box>
        ))}
      </Box>

      {/* Bottom */}
      <Box sx={{ borderTop: `1px solid ${C.divider}`, pt: 1.5, pb: 2 }}>

        {/* Perfil con logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 0.85 }}>
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.textBase, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usuario?.nombre || 'Usuario'}
            </Typography>
            <Typography sx={{ fontSize: '0.71rem', color: C.textMuted, lineHeight: 1.3 }}>
              {usuario?.rol?.nombre || 'Sin Rol'}
            </Typography>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              cursor: 'pointer',
              p: 0.5,
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(204,24,24,0.08)' },
              transition: 'background 0.18s ease',
            }}
          >
            <LogoutIcon
              sx={{
                fontSize: '1.1rem',
                color: C.textMuted,
                transition: 'color 0.18s ease',
                '&:hover': { color: C.red },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar