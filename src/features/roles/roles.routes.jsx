import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarRol from './ListarRol.jsx'
import RegistrarRol from './RegistrarRol.jsx'
import ActualizarRol from './ActualizarRol.jsx'

const rolesRoutes = [
  <Route key="roles-listar" path="/roles/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_ROL]}><ListarRol /></PrivateRoute>} />,
  <Route key="roles-registrar" path="/roles/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_ROL]}><RegistrarRol /></PrivateRoute>} />,
  <Route key="roles-actualizar" path="/roles/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_ROL]}><ActualizarRol /></PrivateRoute>} />,
]

export default rolesRoutes