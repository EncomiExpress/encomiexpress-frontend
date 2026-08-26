import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarUsuario from './ListarUsuario.jsx'
import RegistrarUsuario from './RegistrarUsuario.jsx'
import ActualizarUsuario from './ActualizarUsuario.jsx'

const usuariosRoutes = [
  <Route key="usuarios-listar" path="/usuarios/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_USUARIO]}><ListarUsuario /></PrivateRoute>} />,
  <Route key="usuarios-registrar" path="/usuarios/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_USUARIO]}><RegistrarUsuario /></PrivateRoute>} />,
  <Route key="usuarios-actualizar" path="/usuarios/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_USUARIO]}><ActualizarUsuario /></PrivateRoute>} />,
]

export default usuariosRoutes
