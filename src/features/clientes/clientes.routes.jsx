import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarCliente from './ListarCliente.jsx'
import RegistrarCliente from './RegistrarCliente.jsx'
import ActualizarCliente from './ActualizarCliente.jsx'

const clientesRoutes = [
  <Route key="clientes-listar" path="/clientes/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_CLIENTE]}><ListarCliente /></PrivateRoute>} />,
  <Route key="clientes-registrar" path="/clientes/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_CLIENTE]}><RegistrarCliente /></PrivateRoute>} />,
  <Route key="clientes-actualizar" path="/clientes/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_CLIENTE]}><ActualizarCliente /></PrivateRoute>} />,
]

export default clientesRoutes
