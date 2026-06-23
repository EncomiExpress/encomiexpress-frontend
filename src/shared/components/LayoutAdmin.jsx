import { Box } from '@mui/material'
import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import TopNav from './TopNav.jsx'
import { useDarkMode } from '../contexts/ThemeContext.jsx'

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const theme = useTheme()
  const { navLayout } = useDarkMode()

  const isSidebar = navLayout === 'sidebar'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Barra superior gradiente */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: theme.palette.gradient.navbar,
        zIndex: 30,
      }} />

      {isSidebar && (
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(p => !p)} />
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
          transition: isSidebar ? 'margin-left 0.3s ease' : 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
