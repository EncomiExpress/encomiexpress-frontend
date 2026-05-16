import { Link } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'
import logo from '../../assets/logo.png'
import theme from '../styles/theme.js'

const Layout = ({ children }) => {
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      color: theme.palette.text.dark,
    }}>
      {/* Fondos decorativos (grid, glows) */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(26,46,110,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,46,110,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      <Box sx={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,46,110,0.08) 0%, transparent 70%)',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute', bottom: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,24,24,0.06) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      {/* Barra superior roja */}
      <Box sx={{ height: 4, background: theme.palette.gradient.navbar, width: '100%', position: 'relative', zIndex: 10 }} />

      {/* Header */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: { xs: 4, md: 10 }, py: 1.5,
        position: 'relative', zIndex: 10,
        borderBottom: '1px solid rgba(26,46,110,0.1)',
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 135, height: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '20px',
            border: '1px solid rgba(16, 55, 185, 0.2)', backgroundColor: 'rgba(24, 27, 204, 0.06)',
          }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#344ec4', boxShadow: '0 0 6px #3449c4' }} />
            <Typography sx={{ color: '#1a2a6e', fontSize: '0.72rem', fontWeight: 600 }}>Acceso Exclusivo</Typography>
          </Box>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            endIcon={<LoginIcon />}
            sx={{
              background: theme.palette.gradient.primary,
              borderRadius: '10px', px: 3.5, py: 1.2,
              fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
              color: 'white',
              '&:hover': { background: theme.palette.gradient.primaryHover, transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box sx={{
        position: 'relative', zIndex: 10,
        background: theme.palette.gradient.hero,
        px: { xs: 4, md: 10 }, py: 1.5,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 135, height: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </Box>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.78rem' }}>
          © 2026 EncomiExpress · Uso exclusivo del personal autorizado.
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout
