import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { Person, Email, Lock, Badge } from '@mui/icons-material'
import { useAuth, ROLES } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PasswordField, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const RegistrarUsuario = () => {
  const { tienePermiso, registrarUsuario, getUsuarios } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    iniciales: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setMensaje('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.email || !formData.password || !formData.rol || !formData.iniciales) {
      setError('Todos los campos son requeridos')
      return
    }

    // Pasar autoLogin=false para que un admin registrando otro usuario no inicie sesión automáticamente
    registrarUsuario(formData, false)
    
    setMensaje('Usuario registrado correctamente')
    setError('')
    
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '',
      iniciales: ''
    })
    
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleLimpiar = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '',
      iniciales: ''
    })
    setMensaje('')
    setError('')
  }

  if (!tienePermiso('registrar_usuario')) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>
          <FormAlert severity="error">
            No tienes permisos para registrar usuarios.
          </FormAlert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>
        <FormHeader 
          icon={Person} 
          title="Registrar Nuevo Usuario" 
          subtitle="Ingresa los datos del nuevo usuario"
        />

        {mensaje && (
          <FormAlert severity="success">
            {mensaje}
          </FormAlert>
        )}

        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit}>
          <FormFieldsContainer>
            <FormField
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
              icon={Person}
            />

            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="juan@ejemplo.com"
              icon={Email}
            />

            <PasswordField
              label="Contraseña"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              icon={Lock}
            />

            <FormSelect
              label="Rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
            >
              {Object.values(ROLES).map((rol) => (
                <MenuItem key={rol.id} value={rol.nombre}>
                  {rol.nombre}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Iniciales"
              name="iniciales"
              value={formData.iniciales}
              onChange={handleChange}
              required
              placeholder="Ej: JP"
              helperText="Máximo 3 caracteres (ej: VP, JG, MV)"
              icon={Badge}
            />
            
            <FormButtonGroup>
              <PrimaryButton children="Registrar" />
              <SecondaryButton 
                onClick={() => navigate('/usuarios/listar')}
                children="Cancelar"
              />
            </FormButtonGroup>
          </FormFieldsContainer>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarUsuario
