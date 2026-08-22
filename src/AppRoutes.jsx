import { Routes, Route, Navigate } from 'react-router-dom'
import SessionExpiredDialog from './shared/components/SessionExpiredDialog.jsx'

import homeRoutes from './features/home/home.routes.jsx'
import authRoutes from './features/auth/auth.routes.jsx'
import dashboardRoutes from './features/dashboard/dashboard.routes.jsx'
import clientesRoutes from './features/clientes/clientes.routes.jsx'
import anticiposRoutes from './features/anticipos/anticipos.routes.jsx'
import usuariosRoutes from './features/usuarios/usuarios.routes.jsx'
import rolesRoutes from './features/roles/roles.routes.jsx'
import vehiculosRoutes from './features/vehiculos/vehiculos.routes.jsx'
import propietariosRoutes from './features/propietarios/propietarios.routes.jsx'
import conductoresRoutes from './features/conductores/conductores.routes.jsx'
import destinosRoutes from './features/destinos/destinos.routes.jsx'
import rutasRoutes from './features/rutas/rutas.routes.jsx'
import ventasRoutes from './features/ventas/ventas.routes.jsx'
import paquetesDevueltosRoutes from './features/paquetesDevueltos/paquetesDevueltos.routes.jsx'

const AppRoutes = () => {
  return (
    <>
    <SessionExpiredDialog />
    <Routes>
      {homeRoutes}
      {authRoutes}
      {dashboardRoutes}
      {clientesRoutes}
      {anticiposRoutes}
      {usuariosRoutes}
      {rolesRoutes}
      {vehiculosRoutes}
      {propietariosRoutes}
      {conductoresRoutes}
      {destinosRoutes}
      {rutasRoutes}
      {ventasRoutes}
      {paquetesDevueltosRoutes}

      {/* Cualquier ruta no reconocida redirige al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default AppRoutes
