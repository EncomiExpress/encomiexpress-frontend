import { Link } from 'react-router-dom'
import { Box, Typography } from '@mui/material'

const TopNavItem = ({ item, itemActive, pal, darkMode, borderColor, onClick }) => {
  const Icon = item.icon

  return (
    <Box
      component={Link}
      to={item.path}
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        pl: item.subItem ? 3.5 : 2, pr: 2, py: 0.85, mx: 0.5,
        ml: item.subItem ? 1 : 0,
        borderLeft: item.subItem ? `1px solid ${borderColor}` : 'none',
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
        fontSize: item.subItem ? '0.85rem' : '1rem',
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
}

export default TopNavItem
