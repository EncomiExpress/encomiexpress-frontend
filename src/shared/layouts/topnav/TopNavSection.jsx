import { Box, Paper, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import TopNavItem from './TopNavItem.jsx'

const TopNavSection = ({
  section, location, isOpen,
  onMouseEnter, onMouseLeave, onStay, onItemClick,
  pal, darkMode, bgColor, borderColor, textMuted, textActive,
}) => {
  const isActive = section.items.some(item =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  )

  return (
    <Box
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
          onMouseEnter={onStay}
          onMouseLeave={onMouseLeave}
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

            return (
              <TopNavItem
                key={item.id}
                item={item}
                itemActive={itemActive}
                pal={pal}
                darkMode={darkMode}
                borderColor={borderColor}
                onClick={onItemClick}
              />
            )
          })}
        </Paper>
      )}
    </Box>
  )
}

export default TopNavSection
