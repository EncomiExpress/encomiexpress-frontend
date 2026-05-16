import { Box, Typography, CircularProgress } from '@mui/material'
import { LocalShipping } from '@mui/icons-material'
import logo from '../../assets/logo.png'

// Tipos de carga disponibles
const TIPOS_CARGA = {
  CIRCULAR: 'circular',
  CAMION: 'camion',
  PULSO: 'pulso',
  ESPIRAL: 'espiral'
}

const LoadingScreen = ({ tipo = 'circular', mensaje = 'Cargando...' }) => {
  const renderLoading = () => {
    switch (tipo) {
      case TIPOS_CARGA.CAMION:
        return (
          <Box sx={{ position: 'relative', width: 120, height: 80 }}>
            <Box sx={{
              animation: 'drive 2s ease-in-out infinite',
              '@keyframes drive': {
                '0%': { transform: 'translateX(-30px)', opacity: 0 },
                '50%': { transform: 'translateX(0px)', opacity: 1 },
                '100%': { transform: 'translateX(30px)', opacity: 0 }
              }
            }}>
              <LocalShipping sx={{ fontSize: 60, color: '#CC1818' }} />
            </Box>
          </Box>
        )
      case TIPOS_CARGA.PULSO:
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#CC1818',
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.5)', opacity: 0.5 }
                }
              }} />
            ))}
          </Box>
        )
      case TIPOS_CARGA.ESPIRAL:
        return (
          <Box sx={{
            width: 60,
            height: 60,
            border: '4px solid rgba(204, 24, 24, 0.2)',
            borderTop: '4px solid #CC1818',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
        )
      case TIPOS_CARGA.CIRCULAR:
      default:
        return (
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#CC1818',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
        )
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 5,
        backgroundColor: 'white',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: '1px solid rgba(26,46,110,0.1)'
      }}>
        <Box sx={{ width: 140, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        {renderLoading()}
        <Typography sx={{
          color: '#212121',
          fontWeight: 600,
          fontSize: '1rem',
          textAlign: 'center'
        }}>
          {mensaje}
        </Typography>
        <Typography sx={{
          color: 'rgba(33,33,33,0.45)',
          fontSize: '0.75rem'
        }}>
          Por favor espera...
        </Typography>
      </Box>
    </Box>
  )
}

export { LoadingScreen, TIPOS_CARGA }
export default LoadingScreen