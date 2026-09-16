import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Autocomplete } from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
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
import { steps, validarCampo, validarPaso } from './validations/rutaValidation.js'
import { getRutaLabel } from './utils/rutaResolvers.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'

const ActualizarRuta = ({ open, onClose, ruta, onSuccess }) => {
    const { actualizarRuta } = useRuta()
    const { getDestinosHabilitados } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()

    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [destinoInput, setDestinoInput] = useState('')

    const [form, setForm] = useState({ idDestino: '', observaciones: '' })

    const destinos = getDestinosHabilitados()

    useEffect(() => {
        if (ruta && open) {
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const datos = {
                idDestino: ruta.idDestino || '',
                observaciones: ruta.observaciones || '',
            }
            setForm(datos)
            setOriginalData(datos)
            const d = destinos.find(x => x.idDestino === ruta.idDestino) || ruta.destino
            setDestinoInput(d ? `${d.municipio} - ${d.departamento}` : '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr al abrir con una ruta nueva
    }, [ruta, open])

    // Respaldo por si el destino ya fue inhabilitado desde que se creó esta ruta —
    // mismo criterio que ActualizarDestino/ActualizarRutaProgramacion.
    const destinoSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestino)) || (
        ruta?.destino && parseInt(form.idDestino) === ruta.idDestino
            ? { idDestino: ruta.idDestino, municipio: ruta.destino.municipio, departamento: ruta.destino.departamento }
            : null
    )

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'observaciones') value = filtrarObservacionesRuta(value)
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(0, form)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }

        if (originalData) {
            const hayCambios = Object.keys(form).some(key => String(form[key] ?? '') !== String(originalData[key] ?? ''))
            if (!hayCambios) { setSinCambios(true); return }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            const { message } = await actualizarRuta({
                idRuta: ruta.idRuta,
                idDestino: parseInt(form.idDestino),
                observaciones: form.observaciones?.trim() || null,
            })
            showToast(message || '¡Ruta actualizada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ idDestino: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setOriginalData(null)
        setSinCambios(false)
        setDestinoInput('')
        onClose?.()
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Editar Ruta"
            subtitle={ruta ? `Modificando: ${getRutaLabel(ruta)}` : 'Modifica los campos que necesites.'}
            steps={steps} activeStep={0}
            onBack={() => {}} onNext={() => {}} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {apiError && (
                    <Typography variant="body2" color="error" sx={{ px: 0.5 }}>{apiError}</Typography>
                )}
                {sinCambios && (
                    <Typography variant="body2" color="warning.main" sx={{ px: 0.5 }}>No has realizado ningún cambio.</Typography>
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
                    onChange={(_, val) => handleChange({ target: { name: 'idDestino', value: val ? val.idDestino : '' } })}
                    onBlur={() => setErrores(prev => ({ ...prev, idDestino: validarCampo('idDestino', form) }))}
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
                    inputProps={{ maxLength: 500 }} placeholder="Ej: Corredor con parada habitual en Zaragoza"
                    multiline rows={3}
                    error={errores.observaciones}
                    helperText={errores.observaciones || `Opcional · ${form.observaciones?.length || 0}/500`} />
            </Box>
        </WizardDialog>
    )
}

export default ActualizarRuta
