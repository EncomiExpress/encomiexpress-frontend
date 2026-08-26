import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Box, Typography, Stepper, Step, StepLabel, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { steps, validarPaso, handleChangeAnticipo } from './utils/anticipoValidation.js'
import { usePaquetesPorPar } from './hooks/usePaquetesPorPar.js'
import { useAutoSeleccionParUnico } from './hooks/useAutoSeleccionParUnico.js'
import { stepperSx, backButtonSx, cancelButtonSx, primaryButtonSx } from './style/wizardStyles.js'
import PasoRutaVehiculo from './components/wizard/PasoRutaVehiculo.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarAnticipoExcedente = ({ open, onClose, onSuccess }) => {
    const { agregarAnticipo, rutas } = useAnticipos()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [rutaInput, setRutaInput] = useState('')
    const [parInput, setParInput] = useState('')

    const formInicial = {
        idRuta: '',
        idRutaVehiculoConductor: '',
        valorAnticipo: '',
        fechaEntrega: '',
    }

    const [form, setForm] = useState(formInicial)

    const paquetesPorPar = usePaquetesPorPar(form.idRuta)
    useAutoSeleccionParUnico(form.idRuta, rutas, setForm, setParInput)

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(formInicial)
        setErrores({})
        setActiveStep(0)
        setRutaInput('')
        setParInput('')
        onClose()
    }

    const handleChange = (e) => handleChangeAnticipo(e, form, setForm, setErrores)

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        const erroresEncontrados = validarPaso(activeStep, form)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }

        setSubmitting(true)
        try {
            await agregarAnticipo(form)
            showToast('¡Anticipo registrado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: getErrorMessage(err, 'Error al registrar el anticipo.') })
        } finally {
            setSubmitting(false)
        }
    }

    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form.idRuta))
    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    const parSeleccionado = pares.find(p => p.idRutaVehiculoConductor === parseInt(form.idRutaVehiculoConductor))

    const getNombreConductor = () => parSeleccionado?.conductorNombre || '—'

    const getEtiquetaRuta = (r) => {
        if (!r) return '—'
        const destinoTxt = r.destino ? `${r.destino.ciudad}` : 'Sin destino'
        const tarifa = r.destino?.tarifaBase != null ? ` — $${Number(r.destino.tarifaBase).toLocaleString('es-CO')}` : ''
        return `${r.nombre} → ${destinoTxt}${tarifa}`
    }

    const getNombreRuta = (id) => getEtiquetaRuta(rutas.find(r => r.idRuta === parseInt(id)))

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoRutaVehiculo
                        theme={theme} form={form} errores={errores} setErrores={setErrores} setForm={setForm} handleChange={handleChange}
                        rutas={rutas} rutaSeleccionada={rutaSeleccionada} pares={pares} parSeleccionado={parSeleccionado} paquetesPorPar={paquetesPorPar}
                        rutaInput={rutaInput} setRutaInput={setRutaInput} parInput={parInput} setParInput={setParInput}
                        getEtiquetaRuta={getEtiquetaRuta}
                        parDisabled={!form.idRuta}
                        rutaHelperTextOk="Busca por origen o destino"
                        mostrarAdvertencia={!!(parSeleccionado && !(paquetesPorPar[parSeleccionado.idRutaVehiculoConductor] > 0))}
                    />
                )

            case 1:
                return (
                    <PasoConfirmacion
                        theme={theme} errorSubmit={errores.submit} esEdicion={false}
                        nombreRuta={getNombreRuta(form.idRuta)}
                        placa={parSeleccionado?.placa} nombreConductor={getNombreConductor()}
                        valorAnticipo={form.valorAnticipo}
                        fechaEntrega={form.fechaEntrega || '—'}
                    />
                )

            default:
                return null
        }
    }

    const totalSteps = steps.length

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>

            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Anticipo / Excedente</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Ingresa los datos del anticipo para el conductor.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={stepperSx(theme)}>
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
                        onClick={activeStep < totalSteps - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        endIcon={submitting ? undefined : (activeStep < totalSteps - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={primaryButtonSx(theme, { minWidth: 160 })}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < totalSteps - 1 ? 'Siguiente' : 'Registrar')
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default RegistrarAnticipoExcedente
