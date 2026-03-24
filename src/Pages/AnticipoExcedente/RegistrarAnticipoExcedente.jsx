import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, InputAdornment } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PersonIcon from '@mui/icons-material/Person'
import RouteIcon from '@mui/icons-material/Route'
import EventIcon from '@mui/icons-material/Event'
import NotesIcon from '@mui/icons-material/Notes'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const steps = ['Asignación y Valores', 'Estado y Fechas']

const RegistrarAnticipoExcedente = () => {
  const { agregarAnticipo } = useAnticipos()
  const navigate = useNavigate()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})
  const [activeStep, setActiveStep] = useState(0)

  const [form, setForm] = useState({
    idConductor: '',
    idRuta: '',
    valorAnticipo: '',
    valorGastado: '',
    estado: 'entregado',
    soporte: '',
    fechaEntrega: '',
    fechaLegalizacion: '',
    fechaEntregaExcedente: '',
  })

  // Calcula el excedente en tiempo real
  const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}

    if (!form.idConductor)
      e.idConductor = 'Selecciona un conductor'

    if (!form.idRuta)
      e.idRuta = 'Selecciona una ruta'

    if (!form.valorAnticipo)
      e.valorAnticipo = 'El valor del anticipo es obligatorio'
    else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
      e.valorAnticipo = 'Ingresa un valor válido mayor a 0'

    if (form.valorGastado !== '' && (isNaN(form.valorGastado) || parseFloat(form.valorGastado) < 0))
      e.valorGastado = 'Ingresa un valor válido'

    if (!form.fechaEntrega)
      e.fechaEntrega = 'La fecha de entrega es obligatoria'

    if (!form.estado)
      e.estado = 'Selecciona un estado'

    return e
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()

    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    agregarAnticipo(form)
    setExito(true)
    setTimeout(() => navigate('/anticipos/listar'), 1500)
  }

  const handleCancelar = () => {
    navigate('/anticipos/listar')
  }

  // Validar solo el paso actual
  const validarPaso = (step) => {
    const e = {}
    if (step === 0) {
      if (!form.idConductor) e.idConductor = 'Selecciona un conductor'
      if (!form.idRuta) e.idRuta = 'Selecciona una ruta'
      if (!form.valorAnticipo) e.valorAnticipo = 'El valor del anticipo es obligatorio'
      else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
        e.valorAnticipo = 'Ingresa un valor válido mayor a 0'
    }
    if (step === 1) {
      if (!form.fechaEntrega) e.fechaEntrega = 'La fecha de entrega es obligatoria'
      if (!form.estado) e.estado = 'Selecciona un estado'
    }
    return e
  }

  const handleNext = () => {
    const erroresEncontrados = validarPaso(activeStep)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const formatMoney = (val) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
  }

  // Renderizar contenido del stepper
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FormFieldsContainer>
            <FormSelect
              label="Conductor"
              name="idConductor"
              value={form.idConductor}
              onChange={handleChange}
              error={errores.idConductor}
            >
              {conductoresMock.map(c => (
                <MenuItem key={c.idConductor} value={c.idConductor}>
                  {c.nombre}
                </MenuItem>
              ))}
            </FormSelect>

            <FormSelect
              label="Ruta"
              name="idRuta"
              value={form.idRuta}
              onChange={handleChange}
              error={errores.idRuta}
            >
              {rutasMock.map(r => (
                <MenuItem key={r.idRuta} value={r.idRuta}>
                  {r.nombre}
                </MenuItem>
              ))}
            </FormSelect>

            <FormField
              label="Valor del anticipo"
              name="valorAnticipo"
              type="number"
              value={form.valorAnticipo}
              onChange={handleChange}
              required
              placeholder="Ej: 500000"
              error={errores.valorAnticipo}
              helperText={errores.valorAnticipo}
              icon={AttachMoneyIcon}
            />

            <FormField
              label="Valor gastado"
              name="valorGastado"
              type="number"
              value={form.valorGastado}
              onChange={handleChange}
              placeholder="Ej: 350000"
              error={errores.valorGastado}
              helperText={errores.valorGastado || 'Diligenciar al legalizar'}
              icon={AttachMoneyIcon}
            />

            {/* Tarjeta de excedente calculado */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: excedente >= 0 ? '#E8F5E9' : '#FFF3F3',
                border: `1px solid ${excedente >= 0 ? '#A5D6A7' : '#FFCDD2'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : theme.primary, fontSize: 32 }} />
              <Box>
                <Typography variant="caption" fontWeight={700} color={excedente >= 0 ? '#2E7D32' : theme.primary} textTransform="uppercase" letterSpacing={0.8}>
                  {excedente >= 0 ? 'Excedente a devolver' : 'Faltante (gasto mayor al anticipo)'}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={excedente >= 0 ? '#2E7D32' : theme.primary}>
                  {formatMoney(Math.abs(excedente))}
                </Typography>
              </Box>
            </Box>
          </FormFieldsContainer>
        )
      case 1:
        return (
          <FormFieldsContainer>
            <FormSelect
              label="Estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              error={errores.estado}
            >
              <MenuItem value="entregado">Entregado</MenuItem>
              <MenuItem value="en legalización">En legalización</MenuItem>
              <MenuItem value="legalizado">Legalizado</MenuItem>
              <MenuItem value="excedente pendiente">Excedente pendiente</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
            </FormSelect>

            <FormField
              label="Fecha de entrega"
              name="fechaEntrega"
              type="date"
              value={form.fechaEntrega}
              onChange={handleChange}
              error={errores.fechaEntrega}
              helperText={errores.fechaEntrega}
              icon={EventIcon}
            />

            <FormField
              label="Fecha de legalización"
              name="fechaLegalizacion"
              type="date"
              value={form.fechaLegalizacion}
              onChange={handleChange}
              helperText="Opcional — completar al legalizar"
              icon={EventIcon}
            />

            <FormField
              label="Fecha entrega excedente"
              name="fechaEntregaExcedente"
              type="date"
              value={form.fechaEntregaExcedente}
              onChange={handleChange}
              helperText="Opcional — completar al entregar excedente"
              icon={EventIcon}
            />

            <FormField
              label="Observaciones"
              name="soporte"
              value={form.soporte}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Agrega alguna observación si es necesario..."
              icon={NotesIcon}
            />
          </FormFieldsContainer>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 700, mx: 'auto' }}>
        
        {/* Título con icono */}
        <FormHeader 
          icon={AccountBalanceWalletIcon} 
          title="Registrar Anticipo / Excedente" 
          subtitle="Ingresa los datos del anticipo para el conductor"
        />

        {/* Stepper - 2 pasos */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontWeight: activeStep === index ? 600 : 400,
                    color: activeStep === index ? theme.primary : '#64748b'
                  } 
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderStepContent()}
        </Box>

        {/* Botones de navegación del stepper */}
        <FormButtonGroup justify="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleBack} 
              disabled={activeStep === 0}
              children="Anterior"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton 
              onClick={handleCancelar}
              children="Cancelar"
            />
            {activeStep < steps.length - 1 ? (
              <PrimaryButton 
                onClick={handleNext}
                children="Siguiente"
              />
            ) : (
              <PrimaryButton 
                onClick={handleSubmit}
                children="Registrar"
              />
            )}
          </Box>
        </FormButtonGroup>
      </Paper>
    </Box>
  )
}

export default RegistrarAnticipoExcedente
