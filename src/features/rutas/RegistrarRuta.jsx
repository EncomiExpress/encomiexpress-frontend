import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, TextField, Autocomplete } from '@mui/material'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { useRuta } from './context/RutaContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { FormField } from '../../shared/components/FormularioEstandarizado.jsx'
import NacionSVG from '../../shared/components/NacionSVG.jsx'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../shared/utils/duplicados.js'
import { filtrarObservacionesRuta } from '../../shared/validations/observacionesRutaValidation.js'
import { MUNICIPIO_ORIGEN } from '../../shared/config/negocio.js'
import { steps, validarCampo, validarPaso, validarDestinoDuplicado } from './validations/rutaValidation.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'

// Plantilla de Ruta — formulario de una sola pantalla (no hace falta un wizard
// de varios pasos: son 3 campos). Se reutiliza WizardDialog con un único paso
// para mantener el mismo look & feel que el resto de los módulos (Registrar
// Destino, Registrar Cliente, etc.).
const RegistrarRuta = ({ open, onClose, onSuccess }) => {
    const { registrarRuta, rutas } = useRuta()
    const { getDestinosHabilitados } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()

    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [destinoInput, setDestinoInput] = useState('')

    const [form, setForm] = useState({ idDestino: '', observaciones: '' })

    const destinos = getDestinosHabilitados()
    const destinoSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestino)) || null

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'observaciones') value = filtrarObservacionesRuta(value)
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(0, form, rutas)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setSubmitting(true)
        setApiError(null)
        try {
            await registrarRuta({
                idDestino: parseInt(form.idDestino),
                observaciones: form.observaciones?.trim() || null,
            })
            showToast('¡Ruta registrada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ idDestino: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setDestinoInput('')
        onClose?.()
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Registrar Ruta" subtitle="Crea una plantilla reutilizable de corredor (Medellín → destino)."
            steps={steps} activeStep={0}
            onBack={() => {}} onNext={() => {}} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {apiError && (
                    <Typography variant="body2" color="error" sx={{ px: 0.5 }}>{apiError}</Typography>
                )}
                {/* Solo lectura: toda ruta sale de la oficina principal, no es un dato
                    propio de la plantilla -- mismo campo (deshabilitado) que ya se
                    muestra en el wizard de Salidas. */}
                <FormField label="Origen" name="origen" value={MUNICIPIO_ORIGEN}
                    disabled
                    icon={RouteOutlinedIcon}
                    helperText="Toda ruta sale de Medellín (oficina principal)" />

                <Autocomplete
                    options={destinos}
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    getOptionLabel={(d) => `${d.municipio} - ${d.departamento}`}
                    isOptionEqualToValue={(opt, val) => opt.idDestino === val.idDestino}
                    value={destinoSeleccionado}
                    inputValue={destinoInput}
                    onInputChange={(_, newVal, reason) => {
                        if (reason === 'input') setDestinoInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
                        else setDestinoInput(newVal)
                    }}
                    onChange={(_, val) => {
                        const idDestino = val ? val.idDestino : ''
                        handleChange({ target: { name: 'idDestino', value: idDestino } })
                        setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', { ...form, idDestino }) || validarDestinoDuplicado(rutas, idDestino) }))
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', form) || validarDestinoDuplicado(rutas, form.idDestino) }))}
                    renderOption={(props, d) => {
                        const { key, ...rest } = props
                        return (
                            <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 28, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <NacionSVG color={theme.palette.primary.main} />
                                </Box>
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>{d.municipio}</Typography>
                                <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>{d.departamento}</Typography>
                            </Box>
                        )
                    }}
                    filterOptions={(opts, { inputValue }) => {
                        if (!inputValue.trim()) return [...opts].sort((a, b) => b.idDestino - a.idDestino).slice(0, 5)
                        const q = normalizarTexto(inputValue)
                        return opts.filter(d =>
                            normalizarTexto(d.nombre || '').includes(q) ||
                            normalizarTexto(d.municipio || '').includes(q) ||
                            normalizarTexto(d.departamento || '').includes(q)
                        )
                    }}
                    noOptionsText="No se encontraron destinos"
                    renderInput={(params) => (
                        <TextField {...params} label="Destino *"
                            error={!!errores.idDestino} helperText={errores.idDestino || 'Busca por nombre, municipio o departamento'}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 50 } }} sx={formFieldStyles} />
                    )}
                />

                <FormField label="Observaciones (opcional)" name="observaciones" value={form.observaciones}
                    onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form) }))}
                    icon={RouteOutlinedIcon}
                    inputProps={{ maxLength: 500 }} placeholder="Ej: Corredor troncal hacia la costa"
                    multiline rows={3}
                    error={errores.observaciones}
                    helperText={errores.observaciones || `Opcional · ${form.observaciones?.length || 0}/500`} />
            </Box>
        </WizardDialog>
    )
}

export default RegistrarRuta
