import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Typography, Collapse, Tooltip } from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'

const NavItem = ({ item, depth = 0, location, collapsed, darkMode, colors }) => {
  const isActive    = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const [open, setOpen] = useState(isActive)
  const hasChildren = item.children?.length > 0
  const Icon = item.icon
  const C = colors

  const content = (
    <Box
      component={hasChildren ? 'div' : Link}
      to={hasChildren ? undefined : item.path}
      onClick={hasChildren ? () => setOpen(p => !p) : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 1.5,
        px: collapsed ? 1 : 2,
        py: depth === 0 ? 0.9 : 0.65,
        mx: 1,
        borderRadius: '10px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isActive && !hasChildren
          ? `linear-gradient(90deg, ${C.activeBg} 0%, ${C.activeGrad} 100%)`
          : 'transparent',
        '&:hover': {
          background: isActive && !hasChildren
            ? `linear-gradient(90deg, ${C.activeBg} 0%, ${C.activeGrad} 100%)`
            : C.hoverBg,
          '& .MuiSvgIcon-root':    { color: isActive && !hasChildren ? C.primary : C.hoverIcon },
          '& .MuiTypography-root': { color: isActive && !hasChildren ? C.primary : C.hoverText },
        },
      }}
    >
      <Icon sx={{
        fontSize: depth === 0 ? '1.1rem' : '0.9rem',
        color: isActive && !hasChildren ? C.primary : C.icon,
        flexShrink: 0,
        transition: 'color 0.18s ease',
      }} />
      <Box sx={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        opacity: collapsed ? 0 : 1,
        width: collapsed ? 0 : 'auto',
        minWidth: collapsed ? 0 : 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Typography sx={{
          fontSize: depth === 0 ? '0.875rem' : '0.8rem',
          fontWeight: 500,
          color: isActive && !hasChildren ? C.primary : C.nav,
          flex: 1,
          userSelect: 'none',
        }}>
          {item.label}
        </Typography>
      </Box>
      <Box sx={{
        opacity:  (collapsed || !hasChildren) ? 0 : 1,
        width:    (collapsed || !hasChildren) ? 0 : 'auto',
        minWidth: (collapsed || !hasChildren) ? 0 : 'auto',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {hasChildren && (open
          ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: C.muted }} />
          : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: C.muted }} />
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {collapsed
        ? <Tooltip title={item.label} placement="right">{content}</Tooltip>
        : content
      }
      {hasChildren && !collapsed && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 2, mt: 0.25, mb: 0.5, borderLeft: `1px solid ${C.divider}`, pl: 0.5 }}>
            {item.children.map(child => (
              <NavItem key={child.id} item={child} depth={1} location={location}
                collapsed={collapsed} darkMode={darkMode} colors={colors} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  )
}

export default NavItem
