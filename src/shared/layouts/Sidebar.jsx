import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Collapse } from '@mui/material'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { SECTIONS, DASHBOARD_ITEM } from '../config/navSections.js'
import NavItem from './sidebar/NavItem.jsx'
import SectionLabel from './sidebar/SectionLabel.jsx'
import SidebarLogoHeader from './sidebar/SidebarLogoHeader.jsx'
import SidebarFooter from './sidebar/SidebarFooter.jsx'
import useSidebarColors, { SIDEBAR_TRANSITION } from './sidebar/useSidebarColors.js'

const Sidebar = ({ collapsed, onToggleCollapsed }) => {
  const location = useLocation()
  const { darkMode } = useDarkMode()

  const [openSections, setOpenSections] = useState(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  )

  const colors = useSidebarColors(darkMode)

  const toggleSection = (id) => {
    if (collapsed) return
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Box sx={{
      width: collapsed ? 70 : 250,
      height: '100vh',
      position: 'fixed',
      backgroundColor: colors.bg,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      transition: `width ${SIDEBAR_TRANSITION}`,
      overflowX: 'hidden',
      zIndex: 20,
    }}>

      <SidebarLogoHeader collapsed={collapsed} darkMode={darkMode} onToggleCollapsed={onToggleCollapsed} />

      {/* ── NAV ITEMS ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', py: 1, minHeight: 0,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: colors.divider, borderRadius: 2 },
      }}>

        {/* ── Dashboard suelto ── */}
        <Box sx={{ mb: 1 }}>
          <NavItem item={DASHBOARD_ITEM} depth={0} location={location}
            collapsed={collapsed} darkMode={darkMode} colors={colors} />
        </Box>

        {/* ── Secciones ── */}
        {SECTIONS.map((section) => (
          <Box key={section.id}>
            <SectionLabel
              label={section.label}
              isOpen={openSections[section.id]}
              onClick={() => toggleSection(section.id)}
              collapsed={collapsed}
              colors={colors}
            />
            {!collapsed && (
              <Collapse in={openSections[section.id]}>
                {section.items.map(item => item.subItem ? (
                  <Box key={item.id} sx={{ ml: 2, borderLeft: `1px solid ${colors.divider}`, pl: 0.5 }}>
                    <NavItem item={item} depth={1}
                      location={location} collapsed={collapsed}
                      darkMode={darkMode} colors={colors} />
                  </Box>
                ) : (
                  <NavItem key={item.id} item={item} depth={0}
                    location={location} collapsed={collapsed}
                    darkMode={darkMode} colors={colors} />
                ))}
              </Collapse>
            )}
            {collapsed && section.items.map(item => (
              <NavItem key={item.id} item={item} depth={0}
                location={location} collapsed={collapsed}
                darkMode={darkMode} colors={colors} />
            ))}
          </Box>
        ))}
      </Box>

      <SidebarFooter collapsed={collapsed} colors={colors} />
    </Box>
  )
}

export default Sidebar
