import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'
import { LocalShipping } from '@mui/icons-material'
import logo from '../../assets/logo.png'

const LoadingScreen = ({ mensaje = 'Cargando...' }) => {
  const theme = useTheme()

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
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 5,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ width: 140, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>

        <Box sx={{ position: 'relative', width: 120, height: 80 }}>
          <Box sx={{
            animation: 'drive 2s ease-in-out infinite',
            '@keyframes drive': {
              '0%':   { transform: 'translateX(-30px)', opacity: 0 },
              '50%':  { transform: 'translateX(0px)',   opacity: 1 },
              '100%': { transform: 'translateX(30px)',  opacity: 0 }
            }
          }}>
            <LocalShipping sx={{ fontSize: 60, color: theme.palette.primary.main }} />
          </Box>
        </Box>

        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>
          {mensaje}
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          Por favor espera...
        </Typography>
      </Box>
    </Box>
  )
}

export default LoadingScreen
