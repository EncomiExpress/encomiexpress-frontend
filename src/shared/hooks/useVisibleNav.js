import { SECTIONS, DASHBOARD_ITEM } from '../config/navSections.js'
import { useAuth } from '../contexts/AuthContext.jsx'

// Filtra navSections.js por lo que el usuario logueado puede ver de verdad —
// permiso `listar_*` del ítem, más una exclusión puntual por rol si el ítem la
// trae (ver navSections.js, 'paquetes-devueltos'). Una sección sin ítems
// visibles no se devuelve, para no dejar un grupo huérfano en el sidebar/topnav.
// Usado por Sidebar.jsx y TopNav.jsx — ver LOGICA.md, "Sedes remotas".
const useVisibleNav = () => {
  const { tienePermiso, usuario } = useAuth()
  // `excluirRoles` en navSections.js son códigos estables, no el nombre
  // editable — ver LOGICA.md, "Rol: nombre editable vs codigo".
  const rolCodigo = usuario?.rol?.codigo

  const itemVisible = (item) =>
    tienePermiso(item.permiso) && !(item.excluirRoles || []).includes(rolCodigo)

  const sections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter(itemVisible) }))
    .filter((s) => s.items.length > 0)

  const dashboardItem = itemVisible(DASHBOARD_ITEM) ? DASHBOARD_ITEM : null

  return { sections, dashboardItem }
}

export default useVisibleNav
