import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { LocationOn, Phone, Person, Business } from '@mui/icons-material'
import { useDestino } from '../../Context/DestinoContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const ActualizarDestino = ({ open, onClose, destino, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    contacto: '',
    estado: 'Activo'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
    
  const { getDestinoById, actualizarDestino } = useDestino()

  useEffect(() => {
    if (destino) {
      setFormData({
        nombre: destino.nombre || '',
        direccion: destino.direccion || '',
        ciudad: destino.ciudad || '',
        departamento: destino.departamento || '',
        telefono: destino.telefono || '',
        contacto: destino.contacto || '',
        estado: destino.estado || 'Activo'
      })
    }
    setLoading(false)
  }, [destino])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.nombre || !formData.direccion || !formData.ciudad || !formData.departamento || !formData.telefono) {
      setError('Los campos marcados con * son requeridos')
      return
    }

    try {
      actualizarDestino({
        idDestino: destino.idDestino,
        ...formData,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
        telefono: formData.telefono.trim(),
        contacto: formData.contacto ? formData.contacto.trim() : ''
      })
      setSuccess('Destino actualizado correctamente')
      
      setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError('Error al actualizar destino')
    }
  }

  const handleCancelar = () => onClose()

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

  const estados = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' }
  ]

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 4, textAlign: 'center' } } }}>
        <Typography>Cargando...</Typography>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>Actualizar Destino</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <FormHeader 
            icon={LocationOn} 
            title="Actualizar Destino" 
            subtitle="Modifica los datos del destino"
          />

          {error && (
            <FormAlert>
              {error}
            </FormAlert>
          )}

          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormField
                label="Nombre del Destino"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Terminal de Medellín"
                icon={LocationOn}
              />

              <FormField
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                placeholder="Ej: Cra 50 #30-25"
                icon={Business}
              />

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

              <FormField
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                required
                placeholder="Ej: Medellín"
                icon={LocationOn}
              />

              <FormField
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ej: 6041234567"
                icon={Phone}
              />

              <FormField
                label="Persona de Contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                icon={Person}
              />

              <FormSelect
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>{estado.label}</MenuItem>
                ))}
              </FormSelect>
            </FormGrid>

            <FormButtonGroup justify="space-between">
              <Box sx={{ display: 'flex', gap: 2 }}>
                <SecondaryButton 
                  onClick={handleCancelar}
                  children="Cancelar"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <PrimaryButton 
                  type="submit"
                  children="Actualizar Destino"
                />
              </Box>
            </FormButtonGroup>
          </form>
        </Paper>
      </DialogContent>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess('')}>
          ¡Destino actualizado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ActualizarDestino