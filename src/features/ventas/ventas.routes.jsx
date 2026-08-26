import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarVenta from './ListarVenta.jsx'
import RegistrarVenta from './RegistrarVenta.jsx'
import ActualizarVenta from './ActualizarVenta.jsx'

const ventasRoutes = [
  <Route key="ventas-listar" path="/ventas/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VENTA]}><ListarVenta /></PrivateRoute>} />,
  <Route key="ventas-registrar" path="/ventas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_VENTA]}><RegistrarVenta /></PrivateRoute>} />,
  <Route key="ventas-actualizar" path="/ventas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_VENTA]}><ActualizarVenta /></PrivateRoute>} />,
]

export default ventasRoutes
