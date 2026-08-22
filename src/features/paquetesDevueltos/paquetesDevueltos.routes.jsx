import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/contexts/AuthContext.jsx'
import ListarPaqueteDevuelto from './ListarPaqueteDevuelto.jsx'

const paquetesDevueltosRoutes = [
  <Route key="paquetes-devueltos-listar" path="/paquetes-devueltos/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VENTA]}><ListarPaqueteDevuelto /></PrivateRoute>} />,
]

export default paquetesDevueltosRoutes
