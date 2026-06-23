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
} from '@mui/icons-material'

export const SECTIONS = [
  {
    id: 'gestion',
    label: 'Gestión',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
      { id: 'roles',     label: 'Roles',     icon: RolesIcon,     path: '/roles/listar' },
      { id: 'usuarios',  label: 'Usuarios',  icon: GroupAddIcon,  path: '/usuarios/listar' },
    ],
  },
  {
    id: 'transporte',
    label: 'Transporte',
    items: [
      { id: 'propietarios', label: 'Propietarios',           icon: BadgeIcon,  path: '/transporte/propietarios' },
      { id: 'conductores',  label: 'Conductores',            icon: DriverIcon, path: '/transporte/conductores' },
      { id: 'vehiculos',    label: 'Vehículos',              icon: TruckIcon,  path: '/vehiculos/listar' },
      { id: 'destinos',     label: 'Destinos',               icon: DestIcon,   path: '/transporte/destinos' },
      { id: 'rutas',        label: 'Programación de rutas',  icon: RouteIcon,  path: '/transporte/rutas' },
      { id: 'anticipos',    label: 'Anticipos y Excedentes', icon: MoneyIcon,  path: '/anticipos/listar' },
    ],
  },
  {
    id: 'paquetes',
    label: 'Encomienda',
    items: [
      { id: 'clientes', label: 'Clientes', icon: PeopleIcon, path: '/clientes/listar' },
      { id: 'ventas',   label: 'Ventas',   icon: SalesIcon,  path: '/ventas/listar' },
    ],
  },
]
