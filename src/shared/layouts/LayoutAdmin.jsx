import { Box, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import TopNav from './TopNav.jsx'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { STORAGE_KEYS } from '../config/storageKeys.js'

const Layout = ({ children }) => {
  // Con pantallas angostas (ej. 1517px de ancho) el sidebar expandido (250px) le
  // deja muy poco espacio a las tablas y toca hacer scroll horizontal para llegar
  // a la columna de Acciones. Arranca contraído por debajo de este ancho — pero
  // si el usuario ya lo abrió/cerró a mano antes, esa preferencia guardada manda
  // sobre el tamaño de pantalla (igual que darkMode/paletteKey/navLayout).
  const pantallaAngosta = useMediaQuery('(max-width:1550px)')
  const [collapsed, setCollapsed] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
    return guardado !== null ? guardado === 'true' : pantallaAngosta
  })
  const theme = useTheme()
  const { navLayout } = useDarkMode()

  const toggleCollapsed = () =>
    setCollapsed(prev => {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(!prev))
      return !prev
    })

  const isSidebar = navLayout === 'sidebar'

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: theme.palette.background.default }}>
      {/* Barra superior gradiente */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: theme.palette.gradient.navbar,
        zIndex: 30,
      }} />

      {isSidebar && (
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      )}

      <Header collapsed={collapsed} />

      {!isSidebar && <TopNav />}

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          ml: isSidebar ? (collapsed ? '70px' : '250px') : 0,
          mt: isSidebar ? '64px' : '120px',
          // El contenedor raíz ahora es height:100vh + overflow:hidden (para que el
          // scroll nativo del documento no vuelva a aparecer atravesando el header
          // fijo) -- por eso "main" ya no puede solo confiar en flex-stretch para su
          // alto: hay que restarle explícitamente el mt de arriba, si no el sobrante
          // de abajo queda recortado por el overflow:hidden del padre en vez de
          // scrolleable.
          height: isSidebar ? 'calc(100vh - 64px)' : 'calc(100vh - 120px)',
          transition: isSidebar ? 'margin-left 0.3s ease' : 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
