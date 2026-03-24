import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { Person, Phone, Email, Badge, DirectionsCar, Event } from '@mui/icons-material'
import { useConductor } from '../../Context/ConductorContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const RegistrarConductor = () => {
  const [formData, setFormData] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    licenciaConduccion: '',
    fechaVencimientoLicencia: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
    
  const { registrarConductor } = useConductor()
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
        !formData.telefono || !formData.licenciaConduccion || !formData.fechaVencimientoLicencia) {
      setError('Los campos marcados con * son requeridos')
      return
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El formato del email no es válido')
      return
    }

    try {
      registrarConductor({
        ...formData,
        tipoIdentificacion: formData.tipoIdentificacion,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido ? formData.apellido.trim() : '',
        telefono: formData.telefono.trim(),
        email: formData.email ? formData.email.trim() : '',
        licenciaConduccion: formData.licenciaConduccion,
        fechaVencimientoLicencia: formData.fechaVencimientoLicencia
      })
      setSuccess('Conductor registrado correctamente')
      
      // Limpiar el formulario
      setFormData({
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        licenciaConduccion: '',
        fechaVencimientoLicencia: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/conductores')
      }, 2000)
    } catch (err) {
      setError('Error al registrar conductor')
    }
  }

  const tiposIdentificacion = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'RC', label: 'Registro Civil' }
  ]

  const licencias = [
    { value: 'A1', label: 'A1 - Motocicleta' },
    { value: 'A2', label: 'A2 - Motocicleta alta cilindrada' },
    { value: 'B1', label: 'B1 - Automóvil' },
    { value: 'B2', label: 'B2 - Camioneta' },
    { value: 'C1', label: 'C1 - Camión pequeño' },
    { value: 'C2', label: 'C2 - Camión grande' },
    { value: 'C3', label: 'C3 - Tractocamión' },
    { value: 'D1', label: 'D1 - Bus pequeño' },
    { value: 'D2', label: 'D2 - Bus grande' },
    { value: 'E', label: 'E - Remolque' }
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
        <FormHeader 
          icon={Person} 
          title="Registrar Conductor" 
          subtitle="Ingresa los datos del conductor"
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
              placeholder="Ej: 1038648135"
              icon={Badge}
            />

            {/* Nombre */}
            <FormField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan"
              icon={Person}
            />

            {/* Apellido */}
            <FormField
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej: Gómez López"
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
              placeholder="Ej: juan@gmail.com"
              icon={Email}
            />

            {/* Licencia de Conducción */}
            <FormSelect
              label="Licencia de Conducción"
              name="licenciaConduccion"
              value={formData.licenciaConduccion}
              onChange={handleChange}
              required
            >
              {licencias.map((lic) => (
                <MenuItem key={lic.value} value={lic.value}>{lic.label}</MenuItem>
              ))}
            </FormSelect>

            {/* Fecha Vencimiento Licencia */}
            <FormField
              label="Fecha Vencimiento Licencia"
              name="fechaVencimientoLicencia"
              type="date"
              value={formData.fechaVencimientoLicencia}
              onChange={handleChange}
              required
              icon={Event}
            />
          </FormGrid>

          {/* Botones de navegación */}
          <FormButtonGroup justify="space-between">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SecondaryButton 
                onClick={() => navigate('/transporte/conductores')}
                children="Cancelar"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <PrimaryButton 
                type="submit"
                children="Registrar Conductor"
              />
            </Box>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarConductor
