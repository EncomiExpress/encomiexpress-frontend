import { useTheme } from '@mui/material/styles'
import { Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'

export const PrimaryButton = ({ children, onClick, type = 'submit', fullWidth = false, disabled = false, icon: Icon }) => {
  const theme = useTheme()

  return (
    <Button
      type={type}
      variant="contained"
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      startIcon={Icon ? <Icon /> : <SaveOutlined />}
      sx={{
        backgroundColor: theme.palette.primary.main,
        borderRadius: 2,
        py: 1.5,
        px: 3,
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}`,
        },
      }}
    >
      {children}
    </Button>
  )
}

export const SecondaryButton = ({ children, onClick, type = 'button', fullWidth = false, disabled = false, icon: Icon, href }) => {
  const theme = useTheme()

  return (
    <Button
      type={type}
      variant="outlined"
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      href={href}
      startIcon={Icon ? <Icon /> : undefined}
      sx={{
        borderColor: theme.palette.divider,
        color: theme.palette.text.secondary,
        borderRadius: 2,
        py: 1.5,
        px: 3,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          borderColor: '#94a3b8',
          backgroundColor: '#f8fafc'
        },
      }}
    >
      {children}
    </Button>
  )
}

export const ActionButton = ({ children, onClick, type = 'button', variant = 'contained', color = 'error', icon: Icon }) => {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      onClick={onClick}
      startIcon={Icon ? <Icon /> : null}
      sx={{
        borderRadius: 2,
        py: 1.5,
        px: 3,
        fontWeight: 600,
        textTransform: 'none',
      }}
    >
      {children}
    </Button>
  )
}
