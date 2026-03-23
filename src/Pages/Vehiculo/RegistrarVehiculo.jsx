import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Paper, Alert, MenuItem, Select, FormControl, InputLabel, InputAdornment } from '@mui/material'
import { DirectionsCar, Person, Business, Event, Speed } from '@mui/icons-material'
import { useTransporte } from '../../Context/TransporteContext'
import { useAuth } from '../../Context/AuthContext'

const RegistrarTransporte = () => {
  const [formData, setFormData] = useState({
    idConductor: '',
    idPropietario: '',
    placa: '',
    marca: '',
    modelo: '',
    color: '',
    tipo: '',
    capacidad: '',
    estado: 'Activo',
    vencimientoSOAT: '',
    vencimientoRevisionTecnica: '',
    vencimientoSeguroTerceros: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { registrarTransporte } = useTransporte()
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
    if (!formData.placa || !formData.marca || !formData.modelo || !formData.color || 
        !formData.tipo || !formData.capacidad || !formData.idConductor || !formData.idPropietario) {
      setError('Todos los campos son requeridos')
      return
    }

    try {
      registrarTransporte({
        ...formData,
        capacidad: parseFloat(formData.capacidad),
        idConductor: parseInt(formData.idConductor),
        idPropietario: parseInt(formData.idPropietario)
      })
      setSuccess('Transporte registrado correctamente')
      
      // Limpiar el formulario
      setFormData({
        idConductor: '',
        idPropietario: '',
        placa: '',
        marca: '',
        modelo: '',
        color: '',
        tipo: '',
        capacidad: '',
        estado: 'Activo',
        vencimientoSOAT: '',
        vencimientoRevisionTecnica: '',
        vencimientoSeguroTerceros: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/listar')
      }, 2000)
    } catch (err) {
      setError('Error al registrar transporte')
    }
  }

  const tiposVehiculo = [
    'Camioneta',
    'Camión',
    'Furgón',
    'Semi Trayler',
    'Trayler',
    'Motocicleta',
    'Otro'
  ]

  const estados = [
    'Activo',
    'Inactivo',
    'Mantenimiento',
    'En Reparación'
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0' }}>
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
            <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Registrar Transporte
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Ingresa los datos del vehículo
            </Typography>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Placa */}
            <TextField
              fullWidth
              label="Placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              required
              placeholder="Ej: ABC-123"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DirectionsCar sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Marca */}
            <TextField
              fullWidth
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              placeholder="Ej: Toyota"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Modelo */}
            <TextField
              fullWidth
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              placeholder="Ej: Hilux"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DirectionsCar sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Color */}
            <TextField
              fullWidth
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              placeholder="Ej: Blanco"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DirectionsCar sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Tipo */}
            <FormControl fullWidth required sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Tipo de Vehículo</InputLabel>
              <Select
                name="tipo"
                value={formData.tipo}
                label="Tipo de Vehículo"
                onChange={handleChange}
              >
                {tiposVehiculo.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Capacidad */}
            <TextField
              fullWidth
              label="Capacidad (kg)"
              name="capacidad"
              type="number"
              value={formData.capacidad}
              onChange={handleChange}
              required
              placeholder="Ej: 1500"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Speed sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* ID Conductor */}
            <TextField
              fullWidth
              label="ID Conductor"
              name="idConductor"
              type="number"
              value={formData.idConductor}
              onChange={handleChange}
              required
              placeholder="Ej: 4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* ID Propietario */}
            <TextField
              fullWidth
              label="ID Propietario"
              name="idPropietario"
              type="number"
              value={formData.idPropietario}
              onChange={handleChange}
              required
              placeholder="Ej: 6"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Estado */}
            <FormControl fullWidth required sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                label="Estado"
                onChange={handleChange}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Vencimiento SOAT */}
            <TextField
              fullWidth
              label="Vencimiento SOAT"
              name="vencimientoSOAT"
              type="date"
              value={formData.vencimientoSOAT}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Vencimiento Revisión Técnica */}
            <TextField
              fullWidth
              label="Vencimiento Revisión Técnica"
              name="vencimientoRevisionTecnica"
              type="date"
              value={formData.vencimientoRevisionTecnica}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Vencimiento Seguro de Terceros */}
            <TextField
              fullWidth
              label="Vencimiento Seguro de Terceros"
              name="vencimientoSeguroTerceros"
              type="date"
              value={formData.vencimientoSeguroTerceros}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Botón de envío */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#CC1818',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
                '&:hover': { 
                  backgroundColor: '#b91c1c',
                  boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)',
                },
              }}
            >
              Registrar Transporte
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarTransporte
