import { useTheme } from '@mui/material/styles'
import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel, InputAdornment, IconButton, Alert, FormHelperText } from '@mui/material'
import { SaveOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { useState } from 'react'

export const formFieldStyles = (theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.primary.light} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
})

export const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  required = false,
  placeholder,
  error,
  helperText,
  icon: Icon,
  multiline = false,
  rows = 1,
  inputProps = {},
  select = false,
  disabled = false,
  children
}) => {
  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      placeholder={placeholder}
      error={!!error}
      helperText={error || helperText}
      multiline={multiline}
      rows={multiline ? rows : 1}
      select={select}
      disabled={disabled}
      slotProps={{
        input: {
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon sx={{ color: '#94a3b8' }} />
            </InputAdornment>
          ) : undefined,
        },
        htmlInput: {
          ...inputProps
        }
      }}
      sx={formFieldStyles}
    >
      {children}
    </TextField>
  )
}

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  helperText,
  shrink = false,
  children
}) => {
  const theme = useTheme()

  const formSelectStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
  }

  return (
    <FormControl fullWidth required={required} error={!!error} sx={formSelectStyles}>
      <InputLabel shrink={shrink || undefined} sx={{ '&.Mui-focused': { color: theme.palette.primary.main } }}>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        displayEmpty={shrink}
        IconComponent={KeyboardArrowDownOutlinedIcon}
      >
        {children}
      </Select>
      {helperText && (
        <FormHelperText error={!!error}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export const PasswordField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  error, 
  helperText,
  icon: Icon = null 
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormField
      label={label}
      name={name}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      icon={Icon}
      children={
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            sx={{ color: '#94a3b8' }}
          >
            {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
          </IconButton>
        </InputAdornment>
      }
    />
  )
}

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

export const FormAlert = ({ severity = 'error', children, onClose }) => {
  return (
    <Alert severity={severity} sx={{ mb: 3, borderRadius: 2 }} onClose={onClose}>
      {children}
    </Alert>
  )
}

export const FormHeader = ({ icon: Icon, title, subtitle }) => {
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