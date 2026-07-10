import { useState, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { useDarkMode } from '../contexts/ThemeContext.jsx'
import { SECTIONS } from '../config/navSections.js'
import useDateTime from '../hooks/useDateTime.js'

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

  const openMenu  = (id)  => { clearTimeout(timerRef.current); setOpenSection(id) }
  const closeMenu = ()    => { timerRef.current = setTimeout(() => setOpenSection(null), 130) }
  const stayMenu  = ()    => clearTimeout(timerRef.current)

  const isSectionActive = (section) =>
    section.items.some(item =>
      location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    )

  return (
    <>
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
        {SECTIONS.map(section => {
          const isActive = isSectionActive(section)
          const isOpen   = openSection === section.id

          return (
            <Box
              key={section.id}
              onMouseEnter={() => openMenu(section.id)}
              onMouseLeave={closeMenu}
              sx={{ position: 'relative', display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}
            >
              {/* Tab del section */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.6,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isActive || isOpen ? pal.primary.activeBg : 'transparent',
                transition: 'background-color 0.18s ease',
                '&:hover': { backgroundColor: pal.primary.activeBg },
              }}>
                <Typography sx={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? textActive : textMuted,
                  userSelect: 'none',
                  transition: 'color 0.18s ease',
                  whiteSpace: 'nowrap',
                }}>
                  {section.label}
                </Typography>
                <ExpandMoreIcon sx={{
                  fontSize: '0.95rem',
                  color: isActive ? textActive : (darkMode ? '#666' : 'rgba(33,33,33,0.38)'),
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease, color 0.18s ease',
                }} />
              </Box>

              {/* Dropdown */}
              {isOpen && (
                <Paper
                  onMouseEnter={stayMenu}
                  onMouseLeave={closeMenu}
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    mt: 0.5,
                    minWidth: 220,
                    py: 0.75,
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: darkMode
                      ? '0 8px 32px rgba(0,0,0,0.35)'
                      : '0 8px 32px rgba(26,46,110,0.13)',
                    zIndex: 100,
                  }}
                >
                  {section.items.map(item => {
                    const itemActive = location.pathname === item.path ||
                      location.pathname.startsWith(item.path + '/')
                    const Icon = item.icon

                    return (
                      <Box
                        key={item.id}
                        component={Link}
                        to={item.path}
                        onClick={() => setOpenSection(null)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          px: 2, py: 0.85, mx: 0.5,
                          borderRadius: '8px',
                          textDecoration: 'none',
                          background: itemActive
                            ? `linear-gradient(90deg, ${pal.primary.activeBg} 0%, ${pal.primary.activeGrad} 100%)`
                            : 'transparent',
                          transition: 'background 0.15s ease',
                          '&:hover': {
                            background: itemActive
                              ? `linear-gradient(90deg, ${pal.primary.activeBg} 0%, ${pal.primary.activeGrad} 100%)`
                              : pal.primary.hoverBg,
                            '& .nav-icon': { color: itemActive ? pal.primary.main : pal.primary.hoverIcon },
                            '& .nav-label': { color: itemActive ? pal.primary.main : pal.primary.hoverText },
                          },
                        }}
                      >
                        <Icon className="nav-icon" sx={{
                          fontSize: '1rem',
                          color: itemActive ? pal.primary.main : (darkMode ? '#808080' : '#9ca3af'),
                          transition: 'color 0.15s ease',
                          flexShrink: 0,
                        }} />
                        <Typography className="nav-label" sx={{
                          fontSize: '0.855rem',
                          fontWeight: itemActive ? 600 : 500,
                          color: itemActive ? pal.primary.main : (darkMode ? '#D0D0D0' : '#374151'),
                          transition: 'color 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.label}
                        </Typography>
                      </Box>
                    )
                  })}
                </Paper>
              )}
            </Box>
          )
        })}

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
    </>
  )
}

export default TopNav
