import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import {
  DarkModeOutlined as MoonIcon,
  PaletteOutlined as PaletteIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

//────────────────────────────────────────────────
const C = {
  red: '#CC1818',
  navy: '#1a2e6e',
  white: '#ffffff',
  textMuted: 'rgba(33,33,33,0.45)',
  textBase: '#212121',
  textIcon: '#8b8382',
  textIconHover: '#483c3a',
  bg: '#f5f5f5',
  border: 'rgba(26,46,110,0.1)',
  divider: 'rgba(26,46,110,0.08)',
  hoverBg: 'rgba(26,46,110,0.05)',
}

// Función para obtener saludo según la hora
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días,'
  if (hour >= 12 && hour < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
}

const Header = () => {
  const [darkMode, setDarkMode] = useState(false)
  const { usuario } = useAuth()
  const greeting = getGreeting()

  return (
    <Box sx={{
      position: 'fixed',
      top: 4, // Debajo de la barra roja
      left: 250,
      right: 0,
      height: 68,
      backgroundColor: C.white,
      borderBottom: `1px solid ${C.divider}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      zIndex: 10,
    }}>
      
      {/* Saludo - izquierda */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.5 }}>
        <Typography 
          sx={{ 
            fontSize: '1.4rem', 
            color: C.textIconHover, 
            fontWeight: 500,
            fontFamily: 'Cambria !important',
            lineHeight: 1,
          }}
        >
          {greeting}
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', color: C.textBase, fontWeight: 600, ml: 0.5, fontFamily: 'Cambria !important'}}>
          {usuario?.nombre || 'Usuario'}
        </Typography>
      </Box>

      {/* Iconos y perfil - derecha */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        
        {/* Luna - modo oscuro */}
        <Box
          onClick={() => setDarkMode(p => !p)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: C.hoverBg,
              '& svg': { color: C.textIconHover },
            },
          }}
        >
          {darkMode
            ? <MoonIcon sx={{ fontSize: '1.3rem', color: C.navy, transition: 'color 0.18s ease' }} />
            : <MoonIcon sx={{ fontSize: '1.3rem', color: C.textIcon, transition: 'color 0.18s ease' }} />
          }
        </Box>

        {/* Paleta - selector de colores */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: C.hoverBg,
              '& svg': { color: C.textIconHover },
            },
          }}
        >
          <PaletteIcon sx={{ fontSize: '1.3rem', color: C.textIcon, transition: 'color 0.18s ease' }} />
        </Box>

        {/* Perfil */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
          <Box sx={{
            width: 33,
            height: 33,
            borderRadius: '50%',
            backgroundColor: C.red,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Typography sx={{ color: C.white, fontWeight: 700, fontSize: '0.73rem' }}>
              {usuario?.nombre?.trim()
                ? usuario.nombre.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                : 'U'}
            </Typography>
          </Box>
        </Box>

      </Box>
    </Box>
  )
}

export default Header
