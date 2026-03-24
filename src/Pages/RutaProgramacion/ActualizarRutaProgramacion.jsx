import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { Route, DirectionsCar, Person, LocationOn, Event, Schedule } from '@mui/icons-material'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const ActualizarRutaProgramacion = () => {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    nombreRuta: '',
    idVehiculo: '',
    idConductor: '',
    idDestino: '',
    fechaSalida: '',
    horaSalida: '',
    horaLlegadaEstimada: '',
    observaciones: '',
    estado: 'Programada'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
    
  const { getRutaProgramadaById, actualizarRutaProgramada } = useRutaProgramacion()
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

  useEffect(() => {
    if (id) {
      const ruta = getRutaProgramadaById(id)
      if (ruta) {
        setFormData({
          nombreRuta: ruta.nombreRuta || '',
          idVehiculo: ruta.idVehiculo || '',
          idConductor: ruta.idConductor || '',
          idDestino: ruta.idDestino || '',
          fechaSalida: ruta.fechaSalida || '',
          horaSalida: ruta.horaSalida || '',
          horaLlegadaEstimada: ruta.horaLlegadaEstimada || '',
          observaciones: ruta.observaciones || '',
          estado: ruta.estado || 'Programada'
        })
      } else {
        setError('Ruta no encontrada')
      }
    }
    setLoading(false)
  }, [id, getRutaProgramadaById])

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
      actualizarRutaProgramada({
        idRutaProgramada: parseInt(id),
        ...formData,
        idVehiculo: parseInt(formData.idVehiculo),
        idConductor: parseInt(formData.idConductor),
        idDestino: parseInt(formData.idDestino),
        nombreRuta: formData.nombreRuta.trim(),
        observaciones: formData.observaciones ? formData.observaciones.trim() : ''
      })
      setSuccess('Ruta actualizada correctamente')
      
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/transporte/rutas')
      }, 2000)
    } catch (err) {
      setError('Error al actualizar ruta')
    }
  }

  const estados = [
    { value: 'Programada', label: 'Programada' },
    { value: 'En Curso', label: 'En Curso' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ]

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>
        <FormHeader 
          icon={Route} 
          title="Actualizar Ruta Programada" 
          subtitle="Modifica los datos de la ruta"
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

            {/* Estado */}
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

          <FormField
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Ej: Salida por puerta norte"
            multiline
            rows={2}
          />

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
                children="Actualizar Ruta"
              />
            </Box>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default ActualizarRutaProgramacion
