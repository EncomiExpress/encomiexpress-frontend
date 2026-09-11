import { Navigate } from 'react-router-dom'
import LayoutAdmin from './LayoutAdmin.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getPrimerDestinoVisible } from '../config/navSections.js'
import useSlowRequest from '../hooks/useSlowRequest.js'

// Componente wrapper para rutas privadas con LayoutAdmin
const PrivateRoute = ({ children, permisosRequeridos = [] }) => {
  const { usuario, loading, tieneAlgunPermiso } = useAuth()
  const tardando = useSlowRequest(loading)

  if (loading) {
    return (
      <LoadingScreen
        mensaje={tardando
          ? 'Conectando con el servidor... esto puede tardar unos segundos'
          : 'Cargando...'}
      />
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (permisosRequeridos.length > 0 && !tieneAlgunPermiso(permisosRequeridos)) {
    // Cualquier rol con un panel recortado a propósito (ej. operador_sede,
    // WS3, o un rol nuevo armado a mano desde Roles con solo un par de
    // permisos) va a la primera sección que sí puede ver, en vez del
    // difuminado genérico -- antes esto era exclusivo de operador_sede
    // hardcodeado por rol; ver navSections.js, getPrimerDestinoVisible.
    return <Navigate to={getPrimerDestinoVisible(usuario)} replace />
  }

  return <LayoutAdmin>{children}</LayoutAdmin>
}

export default PrivateRoute
