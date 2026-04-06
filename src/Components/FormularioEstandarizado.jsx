import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel, InputAdornment, IconButton, Alert, FormHelperText } from '@mui/material'
import { SaveOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import { useState } from 'react'

// Colores del tema — alineados con COLORS usado en las páginas
export const theme = {
  primary: '#CC1818',
  primaryLight: '#FFE8E8',
  secondary: '#1A2E6E',
  text: '#1a0e0c',
  textMuted: '#8A94A6',
  border: '#E0E0E0',
  hoverBg: '#F9F9F9',
}

// Estilos estándar para TextField
export const formFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: theme.border },
    '&:hover fieldset': { borderColor: theme.primary },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '&.Mui-focused fieldset': { borderColor: theme.primary, borderWidth: '1px' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #FFF5F5 inset',
      WebkitTextFillColor: '#1a0e0c',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.primary },
}

// Estilos estándar para Select/FormControl
export const formSelectStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: theme.border },
    '&:hover fieldset': { borderColor: theme.primary, borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(229,115,115,0.18)' },
    '&.Mui-focused fieldset': { borderColor: theme.primary, borderWidth: '1px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.primary },
}

// Componente de campo de texto estándar
export const FormField = ({
  label,
  name,
  value,
  onChange,
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

// Componente de Select estándar
export const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false, 
  error, 
  helperText, 
  children 
}) => {
  return (
    <FormControl fullWidth required={required} error={!!error} sx={formSelectStyles}>
      <InputLabel sx={{ '&.Mui-focused': { color: theme.primary } }}>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={onChange}
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

// Componente de campo de contraseña con visibilidad
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
    <TextField
      fullWidth
      label={label}
      name={name}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      error={!!error}
      helperText={error || helperText}
      slotProps={{
        input: {
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon sx={{ color: '#94a3b8' }} />
            </InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{ color: '#94a3b8' }}
              >
                {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </IconButton>
            </InputAdornment>
          ),
        }
      }}
      sx={formFieldStyles}
    />
  )
}

// Componente de botón primario estándar
export const PrimaryButton = ({ children, onClick, type = 'submit', fullWidth = false, disabled = false, icon: Icon }) => {
  return (
    <Button
      type={type}
      variant="contained"
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      startIcon={Icon ? <Icon /> : <SaveOutlined />}
      sx={{
        backgroundColor: theme.primary,
        borderRadius: 2,
        py: 1.5,
        px: 3,
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
        '&:hover': {
          backgroundColor: '#b91c1c',
          boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)'
        },
      }}
    >
      {children}
    </Button>
  )
}

// Componente de botón secundario estándar
export const SecondaryButton = ({ children, onClick, type = 'button', fullWidth = false, disabled = false, icon: Icon, href }) => {
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
        borderColor: theme.border,
        color: theme.textMuted,
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

// Componente de botón de acción (Eliminar, etc.)
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

// Componente de Alerts estándar
export const FormAlert = ({ severity = 'error', children, onClose }) => {
  return (
    <Alert severity={severity} sx={{ mb: 3, borderRadius: 2 }} onClose={onClose}>
      {children}
    </Alert>
  )
}

// Componente de cabecera de formulario
export const FormHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
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
          <Typography sx={{ color: theme.textMuted, fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// Contenedor de formulario estándar
export const FormContainer = ({ children, maxWidth = 900 }) => {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ 
        maxWidth, 
        mx: 'auto',
        backgroundColor: '#fff',
        borderRadius: 2,
        border: `1px solid ${theme.border}`,
        p: 4
      }}>
        {children}
      </Box>
    </Box>
  )
}

// Contenedor de Paper para formularios
export const FormPaper = ({ children }) => {
  return (
    <Box sx={{ p: 4 }}>
      {children}
    </Box>
  )
}

// Contenedor de campos del formulario
export const FormFieldsContainer = ({ children, direction = 'column', spacing = 3 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, gap: spacing }}>
      {children}
    </Box>
  )
}

// Grupo de botones de formulario
export const FormButtonGroup = ({ children, justify = 'flex-end', spacing = 2 }) => {
  return (
    <Box sx={{ display: 'flex', gap: spacing, mt: 2, justifyContent: justify }}>
      {children}
    </Box>
  )
}

// Grid de formulario
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
