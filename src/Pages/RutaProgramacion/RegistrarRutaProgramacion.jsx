import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from '@mui/material'
import { Route, DirectionsCar, Person, LocationOn, Event, Schedule } from '@mui/icons-material'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const RegistrarRutaProgramacion = () => {
  const [formData, setFormData] = useState({
    nombreRuta: '',
    idVehiculo: '',
    idConductor: '',
    idDestino: '',
    fechaSalida: '',
    horaSalida: '',
    horaLlegadaEstimada: '',
    observaciones: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
    
  const { registrarRutaProgramada } = useRutaProgramacion()
  const { getTransportesHabilitados } = useTransporte()
  const { getConductoresHabilitados } = useConductor()
  const { getDestinosHabilitados } = useDestino()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [vehiculos, setVehiculos] = useState([])
  const [conductores, setConductores] = useState([])
  const [destinos, setDestinos] = useState([])

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setVehiculos(getTransportesHabilitados())
      setConductores(getConductoresHabilitados())
      setDestinos(getDestinosHabilitados())
    }
  }, [usuario, navigate, getTransportesHabilitados, getConductoresHabilitados, getDestinosHabilitados])

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
    if (!formData.nombreRuta || !formData.idVehiculo || !formData.idConductor || 
        !formData.idDestino || !formData.fechaSalida || !formData.horaSalida) {
      setError('Los campos marcados con * son requeridos')
      return
    }

    try {
      registrarRutaProgramada({
        ...formData,
        idVehiculo: parseInt(formData.idVehiculo),
        idConductor: parseInt(formData.idConductor),
        idDestino: parseInt(formData.idDestino),
        nombreRuta: formData.nombreRuta.trim(),
        observaciones: formData.observaciones ? formData.observaciones.trim() : '',
        estado: 'Programada'
      })
      setSuccess('Ruta programada correctamente')
      
      // Limpiar el formulario
      setFormData({
        nombreRuta: '',
        idVehiculo: '',
        idConductor: '',
        idDestino: '',
        fechaSalida: '',
        horaSalida: '',
        horaLlegadaEstimada: '',
        observaciones: ''
      })
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/rutas')
      }, 2000)
    } catch (err) {
      setError('Error al registrar ruta')
    }
  }

  return (
    <Box sx={{ p: 3.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1a0e0c">Programar Ruta</Typography>
        <Typography variant="body2" color="#8A94A6" mt={0.3}>
          Registra una nueva ruta programada
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 3, overflow: 'hidden' }}>
        {error && (
          <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0', backgroundColor: '#FFF5F5' }}>
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        )}

        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <FormGrid>
            {/* Nombre de la Ruta */}
            <FormField
              label="Nombre de la Ruta"
              name="nombreRuta"
              value={formData.nombreRuta}
              onChange={handleChange}
              required
              placeholder="Ej: Ruta Medellín - Bogotá"
              icon={Route}
            />

            {/* Vehículo */}
            <FormSelect
              label="Vehículo"
              name="idVehiculo"
              value={formData.idVehiculo}
              onChange={handleChange}
              required
            >
              {vehiculos.map((v) => (
                <MenuItem key={v.idVehiculo} value={v.idVehiculo}>{v.placa} - {v.marca} {v.modelo}</MenuItem>
              ))}
            </FormSelect>

            {/* Conductor */}
            <FormSelect
              label="Conductor"
              name="idConductor"
              value={formData.idConductor}
              onChange={handleChange}
              required
            >
              {conductores.map((c) => (
                <MenuItem key={c.idConductor} value={c.idConductor}>{c.nombre} {c.apellido}</MenuItem>
              ))}
            </FormSelect>

            {/* Destino */}
            <FormSelect
              label="Destino"
              name="idDestino"
              value={formData.idDestino}
              onChange={handleChange}
              required
            >
              {destinos.map((d) => (
                <MenuItem key={d.idDestino} value={d.idDestino}>{d.nombre} - {d.ciudad}</MenuItem>
              ))}
            </FormSelect>

            {/* Fecha de Salida */}
            <FormField
              label="Fecha de Salida"
              name="fechaSalida"
              type="date"
              value={formData.fechaSalida}
              onChange={handleChange}
              required
              icon={Event}
            />

            {/* Hora de Salida */}
            <FormField
              label="Hora de Salida"
              name="horaSalida"
              type="time"
              value={formData.horaSalida}
              onChange={handleChange}
              required
              icon={Schedule}
            />

            {/* Hora Estimada de Llegada */}
            <FormField
              label="Hora Estimada de Llegada"
              name="horaLlegadaEstimada"
              type="time"
              value={formData.horaLlegadaEstimada}
              onChange={handleChange}
              icon={Schedule}
            />

            {/* Observaciones */}
            <FormField
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Ej: Salida por puerta norte"
              multiline
              rows={2}
            />
          </FormGrid>

          {/* Botones de navegación */}
          <FormButtonGroup justify="space-between">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SecondaryButton 
                onClick={() => navigate('/transporte/rutas')}
                children="Cancelar"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <PrimaryButton 
                type="submit"
                children="Programar Ruta"
              />
            </Box>
            </FormButtonGroup>
          </form>
        </Box>
      </Paper>

      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setSuccess('')}>
          ¡Ruta programada exitosamente!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RegistrarRutaProgramacion
