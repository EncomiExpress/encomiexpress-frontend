import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { Box, Typography } from '@mui/material'

const ProtectedRoute = ({ 
  permisosRequeridos = [], 
  requiereTodos = false, 
  children,
  redirectTo = '/login'
}) => {
  const { usuario, tieneAlgunPermiso, tieneTodosLosPermisos } = useAuth()

  if (!usuario) {
    return <Navigate to={redirectTo} replace />
  }

  if (permisosRequeridos.length === 0) {
    return children
  }

  let tieneAcceso = false
  if (requiereTodos) {
    tieneAcceso = tieneTodosLosPermisos(permisosRequeridos)
  } else {
    tieneAcceso = tieneAlgunPermiso(permisosRequeridos)
  }

  if (!tieneAcceso) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No tienes los permisos necesarios para acceder a esta sección.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tu rol actual: <strong>{usuario.rol?.nombre}</strong>
        </Typography>
      </Box>
    )
  }

  return children
}

export default ProtectedRoute