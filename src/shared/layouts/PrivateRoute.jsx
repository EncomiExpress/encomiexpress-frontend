import { Box, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Navigate } from 'react-router-dom'
import LayoutAdmin from './LayoutAdmin.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useSlowRequest from '../hooks/useSlowRequest.js'

const SinPermisos = () => {
  const theme = useTheme()
  return (
    <Paper elevation={3} sx={{
      p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 360,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2,
        backgroundColor: theme.palette.background.subtle,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LockOutlinedIcon sx={{ fontSize: 26, color: theme.palette.text.secondary }} />
      </Box>
      <Typography fontWeight={700} fontSize="1.05rem" color={theme.palette.text.primary} mb={0.75}>
        Acceso restringido
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        No tienes permisos para acceder a esta sección.
      </Typography>
    </Paper>
  )
}

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
    return (
      <LayoutAdmin>
        <Box sx={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
          <Box sx={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.55 }}>
            {children}
          </Box>
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.08)',
          }}>
            <SinPermisos />
          </Box>
        </Box>
      </LayoutAdmin>
    )
  }

  return <LayoutAdmin>{children}</LayoutAdmin>
}

export default PrivateRoute
