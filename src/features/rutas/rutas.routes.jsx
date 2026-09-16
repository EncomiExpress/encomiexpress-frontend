import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarRuta from './ListarRuta.jsx'

// Plantillas de Ruta (liviano: nombre/destino/observaciones/habilitado). Registrar
// y Actualizar viven como modales dentro de ListarRuta.jsx (mismo patrón que
// Destinos/Clientes), así que solo hace falta una entrada de navegación. Gateado
// por los mismos permisos que ya usaba el ítem "Rutas" del menú.
const rutasRoutes = [
  <Route key="rutas-listar" path="/transporte/rutas" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_RUTA]}><ListarRuta /></PrivateRoute>} />,
]

export default rutasRoutes
