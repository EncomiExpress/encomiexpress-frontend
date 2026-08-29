import { useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

export const FormHeader = ({ icon, title, subtitle }) => {
  const Icon = icon
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        background: theme.palette.gradient.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon sx={{ color: 'white', fontSize: 28 }} />
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export const FormContainer = ({ children, maxWidth = 900 }) => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{
        maxWidth,
        mx: 'auto',
        backgroundColor: '#fff',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        p: 4
      }}>
        {children}
      </Box>
    </Box>
  )
}

export const FormPaper = ({ children }) => {
  return (
    <Box sx={{ p: 4 }}>
      {children}
    </Box>
  )
}

export const FormFieldsContainer = ({ children, direction = 'column', spacing = 3 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, gap: spacing }}>
      {children}
    </Box>
  )
}

export const FormButtonGroup = ({ children, justify = 'flex-end', spacing = 2 }) => {
  return (
    <Box sx={{ display: 'flex', gap: spacing, mt: 2, justifyContent: justify }}>
      {children}
    </Box>
  )
}

export const FormGrid = ({ children }) => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 3
    }}>
      {children}
    </Box>
  )
}
