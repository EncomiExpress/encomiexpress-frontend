import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarAnticipoExcedente from './ListarAnticipoExcedente.jsx'
import RegistrarAnticipoExcedente from './RegistrarAnticipoExcedente.jsx'
import ActualizarAnticipoExcedente from './ActualizarAnticipoExcedente.jsx'

const anticiposRoutes = [
  <Route key="anticipos-listar" path="/anticipos/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_ANTICIPO]}><ListarAnticipoExcedente /></PrivateRoute>} />,
  <Route key="anticipos-registrar" path="/anticipos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_ANTICIPO]}><RegistrarAnticipoExcedente /></PrivateRoute>} />,
  <Route key="anticipos-actualizar" path="/anticipos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_ANTICIPO]}><ActualizarAnticipoExcedente /></PrivateRoute>} />,
]

export default anticiposRoutes
