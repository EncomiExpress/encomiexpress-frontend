import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { LocationOn, Phone, Person, Business } from '@mui/icons-material'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const RegistrarDestino = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    contacto: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
    
  const { registrarDestino } = useDestino()
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
    if (!formData.nombre || !formData.direccion || !formData.ciudad || !formData.departamento || !formData.telefono) {
      setError('Los campos marcados con * son requeridos')
      return
    }

    try {
      registrarDestino({
        ...formData,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
        telefono: formData.telefono.trim(),
        contacto: formData.contacto ? formData.contacto.trim() : ''
      })
      setSuccess('Destino registrado correctamente')
      
      // Limpiar el formulario
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        telefono: '',
        contacto: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/destinos')
      }, 2000)
    } catch (err) {
      setError('Error al registrar destino')
    }
  }

  const departamentos = [
    'Antioquia',
    'Atlántico',
    'Bogotá D.C.',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cundinamarca',
    'Chocó',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Quindío',
    'Risaralda',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada'
  ]

  const ciudadesPorDepartamento = {
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'],
    'Atlántico': ['Barranquilla', ' Soledad', 'Malambo', 'Baranoa'],
    'Bogotá D.C.': ['Bogotá'],
    'Cundinamarca': ['Zipaquirá', 'Facatativá', 'Girardot', 'Chía', 'Cajicá'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga'],
    'Santander': ['Bucaramanga', 'Piedecuesta', 'Floridablanca', 'Girón'],
    'Tolima': ['Ibagué', 'Espinal', 'Honda'],
    'Huila': ['Neiva', 'Pitalito', 'Garzón'],
    'Meta': ['Villavicencio', 'Acacías', 'Granada']
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
        <FormHeader 
          icon={LocationOn} 
          title="Registrar Destino" 
          subtitle="Ingresa los datos del destino"
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
            {/* Nombre */}
            <FormField
              label="Nombre del Destino"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Terminal de Medellín"
              icon={LocationOn}
            />

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              placeholder="Ej: Cra 50 #30-25"
              icon={Business}
            />

            {/* Departamento */}
            <FormSelect
              label="Departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              required
            >
              {departamentos.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </FormSelect>

            {/* Ciudad */}
            <FormField
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              placeholder="Ej: Medellín"
              icon={LocationOn}
            />

            {/* Teléfono */}
            <FormField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 6041234567"
              icon={Phone}
            />

            {/* Contacto */}
            <FormField
              label="Persona de Contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              icon={Person}
            />
          </FormGrid>

          {/* Botones de navegación */}
          <FormButtonGroup justify="space-between">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SecondaryButton 
                onClick={() => navigate('/transporte/destinos')}
                children="Cancelar"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <PrimaryButton 
                type="submit"
                children="Registrar Destino"
              />
            </Box>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarDestino
