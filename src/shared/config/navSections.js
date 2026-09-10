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
  Inventory2Outlined as PaqueteDevueltoIcon,
} from '@mui/icons-material'

// Cada ítem lleva el permiso `listar_*` que lo habilita (Sidebar.jsx/TopNav.jsx
// lo filtran con tienePermiso — ver LOGICA.md, "Sedes remotas": es lo que deja
// el panel de operador_sede recortado a Ventas/Rutas/Clientes de verdad, en vez
// de mostrar todo el sidebar y depender solo del difuminado de PrivateRoute).
export const DASHBOARD_ITEM = { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard', permiso: 'ver_dashboard' }

export const SECTIONS = [
  {
    id: 'gestion',
    label: 'Gestión',
    items: [
      { id: 'roles',    label: 'Roles',    icon: RolesIcon,   path: '/roles/listar', permiso: 'listar_rol' },
      { id: 'usuarios', label: 'Usuarios', icon: GroupAddIcon, path: '/usuarios/listar', permiso: 'listar_usuario' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    items: [
      { id: 'propietarios', label: 'Propietarios',           icon: BadgeIcon,  path: '/transporte/propietarios', permiso: 'listar_propietario' },
      { id: 'conductores',  label: 'Conductores',            icon: DriverIcon, path: '/transporte/conductores', permiso: 'listar_conductor' },
      { id: 'vehiculos',    label: 'Vehículos',              icon: TruckIcon,  path: '/vehiculos/listar', permiso: 'listar_vehiculo' },
      { id: 'destinos',     label: 'Destinos',               icon: DestIcon,   path: '/transporte/destinos', permiso: 'listar_destino' },
      { id: 'rutas',        label: 'Programación de rutas',  icon: RouteIcon,  path: '/transporte/rutas', permiso: 'listar_ruta' },
      { id: 'anticipos',    label: 'Anticipos y Excedentes', icon: MoneyIcon,  path: '/anticipos/listar', permiso: 'listar_anticipo' },
    ],
  },
  {
    id: 'paquetes',
    label: 'Encomienda',
    items: [
      { id: 'clientes', label: 'Clientes', icon: PeopleIcon, path: '/clientes/listar', permiso: 'listar_cliente' },
      { id: 'ventas',   label: 'Ventas',   icon: SalesIcon,  path: '/ventas/listar', permiso: 'listar_venta' },
      // subItem: se pinta indentado con conector en L bajo Ventas, no como un módulo
      // aparte -- Paquetes devueltos es una extensión de Ventas, no una entidad propia
      // (ver AuthContext.jsx: no tiene permiso propio, usa listar_venta). excluirRoles:
      // es de Medellín — operador_sede tiene listar_venta pero NO debe ver esto (ver
      // LOGICA.md, "Sedes remotas", WS7).
      { id: 'paquetes-devueltos', label: 'Paquetes no entregados', icon: PaqueteDevueltoIcon, path: '/paquetes-no-entregados/listar', subItem: true, permiso: 'listar_venta', excluirRoles: ['operador_sede'] },
    ],
  },
]