import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { steps, validarPaso, handleChangeAnticipo } from './validations/anticipoValidation.js'
import { usePaquetesPorPar } from './hooks/usePaquetesPorPar.js'
import { useAutoSeleccionParUnico } from './hooks/useAutoSeleccionParUnico.js'
import { useAnticiposActivos } from './hooks/useAnticiposActivos.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoRutaVehiculo from './components/wizard/PasoRutaVehiculo.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const RegistrarAnticipoExcedente = ({ open, onClose, onSuccess }) => {
    const { agregarAnticipo, rutas, fetchRutasProgramadas } = useAnticipos()
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

    // "rutas" (del contexto) solo se carga una vez por sesión — si una ruta se editó en
    // otra pantalla (ej. se le reasignó el conductor a un par) mientras el usuario seguía
    // logueado, este wizard vería la versión vieja sin este refresco al abrir.
    useEffect(() => {
        if (open) fetchRutasProgramadas({ limit: 1000 })
    }, [open, fetchRutasProgramadas])

    const { paquetesPorPar, loading: cargandoPaquetesPorPar } = usePaquetesPorPar(form.idRuta)
    const { filtrarRutasDisponibles, filtrarParesDisponibles } = useAnticiposActivos()

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(formInicial)
        setErrores({})
        setActiveStep(0)
        setRutaInput('')
        setParInput('')
        onClose()
    }

    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form.idRuta))
    // Rutas donde ya no queda ningún par vehículo-conductor sin anticipo activo no se
    // ofrecen en el buscador — si a la ruta le queda al menos un par disponible, se
    // sigue mostrando igual.
    const rutasDisponibles = filtrarRutasDisponibles(rutas)

    const handleChange = (e) => handleChangeAnticipo(e, form, setForm, setErrores, { rutaSeleccionada })

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, rutaSeleccionada)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        // Se llama desde el último paso ("Confirmación", sin campos propios) —
        // validar con `validarPaso(activeStep, form)` acá era en la práctica un
        // no-op (siempre devolvía {}). Revalida el único paso con contenido (0)
        // sin importar en qué paso esté — ver LOGICA.md.
        const erroresEncontrados = validarPaso(0, form, rutaSeleccionada)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(0)
            return
        }

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

    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    // Del select de "Vehículo y conductor" solo se ofrecen los pares que todavía no
    // tienen anticipo activo — los que ya tienen uno no aparecen, ni deshabilitados.
    const paresDisponibles = filtrarParesDisponibles(pares, rutaSeleccionada?.idRuta)
    const parSeleccionado = paresDisponibles.find(p => p.idRutaVehiculoConductor === parseInt(form.idRutaVehiculoConductor))

    useAutoSeleccionParUnico(form.idRuta, paresDisponibles, setForm, setParInput)

    const getNombreConductor = () => parSeleccionado?.conductorNombre || '—'

    const getEtiquetaRuta = (r) => {
        if (!r) return '—'
        const destinoTxt = r.destino ? `${r.destino.municipio}` : 'Sin destino'
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
                        rutas={rutasDisponibles} rutaSeleccionada={rutaSeleccionada} pares={paresDisponibles} parSeleccionado={parSeleccionado} paquetesPorPar={paquetesPorPar}
                        rutaInput={rutaInput} setRutaInput={setRutaInput} parInput={parInput} setParInput={setParInput}
                        getEtiquetaRuta={getEtiquetaRuta}
                        parDisabled={!form.idRuta}
                        rutaHelperTextOk="Busca por origen o destino"
                        parHelperTextDisabled="Selecciona primero una ruta"
                        mostrarAdvertencia={!!(!cargandoPaquetesPorPar && parSeleccionado && !(paquetesPorPar[parSeleccionado.idRutaVehiculoConductor] > 0))}
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
