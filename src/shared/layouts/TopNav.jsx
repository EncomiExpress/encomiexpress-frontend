import { useState, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import { useLocation } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { SECTIONS } from '../config/navSections.js'
import useDateTime from '../hooks/useDateTime.js'
import TopNavSection from './topnav/TopNavSection.jsx'

const TopNav = () => {
  const theme    = useTheme()
  const pal      = theme.palette
  const location = useLocation()
  const { darkMode } = useDarkMode()
  const dateTime = useDateTime()

  const [openSection, setOpenSection] = useState(null)
  const timerRef = useRef(null)

  const bgColor     = darkMode ? '#1E1E1E' : '#ffffff'
  const borderColor = darkMode ? '#444444' : 'rgba(26,46,110,0.08)'
  const textMuted   = darkMode ? '#A0A0A0' : '#8b8382'
  const textActive  = pal.primary.main

  const openMenu  = (id) => { clearTimeout(timerRef.current); setOpenSection(id) }
  const closeMenu = ()   => { timerRef.current = setTimeout(() => setOpenSection(null), 130) }
  const stayMenu  = ()   => clearTimeout(timerRef.current)

  return (
    <Box sx={{
      position: 'fixed',
      top: 72, left: 0, right: 0,
      height: 48,
      backgroundColor: bgColor,
      borderBottom: `1px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'center',
      px: 2,
      gap: 0.5,
      zIndex: 9,
    }}>

      {/* ── Secciones de navegación ── */}
      {SECTIONS.map(section => (
        <TopNavSection
          key={section.id}
          section={section}
          location={location}
          isOpen={openSection === section.id}
          onMouseEnter={() => openMenu(section.id)}
          onMouseLeave={closeMenu}
          onStay={stayMenu}
          onItemClick={() => setOpenSection(null)}
          pal={pal}
          darkMode={darkMode}
          bgColor={bgColor}
          borderColor={borderColor}
          textMuted={textMuted}
          textActive={textActive}
        />
      ))}

      {/* ── Spacer ── */}
      <Box sx={{ flex: 1 }} />

      {/* ── Fecha y hora (lado derecho) ── */}
      <Typography sx={{
        fontSize: '0.8rem',
        color: darkMode ? '#A0A0A0' : 'rgba(33,33,33,0.5)',
        fontWeight: 400,
        letterSpacing: '0.01em',
        pr: 1,
        userSelect: 'none',
      }}>
        {dateTime}
      </Typography>
    </Box>
  )
}

export default TopNav
