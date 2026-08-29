import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { steps, validarPaso, handleChangeAnticipo } from './utils/anticipoValidation.js'
import { usePaquetesPorPar } from './hooks/usePaquetesPorPar.js'
import { useAutoSeleccionParUnico } from './hooks/useAutoSeleccionParUnico.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
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

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Registrar Anticipo / Excedente" subtitle="Ingresa los datos del anticipo para el conductor."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarAnticipoExcedente
