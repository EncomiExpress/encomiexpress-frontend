import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, Stepper, Step, StepLabel, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useDestino } from './context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarMonedaInput } from '../../shared/utils/formatters.js'
import {
    steps, OTRA_CIUDAD, OTRO_DEPARTAMENTO, TARIFA_MAX,
    validarCampo, validarCiudadDuplicada, validarPaso,
} from './utils/destinoValidation.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoUbicacion from './components/wizard/PasoUbicacion.jsx'
import PasoTarifa from './components/wizard/PasoTarifa.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarDestino = ({ open, onClose, onSuccess }) => {
    const { registrarDestino, destinos } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        direccion: '',
        tarifaBase: '',
    })
    // true cuando el usuario eligió "Otra ciudad" en el select y está escribiendo el
    // nombre a mano en vez de elegir una de la lista conocida.
    const [ciudadOtra, setCiudadOtra] = useState(false)
    // true cuando eligió "Otro departamento" -- fuerza también ciudadOtra, porque no
    // hay ninguna lista de ciudades conocida para un departamento fuera de la lista.
    const [departamentoOtro, setDepartamentoOtro] = useState(false)

    const validarCiudadDup = (ciudad) => validarCiudadDuplicada(destinos, ciudad)

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target
        if (name === 'ciudad' || name === 'departamento') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
        }
        if (name === 'tarifaBase') {
            // Solo dígitos — los puntos de miles se muestran solos (formatearMoneda),
            // nunca se escriben a mano. Sin decimales: los valores de tarifa en pesos
            // colombianos no manejan centavos.
            value = limpiarMonedaInput(value)
            const num = parseFloat(value)
            if (!isNaN(num) && num > TARIFA_MAX) return
        }
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => {
            if (!prev[name]) return prev
            if (name === 'ciudad') return { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDup(value) }
            return { ...prev, [name]: validarCampo(name, formActualizado) }
        })
        setApiError(null)
    }

    // Select de Ciudad: elegir un valor real de la lista fija la ciudad tal cual;
    // elegir el sentinel OTRA_CIUDAD abre el campo de texto libre en su lugar.
    const handleCiudadSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRA_CIUDAD) {
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, ciudad: '' }))
        } else {
            setCiudadOtra(false)
            const formActualizado = { ...form, ciudad: value }
            setForm(prev => ({ ...prev, ciudad: value }))
            setErrores(prev => prev.ciudad ? { ...prev, ciudad: validarCampo('ciudad', formActualizado) || validarCiudadDup(value) } : prev)
        }
        setApiError(null)
    }

    // Select de Departamento: elegir un valor real limpia la ciudad (depende del
    // departamento); elegir el sentinel OTRO_DEPARTAMENTO abre el campo de texto libre
    // para el departamento Y fuerza el de ciudad, porque no hay lista conocida para un
    // departamento que no está en la lista.
    const handleDepartamentoSelectChange = (e) => {
        const { value } = e.target
        if (value === OTRO_DEPARTAMENTO) {
            setDepartamentoOtro(true)
            setCiudadOtra(true)
            setForm(prev => ({ ...prev, departamento: '', ciudad: '' }))
        } else {
            setDepartamentoOtro(false)
            setCiudadOtra(false)
            const formActualizado = { ...form, departamento: value, ciudad: '' }
            setForm(prev => ({ ...prev, departamento: value, ciudad: '' }))
            setErrores(prev => ({ ...prev, departamento: prev.departamento ? validarCampo('departamento', formActualizado) : prev.departamento, ciudad: undefined }))
        }
        setApiError(null)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, destinos)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            await registrarDestino({
                departamento: form.departamento,
                ciudad: form.ciudad,
                direccion: form.direccion?.trim() || null,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            showToast('¡Destino registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar el destino'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ departamento: '', ciudad: '', direccion: '', tarifaBase: '' })
        setCiudadOtra(false)
        setDepartamentoOtro(false)
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        onClose()
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoUbicacion
                        theme={theme} form={form} setForm={setForm} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        handleDepartamentoSelectChange={handleDepartamentoSelectChange} handleCiudadSelectChange={handleCiudadSelectChange}
                        validarCiudadDup={validarCiudadDup}
                        ciudadOtra={ciudadOtra} setCiudadOtra={setCiudadOtra}
                        departamentoOtro={departamentoOtro} setDepartamentoOtro={setDepartamentoOtro}
                    />
                )
            case 1:
                return (
                    <PasoTarifa form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={null}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={false} setSinCambios={() => {}}
                    />
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Destino</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 0.5, ml: 0.5 }}>
                        Complete los datos del nuevo destino paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Stepper activeStep={activeStep} alternativeLabel
                    sx={stepperSx(theme)}
                >
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
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={backButtonSx(theme)}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleClose} disableRipple
                        sx={cancelButtonSx(theme)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={primaryButtonSx(theme, { minWidth: 160 })}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : 'Registrar')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarDestino
