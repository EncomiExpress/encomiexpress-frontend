import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Paper, MenuItem, Select, Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import { Route, DirectionsCar, Person, LocationOn, Event, Schedule } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'
import { 
  FormField, FormSelect, PrimaryButton, SecondaryButton, FormButtonGroup, FormGrid 
} from '../../Components/FormularioEstandarizado'

const COLORS = {
  primary: '#CC1818',
  primaryLight: '#FFE8E8',
  text: '#1a0e0c',
  textMuted: '#8A94A6',
  border: '#E0E0E0',
}

const RegistrarRutaProgramacion = ({ open, onClose, onSuccess }) => {
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

  const [vehiculos, setVehiculos] = useState([])
  const [conductores, setConductores] = useState([])
  const [destinos, setDestinos] = useState([])

  useEffect(() => {
    setVehiculos(getTransportesHabilitados())
    setConductores(getConductoresHabilitados())
    setDestinos(getDestinosHabilitados())
  }, [getTransportesHabilitados, getConductoresHabilitados, getDestinosHabilitados])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
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
    setError('')
    setSuccess('')
    if (onClose) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
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
      
      setTimeout(() => {
        handleClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError('Error al registrar ruta')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Route sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Programar Ruta</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 3, overflow: 'hidden' }}>
          {error && (
            <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}`, backgroundColor: '#FFF5F5' }}>
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormField
                  label="Nombre de la Ruta"
                  name="nombreRuta"
                  value={formData.nombreRuta}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Ruta Medellín - Bogotá"
                  icon={Route}
                />

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

                <FormField
                  label="Fecha de Salida"
                  name="fechaSalida"
                  type="date"
                  value={formData.fechaSalida}
                  onChange={handleChange}
                  required
                  icon={Event}
                />

                <FormField
                  label="Hora de Salida"
                  name="horaSalida"
                  type="time"
                  value={formData.horaSalida}
                  onChange={handleChange}
                  required
                  icon={Schedule}
                />

                <FormField
                  label="Hora Estimada de Llegada"
                  name="horaLlegadaEstimada"
                  type="time"
                  value={formData.horaLlegadaEstimada}
                  onChange={handleChange}
                  icon={Schedule}
                />

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

              <FormButtonGroup justify="space-between">
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <SecondaryButton 
                    onClick={handleClose}
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
      </DialogContent>
    </Dialog>
  )
}

export default RegistrarRutaProgramacion