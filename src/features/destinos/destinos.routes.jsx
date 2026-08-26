import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarDestino from './ListarDestino.jsx'
import RegistrarDestino from './RegistrarDestino.jsx'
import ActualizarDestino from './ActualizarDestino.jsx'

const destinosRoutes = [
  <Route key="destinos-listar" path="/transporte/destinos" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_DESTINO]}><ListarDestino /></PrivateRoute>} />,
  <Route key="destinos-registrar" path="/transporte/destinos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_DESTINO]}><RegistrarDestino /></PrivateRoute>} />,
  <Route key="destinos-actualizar" path="/transporte/destinos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_DESTINO]}><ActualizarDestino /></PrivateRoute>} />,
]

export default destinosRoutes
