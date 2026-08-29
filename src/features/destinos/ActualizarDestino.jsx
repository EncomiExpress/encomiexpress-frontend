import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useDestino } from './context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { limpiarMonedaInput } from '../../shared/utils/formatters.js'
import {
    steps, departamentos, CIUDADES_POR_DEPARTAMENTO, OTRA_CIUDAD, OTRO_DEPARTAMENTO, TARIFA_MAX,
    validarCampo, validarCiudadDuplicada, validarPaso,
} from './utils/destinoValidation.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoUbicacion from './components/wizard/PasoUbicacion.jsx'
import PasoTarifa from './components/wizard/PasoTarifa.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarDestino = ({ open, onClose, destino, onSuccess }) => {
    const { actualizarDestino, destinos } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    const [form, setForm] = useState({
        departamento: '',
        ciudad: '',
        direccion: '',
        tarifaBase: '',
    })
    // true cuando la ciudad del destino no está en la lista conocida para su
    // departamento (o el usuario eligió "Otra ciudad" a mano) -- se detecta también al
    // cargar un destino ya existente, por si su ciudad no está en CIUDADES_POR_DEPARTAMENTO.
    const [ciudadOtra, setCiudadOtra] = useState(false)
    // true cuando el departamento del destino no está en la lista fija (Antioquia/
    // Córdoba) -- fuerza también ciudadOtra, igual que al elegirlo a mano.
    const [departamentoOtro, setDepartamentoOtro] = useState(false)

    useEffect(() => {
        if (destino && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const initial = {
                departamento: destino.departamento || '',
                ciudad: destino.ciudad || '',
                direccion: destino.direccion || '',
                // destino.tarifaBase llega como string desde el backend por ser una columna
                // DECIMAL (ej. "10000.00") — se limpia a un entero plano ("10000") para que
                // nunca se vea ".00" en el campo ni en la comparación de cambios.
                tarifaBase: destino.tarifaBase !== undefined && destino.tarifaBase !== null
                    ? String(Math.round(Number(destino.tarifaBase)))
                    : '',
            }
            setForm(initial)
            setOriginalData(initial)
            const esDeptoConocido = departamentos.includes(initial.departamento)
            setDepartamentoOtro(!!initial.departamento && !esDeptoConocido)
            const ciudadesConocidas = CIUDADES_POR_DEPARTAMENTO[initial.departamento] || []
            setCiudadOtra(!esDeptoConocido || (!!initial.ciudad && !ciudadesConocidas.includes(initial.ciudad)))
        }
    }, [destino, open])

    const validarCiudadDup = (ciudad) => validarCiudadDuplicada(destinos, ciudad, destino?.idDestino)

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
        setSinCambios(false)
    }

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
        setSinCambios(false)
    }

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
        setSinCambios(false)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, destinos, destino?.idDestino)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        if (originalData) {
            const hayCambios = Object.keys(form).some(key => String(form[key]) !== String(originalData[key]))
            if (!hayCambios) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            await actualizarDestino({
                idDestino: destino.idDestino,
                departamento: form.departamento,
                ciudad: form.ciudad,
                direccion: form.direccion?.trim() || null,
                tarifaBase: Number(form.tarifaBase) || 0,
            })
            showToast('¡Destino actualizado exitosamente!', 'success')
            setTimeout(() => {
                handleClose()
                onSuccess?.()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el destino'))
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
        setSinCambios(false)
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
                        theme={theme} form={form} formOriginal={originalData}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
                    />
                )
            default:
                return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Editar Destino"
            subtitle={originalData?.ciudad ? `Modificando: ${originalData.ciudad}, ${originalData.departamento}` : 'Modifica los campos que necesites.'}
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default ActualizarDestino
