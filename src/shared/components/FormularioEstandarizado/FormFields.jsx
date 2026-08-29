import { useTheme } from '@mui/material/styles'
import { TextField, FormControl, InputLabel, Select, FormHelperText, InputAdornment, IconButton } from '@mui/material'
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { useState } from 'react'
import { formFieldStyles } from '../../utils/formStyles.js'

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
      // "error" tiene dos usos distintos según el llamador: unos pasan el mensaje mismo
      // (ej. error={errores.nombre}) y confían en que sirva de helperText si no se pasa
      // uno aparte; otros pasan un booleano (error={!!errores.nombre}) y sí mandan su
      // propio helperText. Con solo `error || helperText`, el segundo caso mostraba el
      // booleano `true` como texto — es decir, no mostraba nada, porque React no
      // renderiza booleanos. Por eso acá solo se usa "error" como texto de ayuda si de
      // verdad es un string.
      helperText={(typeof error === 'string' && error) || helperText}
      multiline={multiline}
      rows={multiline ? rows : 1}
      select={select}
      disabled={disabled}
      slotProps={{
        input: {
          startAdornment: Icon ? (
            // Con multiline, InputBase centra verticalmente TODOS sus hijos (incluido
            // el adornment) via "align-items: center" en el contenedor flex — con más
            // de 1 fila el ícono queda flotando en medio de la caja en vez de al lado
            // de la primera línea. alignSelf:flex-start solo (sin margen extra) ya deja
            // el ícono exactamente a la altura del top del textarea — medido en vivo con
            // getBoundingClientRect(); un mt agregado a ojo aquí solo lo empuja de más.
            <InputAdornment position="start" sx={multiline ? { alignSelf: 'flex-start' } : undefined}>
              <Icon sx={{ color: '#94a3b8' }} />
            </InputAdornment>
          ) : undefined,
        },
        htmlInput: {
          ...inputProps
        }
      }}
      sx={[
        // formFieldStyles es una función (theme) => estilos — pasarla directo en el
        // array de sx es el patrón correcto para que MUI la invoque con el theme real;
        // antes se hacía spread ({...formFieldStyles}) dentro de un objeto, lo cual solo
        // copia las propiedades propias de la función (ninguna útil) y nunca llegaba a
        // ejecutarla — por eso el anillo de foco (boxShadow) nunca se aplicaba.
        formFieldStyles,
      ]}
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
  onBlur,
  required = false,
  error,
  helperText,
  shrink = false,
  renderValue,
  disabled = false,
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
    <FormControl fullWidth required={required} error={!!error} disabled={disabled} sx={formSelectStyles}>
      <InputLabel shrink={shrink || undefined} sx={{ '&.Mui-focused': { color: theme.palette.primary.main } }}>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        onBlur={onBlur}
        displayEmpty={shrink}
        renderValue={renderValue}
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
