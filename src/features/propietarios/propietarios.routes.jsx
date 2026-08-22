import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import ListarPropietario from './ListarPropietario.jsx'
import RegistrarPropietario from './RegistrarPropietario.jsx'
import ActualizarPropietario from './ActualizarPropietario.jsx'

const propietariosRoutes = [
  <Route key="propietarios-listar" path="/transporte/propietarios" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_PROPIETARIO]}><ListarPropietario /></PrivateRoute>} />,
  <Route key="propietarios-registrar" path="/transporte/propietarios/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_PROPIETARIO]}><RegistrarPropietario /></PrivateRoute>} />,
  <Route key="propietarios-actualizar" path="/transporte/propietarios/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_PROPIETARIO]}><ActualizarPropietario /></PrivateRoute>} />,
]

export default propietariosRoutes
