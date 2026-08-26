import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarRutaProgramacion from './ListarRutaProgramacion.jsx'
import RegistrarRutaProgramacion from './RegistrarRutaProgramacion.jsx'
import ActualizarRutaProgramacion from './ActualizarRutaProgramacion.jsx'

const rutasRoutes = [
  <Route key="rutas-listar" path="/transporte/rutas" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_RUTA]}><ListarRutaProgramacion /></PrivateRoute>} />,
  <Route key="rutas-registrar" path="/transporte/rutas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_RUTA]}><RegistrarRutaProgramacion /></PrivateRoute>} />,
  <Route key="rutas-actualizar" path="/transporte/rutas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_RUTA]}><ActualizarRutaProgramacion /></PrivateRoute>} />,
]

export default rutasRoutes
