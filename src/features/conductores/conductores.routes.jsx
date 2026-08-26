import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarConductor from './ListarConductor.jsx'
import RegistrarConductor from './RegistrarConductor.jsx'
import ActualizarConductor from './ActualizarConductor.jsx'

const conductoresRoutes = [
  <Route key="conductores-listar" path="/transporte/conductores" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_CONDUCTOR]}><ListarConductor /></PrivateRoute>} />,
  <Route key="conductores-registrar" path="/transporte/conductores/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_CONDUCTOR]}><RegistrarConductor /></PrivateRoute>} />,
  <Route key="conductores-actualizar" path="/transporte/conductores/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_CONDUCTOR]}><ActualizarConductor /></PrivateRoute>} />,
]

export default conductoresRoutes
