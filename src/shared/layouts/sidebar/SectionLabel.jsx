import { Box, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'

const SectionLabel = ({ label, isOpen, onClick, collapsed, colors }) => {
  const C = colors
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3, pt: 2.0, pb: 1,
        cursor: collapsed ? 'default' : 'pointer',
        userSelect: 'none',
        pointerEvents: collapsed ? 'none' : 'auto',
        opacity: collapsed ? 0 : 1,
        height: collapsed ? 0 : 'auto',
        overflow: 'hidden',
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography sx={{
        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em',
        color: C.sectionLabel, transition: 'color 0.18s ease',
      }}>
        {label}
      </Typography>
      {isOpen
        ? <ExpandLessIcon sx={{ fontSize: '1rem', color: C.muted }} />
        : <ExpandMoreIcon sx={{ fontSize: '1rem', color: C.muted }} />
      }
    </Box>
  )
}

export default SectionLabel
