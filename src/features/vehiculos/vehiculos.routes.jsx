import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarVehiculo from './ListarVehiculo.jsx'
import RegistrarVehiculo from './RegistrarVehiculo.jsx'
import ActualizarVehiculo from './ActualizarVehiculo.jsx'

const vehiculosRoutes = [
  <Route key="vehiculos-listar" path="/vehiculos/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VEHICULO]}><ListarVehiculo /></PrivateRoute>} />,
  <Route key="vehiculos-registrar" path="/vehiculos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_VEHICULO]}><RegistrarVehiculo /></PrivateRoute>} />,
  <Route key="vehiculos-actualizar" path="/vehiculos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_VEHICULO]}><ActualizarVehiculo /></PrivateRoute>} />,
]

export default vehiculosRoutes
