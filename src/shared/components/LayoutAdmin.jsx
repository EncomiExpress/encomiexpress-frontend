import { Box } from '@mui/material'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import theme from '../styles/theme.js'

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>

      {/* Barra superior roja */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: theme.palette.gradient.navbar,
        zIndex: 30,
      }} />

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          ml: '250px',
          mt: '64px', // Altura del header (60px) + barra roja (4px)
        }}
      >
        {children}
      </Box>

    </Box>
  )
}

export default Layout

