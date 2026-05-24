import React from 'react'
import { Box, Tooltip } from '@mui/material'

const StatusIcon = ({ habilitado, estado, size = 18 }) => {
  const isActive = typeof habilitado === 'boolean'
    ? habilitado
    : (typeof estado === 'string' ? estado.toLowerCase() === 'activo' : !!estado)

  return (
    <Tooltip title={isActive ? 'Activo' : 'Inactivo'}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
        <Box sx={{
          width: size, height: size, borderRadius: '50%',
          backgroundColor: isActive ? '#16A34A' : '#EF4444',
        }} />
      </Box>
    </Tooltip>
  )
}

export default StatusIcon

