import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { Badge, Person, Phone, Email, LocationOn, Business } from '@mui/icons-material'
import { usePropietario } from '../../Context/PropietarioContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const RegistrarPropietario = () => {
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
    
  const { registrarPropietario } = usePropietario()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    }
  }, [usuario, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Validar campos requeridos
    if (!formData.numeroIdentificacion || !formData.nombre || 
        !formData.telefono || !formData.ciudad) {
      setError('Los campos marcados con * son requeridos')
      return
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El formato del email no es válido')
      return
    }

    try {
      registrarPropietario({
        ...formData,
        tipoIdentificacion: formData.tipoIdentificacion,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido ? formData.apellido.trim() : '',
        telefono: formData.telefono.trim(),
        email: formData.email ? formData.email.trim() : '',
        direccion: formData.direccion ? formData.direccion.trim() : '',
        ciudad: formData.ciudad.trim()
      })
      setSuccess('Propietario registrado correctamente')
      
      // Limpiar el formulario
      setFormData({
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/propietarios')
      }, 2000)
    } catch (err) {
      setError('Error al registrar propietario')
    }
  }

  const tiposIdentificacion = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT (Persona Jurídica)' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'RC', label: 'Registro Civil' }
  ]

  const ciudades = [
    'Medellín',
    'Bogotá',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales',
    'Cúcuta',
    'Ibagué',
    'Pasto',
    'Montería',
    'Villavicencio',
    'Santa Marta',
    'Armenia',
    'Neiva',
    'Sincelejo',
    'Popayán',
    'Tunja',
    'Riohacha'
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
        <FormHeader 
          icon={Badge} 
          title="Registrar Propietario" 
          subtitle="Ingresa los datos del propietario del vehículo"
        />

        {success && (
          <FormAlert severity="success">
            {success}
          </FormAlert>
        )}

        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit}>
          <FormGrid>
            {/* Tipo de Identificación */}
            <FormSelect
              label="Tipo de Identificación"
              name="tipoIdentificacion"
              value={formData.tipoIdentificacion}
              onChange={handleChange}
              required
            >
              {tiposIdentificacion.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
              ))}
            </FormSelect>

            {/* Número de Identificación */}
            <FormField
              label="Número de Identificación"
              name="numeroIdentificacion"
              value={formData.numeroIdentificacion}
              onChange={handleChange}
              required
              placeholder={formData.tipoIdentificacion === 'NIT' ? 'Ej: 900123456' : 'Ej: 1038648135'}
              icon={Business}
            />

            {/* Nombre */}
            <FormField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder={formData.tipoIdentificacion === 'NIT' ? 'Ej: Transportes Express SAS' : 'Ej: Carlos'}
              icon={Person}
            />

            {/* Apellido */}
            <FormField
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder={formData.tipoIdentificacion === 'NIT' ? 'Razón Social (opcional)' : 'Ej: Gómez López'}
              icon={Person}
            />

            {/* Teléfono */}
            <FormField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 3104776919"
              icon={Phone}
            />

            {/* Email */}
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: carlos@gmail.com"
              icon={Email}
            />

            {/* Ciudad */}
            <FormSelect
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            >
              {ciudades.map((ciudad) => (
                <MenuItem key={ciudad} value={ciudad}>{ciudad}</MenuItem>
              ))}
            </FormSelect>

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Cll 45 #20-10"
              icon={LocationOn}
            />
          </FormGrid>

          {/* Botones de navegación */}
          <FormButtonGroup justify="space-between">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SecondaryButton 
                onClick={() => navigate('/transporte/propietarios')}
                children="Cancelar"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <PrimaryButton 
                type="submit"
                children="Registrar Propietario"
              />
            </Box>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarPropietario
