import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import ListarSalidaProgramada from './ListarSalidaProgramada.jsx'
import RegistrarSalidaProgramada from './RegistrarSalidaProgramada.jsx'
import ActualizarSalidaProgramada from './ActualizarSalidaProgramada.jsx'

// Agenda concreta de viajes (Programación de Salidas) — ya no tiene entrada propia
// de menú: se llega SOLO desde Rutas/ListarRuta.jsx (botón "Salidas" de una
// plantilla puntual), por eso la ruta cuelga de /transporte/rutas/:idRuta/salidas
// en vez de vivir suelta en /transporte/salidas. ListarSalidaProgramada.jsx lee
// `idRuta` de la URL y muestra solo (y permite registrar solo) las salidas de esa
// plantilla. Hereda los mismos permisos que usaba el ítem de menú "Rutas" antes
// de la Fase 4 de la migración (ver src/features/rutas, que ahora es solo el CRUD
// liviano de la plantilla).
const salidasRoutes = [
  <Route key="salidas-listar" path="/transporte/rutas/:idRuta/salidas" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_RUTA]}><ListarSalidaProgramada /></PrivateRoute>} />,
  <Route key="salidas-registrar" path="/transporte/rutas/:idRuta/salidas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_RUTA]}><RegistrarSalidaProgramada /></PrivateRoute>} />,
  <Route key="salidas-actualizar" path="/transporte/rutas/:idRuta/salidas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_RUTA]}><ActualizarSalidaProgramada /></PrivateRoute>} />,
]

export default salidasRoutes
