import { Box } from '@mui/material'
import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const theme = useTheme()

  const toggleSidebar = () => setCollapsed(prev => !prev)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Barra superior roja */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: theme.palette.gradient.navbar,
        zIndex: 30,
      }} />

      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleSidebar} />
      <Header collapsed={collapsed} />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          ml: collapsed ? '70px' : '250px',
          mt: '64px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout