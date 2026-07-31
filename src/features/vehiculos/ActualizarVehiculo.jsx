import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, TextField, Autocomplete, InputAdornment, CircularProgress, Avatar } from '@mui/material'
import {
  DirectionsCarOutlined, BadgeOutlined, SellOutlined, InvertColorsOutlined,
  EventOutlined, SpeedOutlined, SaveOutlined, ArrowBackOutlined, ArrowForwardOutlined, Close, EditOutlined,
  DescriptionOutlined, KeyboardArrowDownOutlined
} from '@mui/icons-material'
import { useVehiculo } from '../../shared/contexts/VehiculoContext.jsx'
import { usePropietario } from '../../shared/contexts/PropietarioContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import { normalizarTexto, hayDocumentoDuplicado, MENSAJE_PLACA_DUPLICADA } from '../../shared/utils/duplicados.js'
import * as vehiculoService from '../../shared/services/vehiculoService.js'
import { limpiarDecimalInput } from '../../shared/utils/formatters.js'

const steps = ['Datos del Vehículo', 'Documentación', 'Confirmación']

const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Otro']
// La placa se guarda siempre sin guion (6 caracteres alfanuméricos) — el guion que se ve
// en el campo es solo un formato visual mientras se escribe, igual que el punto decorativo
// que ya se usa en los chips de Listar/Consultar (ver PlacaDisplay en ListarVehiculo.jsx).
const formatearPlaca = (raw) => {
  const limpio = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  return limpio.length > 3 ? `${limpio.slice(0, 3)}-${limpio.slice(3)}` : limpio
}
const PLACA_REGEX = /^[A-Z]{3}[0-9]{3}$/
// Placa colombiana estándar: 3 letras + 3 números. Filtra letra por letra según la
// posición (no solo alfanumérico general) para que no se pueda ni siquiera escribir
// un número en las primeras 3 posiciones ni una letra en las últimas 3.
const limpiarPlacaInput = (value) => {
  const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').split('')
  let resultado = ''
  for (const c of chars) {
    if (resultado.length >= 6) break
    if (resultado.length < 3) { if (/[A-Z]/.test(c)) resultado += c }
    else { if (/[0-9]/.test(c)) resultado += c }
  }
  return resultado
}
const CAPACIDAD_MAX = 999999

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). Sin chequeo de "fecha anterior
// a hoy" en los vencimientos — a diferencia de RegistrarVehiculo.jsx, aquí no aplica:
// no tiene sentido bloquear la edición de un vehículo cuyo documento ya venció.
const validarCampo = (name, formData) => {
  switch (name) {
    case 'placa':
      if (!formData.placa?.trim()) return 'La placa es obligatoria'
      if (!PLACA_REGEX.test(formData.placa)) return 'La placa debe tener 3 letras seguidas de 3 números'
      return ''
    case 'marca':
      return formData.marca?.trim() ? '' : 'La marca es obligatoria'
    case 'modelo':
      return formData.modelo?.trim() ? '' : 'El modelo es obligatorio'
    case 'color':
      return formData.color?.trim() ? '' : 'El color es obligatorio'
    case 'tipo':
      return formData.tipo ? '' : 'El tipo de vehículo es obligatorio'
    case 'tipoOtro':
      return (formData.tipo === 'Otro' && !formData.tipoOtro?.trim()) ? 'Especifica el tipo de vehículo' : ''
    case 'capacidad':
      if (!formData.capacidad) return 'La capacidad es obligatoria'
      if (parseFloat(formData.capacidad) < 1) return 'La capacidad debe ser de al menos 1 kg'
      if (parseFloat(formData.capacidad) > CAPACIDAD_MAX) return `La capacidad no puede ser mayor a ${CAPACIDAD_MAX.toLocaleString('es-CO')} kg`
      return ''
    case 'idPropietario':
      return formData.idPropietario ? '' : 'El propietario es obligatorio'
    case 'vencimientoSOAT':
      return formData.vencimientoSOAT ? '' : 'La fecha de vencimiento del SOAT es obligatoria'
    case 'vencimientoRevisionTecnica':
      return formData.vencimientoRevisionTecnica ? '' : 'La fecha de vencimiento de la Revisión Técnica es obligatoria'
    case 'vencimientoSeguroTerceros':
      return formData.vencimientoSeguroTerceros ? '' : 'La fecha de vencimiento del Seguro de Terceros es obligatoria'
    default:
      return ''
  }
}

const ActualizarVehiculo = ({ open, onClose, transporte: transporteProp, onSuccess }) => {
  const { getVehiculoById, actualizarVehiculo } = useVehiculo()
  const { showToast } = useToast()
  const theme = useTheme()
  const { propietarios } = usePropietario()

  const [formData, setFormData] = useState({
    idPropietario: '', placa: '', tarjetaPropiedad: '', marca: '', modelo: '', color: '',
    tipo: '', origen: 'Propio', capacidad: '',
    vencimientoSOAT: '', vencimientoRevisionTecnica: '', vencimientoSeguroTerceros: ''
  })
  const [errores, setErrores] = useState({})
  const [apiError, setApiError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [formOriginal, setFormOriginal] = useState(null)
  const [sinCambios, setSinCambios] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [avisoPlacaDuplicada, setAvisoPlacaDuplicada] = useState('')
  const cargado = useRef(false)

  useEffect(() => {
    if (!open) { cargado.current = false; return }
    if (!transporteProp || cargado.current) return
    cargado.current = true
    setActiveStep(0)
    setSinCambios(false)
    setErrores({})
    setApiError('')
    const transporte = getVehiculoById(transporteProp.idVehiculo)
    if (transporte) {
      // Si el tipo guardado no está en la lista fija, es un tipo "personalizado"
      // que se escribió a mano — el select se muestra en "Otro" con ese valor
      // en el campo de texto.
      const esTipoFijo = TIPOS_VEHICULO.includes(transporte.tipo)
      const datos = {
        ...transporte,
        tipo: esTipoFijo ? transporte.tipo : 'Otro',
        tipoOtro: esTipoFijo ? '' : (transporte.tipo || ''),
      }
      setFormData(datos)
      setFormOriginal(datos)
    }
  }, [open, transporteProp, getVehiculoById])

  const handleChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'placa') {
      setAvisoPlacaDuplicada('')
      value = limpiarPlacaInput(value)
    }
    if (name === 'marca') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'modelo') value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s-]/g, '')
    if (name === 'color') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'tipoOtro') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
    if (name === 'capacidad') {
      value = limpiarDecimalInput(value)
      if (value !== '') {
        const num = parseFloat(value)
        if (!isNaN(num) && num > CAPACIDAD_MAX) return
      }
    }

    const formActualizado = { ...formData, [name]: value }
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrores(prev => {
      const siguiente = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
      // Si se corrige el tipo de vehículo, revalida también "tipoOtro" si ya estaba marcado con error
      if (name === 'tipo' && prev.tipoOtro) {
        siguiente.tipoOtro = validarCampo('tipoOtro', formActualizado)
      }
      return siguiente
    })
    setApiError('')
    setSinCambios(false)
  }

  const verificarPlacaDuplicada = async () => {
    if (!formData.placa.trim() || formData.placa.length < 6) {
      setAvisoPlacaDuplicada('')
      return
    }
    try {
      const res = await vehiculoService.getVehiculos(undefined, { q: formData.placa.trim(), limit: 10 })
      if (!res?.success) return
      const duplicado = hayDocumentoDuplicado(res.data, formData.placa, {
        getDoc: (r) => r.placa,
        excludeId: formData.idVehiculo,
        getId: (r) => r.idVehiculo,
      })
      setAvisoPlacaDuplicada(duplicado ? MENSAJE_PLACA_DUPLICADA : '')
      if (duplicado) setErrores(prev => ({ ...prev, placa: MENSAJE_PLACA_DUPLICADA }))
    } catch {
      // Si falla la verificación no bloqueamos el flujo
    }
  }

  const validarPaso = (step) => {
    const e = {}
    if (step === 0) {
      e.placa = validarCampo('placa', formData) || avisoPlacaDuplicada
      e.marca = validarCampo('marca', formData)
      e.modelo = validarCampo('modelo', formData)
      e.color = validarCampo('color', formData)
      e.tipo = validarCampo('tipo', formData)
      e.tipoOtro = validarCampo('tipoOtro', formData)
      e.capacidad = validarCampo('capacidad', formData)
    }
    if (step === 1) {
      e.idPropietario = validarCampo('idPropietario', formData)
      e.vencimientoSOAT = validarCampo('vencimientoSOAT', formData)
      e.vencimientoRevisionTecnica = validarCampo('vencimientoRevisionTecnica', formData)
      e.vencimientoSeguroTerceros = validarCampo('vencimientoSeguroTerceros', formData)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
  }

  const handleNext = () => {
    const e = validarPaso(activeStep)
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setErrores({})
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const cerrar = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    onClose()
  }

  const handleSubmit = async () => {
    if (formOriginal) {
      const hayCambios = Object.keys(formData).some(key => {
        const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
        const actual = formData[key] !== undefined ? String(formData[key]) : ''
        return original !== actual
      })
      if (!hayCambios) { setSinCambios(true); return }
    }
    setSinCambios(false)
    setSubmitting(true)
    try {
      await actualizarVehiculo({
        idVehiculo: parseInt(transporteProp?.idVehiculo),
        ...formData,
        tipo: formData.tipo === 'Otro' ? formData.tipoOtro.trim() : formData.tipo,
        capacidad: parseFloat(formData.capacidad),
        idPropietario: parseInt(formData.idPropietario)
      })
      showToast('¡Vehículo actualizado exitosamente!', 'success')
      setTimeout(() => { cerrar(); if (onSuccess) onSuccess() }, 1500)
    } catch (err) {
      setApiError(getErrorMessage(err, 'Error al actualizar el vehículo'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField label="Placa" name="placa" value={formatearPlaca(formData.placa)} onChange={handleChange}
              onBlur={() => {
                verificarPlacaDuplicada()
                setErrores(prev => ({ ...prev, placa: validarCampo('placa', formData) }))
              }} required
              placeholder="Ej: ABC-123" icon={BadgeOutlined}
              error={errores.placa} helperText={errores.placa}
              inputProps={{ maxLength: 7 }} />
            <FormField label="Marca" name="marca" value={formData.marca} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, marca: validarCampo('marca', formData) }))} required
              placeholder="Ej: Toyota" icon={SellOutlined}
              error={errores.marca} helperText={errores.marca}
              inputProps={{ maxLength: 30 }} />
            <FormField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, modelo: validarCampo('modelo', formData) }))} required
              placeholder="Ej: Hilux" icon={DirectionsCarOutlined}
              error={errores.modelo} helperText={errores.modelo}
              inputProps={{ maxLength: 30 }} />
            <FormField label="Color" name="color" value={formData.color} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, color: validarCampo('color', formData) }))} required
              placeholder="Ej: Blanco" icon={InvertColorsOutlined}
              error={errores.color} helperText={errores.color}
              inputProps={{ maxLength: 20 }} />
            {formData.tipo === 'Otro' ? (
              <TextField
                fullWidth label="Tipo de Vehículo" name="tipoOtro" value={formData.tipoOtro || ''} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, tipoOtro: validarCampo('tipoOtro', formData) }))} required
                placeholder="Escribe el tipo de vehículo"
                error={!!errores.tipoOtro} helperText={errores.tipoOtro || 'Presiona la X para volver a la lista'}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { maxLength: 30 },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFormData(prev => ({ ...prev, tipo: '', tipoOtro: '' }))} edge="end">
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={formFieldStyles}
              />
            ) : (
              <FormSelect label="Tipo de Vehículo" name="tipo" value={formData.tipo} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, tipo: validarCampo('tipo', formData) }))} required
                error={errores.tipo} helperText={errores.tipo}>
                {TIPOS_VEHICULO.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </FormSelect>
            )}
            <FormField label="Capacidad (kg)" name="capacidad" value={formData.capacidad}
              onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, capacidad: validarCampo('capacidad', formData) }))} required placeholder="Ej: 1500" icon={SpeedOutlined}
              error={errores.capacidad} helperText={errores.capacidad}
              inputProps={{ maxLength: 6 }} />
          </Box>
        )
      case 1:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Autocomplete
              options={propietarios.filter(p => p.habilitado !== false)}
              popupIcon={<KeyboardArrowDownOutlined />}
              getOptionLabel={(p) => `${p.nombre} ${p.apellido} — ${p.numeroIdentificacion}`}
              isOptionEqualToValue={(opt, val) => opt.idPropietario === val.idPropietario}
              value={propietarios.find(p => p.idPropietario === formData.idPropietario) || null}
              onChange={(_, val) => handleChange({ target: { name: 'idPropietario', value: val ? val.idPropietario : '' } })}
              onBlur={() => setErrores(prev => ({ ...prev, idPropietario: validarCampo('idPropietario', formData) }))}
              renderOption={(props, p) => {
                const { key, ...rest } = props
                return (
                  <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                      width: 34, height: 34, flexShrink: 0,
                      backgroundColor: theme.palette.avatarDefault.bg,
                      color: theme.palette.avatarDefault.color,
                      fontSize: '0.73rem', fontWeight: 700,
                    }}>
                      {(p.nombre?.[0] || '').toUpperCase()}{(p.apellido?.[0] || '').toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                      {p.nombre} {p.apellido}
                    </Typography>
                    <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                      {p.numeroIdentificacion}
                    </Typography>
                  </Box>
                )
              }}
              filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) {
                  return [...opts].sort((a, b) => b.idPropietario - a.idPropietario).slice(0, 5)
                }
                const q = normalizarTexto(inputValue)
                return opts.filter(p =>
                  normalizarTexto(p.nombre).includes(q) ||
                  normalizarTexto(p.apellido).includes(q) ||
                  normalizarTexto(`${p.nombre} ${p.apellido}`).includes(q) ||
                  normalizarTexto(p.numeroIdentificacion || '').includes(q) ||
                  normalizarTexto(p.telefono || '').includes(q)
                )
              }}
              noOptionsText="No se encontraron propietarios"
              renderInput={(params) => (
                <TextField {...params} label="Propietario *"
                  error={!!errores.idPropietario} helperText={errores.idPropietario || 'Busca por documento, nombre, apellido o teléfono'}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 80 } }}
                  sx={formFieldStyles} />
              )}
            />
            <FormField label="Tarjeta de propiedad" name="tarjetaPropiedad" value={formData.tarjetaPropiedad}
              onChange={handleChange} icon={DescriptionOutlined}
              inputProps={{ maxLength: 50 }} placeholder="Ej: TC-001-2020"
              helperText="Opcional" />
            <FormSelect label="Origen" name="origen" value={formData.origen} onChange={handleChange} required>
              <MenuItem value="Propio">Propio</MenuItem>
              <MenuItem value="Tercerizado">Tercerizado</MenuItem>
            </FormSelect>
            <FormField label="Vencimiento SOAT" name="vencimientoSOAT" type="date"
              value={formData.vencimientoSOAT} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, vencimientoSOAT: validarCampo('vencimientoSOAT', formData) }))} required icon={EventOutlined}
              error={errores.vencimientoSOAT} helperText={errores.vencimientoSOAT} />
            <FormField label="Vencimiento Revisión Técnica" name="vencimientoRevisionTecnica" type="date"
              value={formData.vencimientoRevisionTecnica} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, vencimientoRevisionTecnica: validarCampo('vencimientoRevisionTecnica', formData) }))} required icon={EventOutlined}
              error={errores.vencimientoRevisionTecnica} helperText={errores.vencimientoRevisionTecnica} />
            <FormField label="Vencimiento Seguro de Terceros" name="vencimientoSeguroTerceros" type="date"
              value={formData.vencimientoSeguroTerceros} onChange={handleChange}
              onBlur={() => setErrores(prev => ({ ...prev, vencimientoSeguroTerceros: validarCampo('vencimientoSeguroTerceros', formData) }))} required icon={EventOutlined}
              error={errores.vencimientoSeguroTerceros} helperText={errores.vencimientoSeguroTerceros} />
          </Box>
        )
      case 2: {
        const getNombrePropietario = (id) => {
          const p = propietarios.find(p => p.idPropietario === id)
          return p ? `${p.nombre} ${p.apellido}` : '—'
        }
        const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
        const camposComparados = formOriginal ? [
          [formData.placa, formOriginal.placa],
          [formData.tarjetaPropiedad, formOriginal.tarjetaPropiedad],
          [formData.marca, formOriginal.marca],
          [formData.modelo, formOriginal.modelo],
          [formData.color, formOriginal.color],
          [formData.tipo, formOriginal.tipo],
          [formData.capacidad, formOriginal.capacidad],
          [formData.origen, formOriginal.origen],
          [formData.idPropietario, formOriginal.idPropietario],
          [formData.vencimientoSOAT, formOriginal.vencimientoSOAT],
          [formData.vencimientoRevisionTecnica, formOriginal.vencimientoRevisionTecnica],
          [formData.vencimientoSeguroTerceros, formOriginal.vencimientoSeguroTerceros],
        ] : []
        const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {totalModificados > 0 && (
              <Alert severity="info" icon={<EditOutlined fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                Se {totalModificados === 1 ? 'modificó' : 'modificaron'} {totalModificados} {totalModificados === 1 ? 'campo' : 'campos'}: revísalo{totalModificados === 1 ? '' : 's'} antes de guardar.
              </Alert>
            )}
            {sinCambios && (
              <Alert severity="warning" sx={{ borderRadius: 2 }} onClose={() => setSinCambios(false)}>
                No has realizado ningún cambio. Los datos ya están actualizados.
              </Alert>
            )}
            {apiError && (
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError('')}>{apiError}</Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <DirectionsCarOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem">Datos del Vehículo</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la información del vehículo</Typography>
                <ConfirmRow label="Placa" value={formatearPlaca(formData.placa)} previousValue={formatearPlaca(formOriginal?.placa)} />
                <ConfirmRow label="Marca" value={formData.marca} previousValue={formOriginal?.marca} />
                <ConfirmRow label="Modelo" value={formData.modelo} previousValue={formOriginal?.modelo} />
                <ConfirmRow label="Color" value={formData.color} previousValue={formOriginal?.color} />
                <ConfirmRow label="Tipo" value={formData.tipo === 'Otro' ? formData.tipoOtro : formData.tipo} previousValue={formOriginal ? (formOriginal.tipo === 'Otro' ? formOriginal.tipoOtro : formOriginal.tipo) : undefined} />
                <ConfirmRow label="Capacidad" value={formData.capacidad ? `${formData.capacidad} kg` : ''} previousValue={formOriginal?.capacidad ? `${formOriginal.capacidad} kg` : undefined} />
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, p: 2.5, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <EventOutlined sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                  <Typography fontWeight={700} fontSize="0.95rem">Documentación</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Verifica la documentación</Typography>
                <ConfirmRow label="Propietario" value={getNombrePropietario(formData.idPropietario)} previousValue={formOriginal ? getNombrePropietario(formOriginal.idPropietario) : undefined} />
                <ConfirmRow label="Tarjeta propiedad" value={formData.tarjetaPropiedad || 'N/A'} previousValue={formOriginal?.tarjetaPropiedad || 'N/A'} />
                <ConfirmRow label="Origen" value={formData.origen} previousValue={formOriginal?.origen} />
                <ConfirmRow label="SOAT" value={formData.vencimientoSOAT} previousValue={formOriginal?.vencimientoSOAT} />
                <ConfirmRow label="Revisión Técnica" value={formData.vencimientoRevisionTecnica} previousValue={formOriginal?.vencimientoRevisionTecnica} />
                <ConfirmRow label="Seguro Terceros" value={formData.vencimientoSeguroTerceros} previousValue={formOriginal?.vencimientoSeguroTerceros} />
              </Paper>
            </Box>
          </Box>
        )
      }
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Editar Vehículo</Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {formOriginal?.marca && formOriginal?.modelo
              ? `Modificando datos de ${formOriginal.marca} ${formOriginal.modelo}`
              : 'Modifica los campos que necesites.'
            }
          </Typography>
        </Box>
        <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1.5 }}>
        <Stepper activeStep={activeStep} alternativeLabel
          sx={{
            mb: 3, mt: 2,
            '& .MuiStepIcon-root': { color: theme.palette.divider },
            '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
            '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
            '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
            '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
            '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
            '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
            '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
          }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Box sx={{ px: 4, py: 2 }}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {renderStepContent()}
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
          startIcon={<ArrowBackOutlined />} disableRipple
          sx={{
            textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
            color: theme.palette.text.primary, fontWeight: 500,
            '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
            '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
          }}>
          Anterior
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={cerrar} disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}>
            Cancelar
          </Button>
          <Button
            onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
            variant="contained"
            disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
            endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlined /> : <SaveOutlined />)}
            disableRipple
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
              '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
            }}>
            {submitting
              ? <CircularProgress size={18} color="inherit" />
              : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarVehiculo
