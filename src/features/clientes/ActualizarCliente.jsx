import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useClientes } from './context/ClienteContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico } from '../../shared/utils/documento.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { steps, validarCampo, validarDocumentoCompleto, validarPaso, formatearNit } from './validations/clienteValidation.js'
import { filtrarDireccion } from '../../shared/validations/direccionValidation.js'
import { filtrarCorreo } from '../../shared/validations/emailValidation.js'
import { filtrarTelefono } from '../../shared/validations/telefonoValidation.js'
import { useDuplicadoCliente } from './hooks/useDuplicadoCliente.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContacto from './components/wizard/PasoContacto.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarCliente = ({ open, onClose, cliente: clienteProp, onSuccess }) => {
    const { clientes, loading, actualizarCliente } = useClientes()
    const { getDestinosHabilitados } = useDestino()
    const { showToast } = useToast()
    const theme = useTheme()
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [destinoInput, setDestinoInput] = useState('')
    const cargado = useRef(false)

    const destinos = getDestinosHabilitados()

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        direccion: '',
        idDestino: '',
        habilitado: true
    })

    const {
        avisoNombreDuplicado, avisoDocDuplicado,
        setAvisoNombreDuplicado, setAvisoDocDuplicado,
        verificarDocumentoDuplicado, verificarNombreDuplicado,
    } = useDuplicadoCliente({ form, setErrores, excludeId: form.idCliente })

    useEffect(() => {
        if (!open) { cargado.current = false; return }
        if (loading || !clienteProp || cargado.current) return
        cargado.current = true
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        const cliente = clientes.find(c => c.idCliente === clienteProp.idCliente) || clienteProp
        if (cliente) {
            const datosForm = { ...cliente, email: cliente.email || '' }
            // Normaliza un NIT viejo al formato con guion (ej. "901.234.567-8" o
            // "9012345678" -> "901234567-8"); si le falta el DV queda con 9 dígitos y
            // el usuario lo completa. Mismo criterio que Propietario.
            if (cliente.tipoIdentificacion === 'NIT') datosForm.numeroIdentificacion = formatearNit(cliente.numeroIdentificacion)
            setForm(datosForm)
            setFormOriginal(datosForm)
            const d = getDestinosHabilitados().find(x => x.idDestino === cliente.idDestino)
            setDestinoInput(d ? `${d.municipio} - ${d.departamento}` : (cliente.destino ? `${cliente.destino.municipio} - ${cliente.destino.departamento}` : ''))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- getDestinosHabilitados es estable, no hace falta re-correr por eso
    }, [open, clienteProp, clientes, loading])

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'tipoIdentificacion') {
            setForm(prev => ({ ...prev, tipoIdentificacion: value, numeroIdentificacion: '' }))
            // Al cambiar entre NIT y persona natural, "apellido" aparece/desaparece del
            // formulario y "nombre" pasa a validarse distinto (razón social) — cualquier
            // error de nombre/apellido de antes del cambio queda obsoleto.
            setErrores(prev => ({ ...prev, tipoIdentificacion: '', numeroIdentificacion: '', nombre: '', apellido: '' }))
            setAvisoDocDuplicado('')
            setAvisoNombreDuplicado('')
            setApiError(null)
            setSinCambios(false)
            return
        }
        if (name === 'nombre' || name === 'apellido') {
            if (!(name === 'nombre' && form.tipoIdentificacion === 'NIT')) value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
            const formActualizado = { ...form, [name]: value }
            setForm(prev => ({ ...prev, [name]: value }))
            setAvisoNombreDuplicado('')
            setErrores(prev => {
                const next = { ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }
                const otro = name === 'nombre' ? 'apellido' : 'nombre'
                if (prev[otro] === MENSAJE_NOMBRE_DUPLICADO) next[otro] = validarCampo(otro, formActualizado)
                return next
            })
            setApiError(null)
            setSinCambios(false)
            return
        }
        if (name === 'numeroIdentificacion') {
            setAvisoDocDuplicado('')
            if (form.tipoIdentificacion === 'NIT') {
                value = formatearNit(value)
            } else if (esDocAlfanumerico(form.tipoIdentificacion)) {
                value = value.replace(/[^a-zA-Z0-9]/g, '')
            } else {
                value = value.replace(/[^0-9]/g, '')
            }
            setForm(prev => ({ ...prev, numeroIdentificacion: value }))
            setErrores(prev => prev.numeroIdentificacion
                ? { ...prev, numeroIdentificacion: validarDocumentoCompleto(form.tipoIdentificacion, value) || '' }
                : prev)
            setApiError(null)
            setSinCambios(false)
            return
        }
        if (name === 'telefono') {
            value = filtrarTelefono(value, form.tipoIdentificacion)
        }
        if (name === 'email') {
            value = filtrarCorreo(value)
        }
        if (name === 'direccion') {
            value = filtrarDireccion(value)
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleSubmit = async () => {
        // Se llama desde el último paso ("Confirmación", sin campos propios) —
        // validar con `validarPaso(activeStep, ...)` acá era en la práctica un no-op
        // (activeStep siempre vale 2 en este punto). Revalida los pasos 0 y 1 y salta
        // al primero con error.
        const erroresPaso0 = validarPaso(0, form, { avisoDocDuplicado, avisoNombreDuplicado })
        const erroresPaso1 = validarPaso(1, form, { avisoDocDuplicado, avisoNombreDuplicado })
        const erroresEncontrados = { ...erroresPaso0, ...erroresPaso1 }
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(Object.keys(erroresPaso0).length > 0 ? 0 : 1)
            return
        }

        if (formOriginal) {
            const hayCambios = Object.keys(form).some(key => {
                const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })

            if (!hayCambios) {
                setSinCambios(true)
                return
            }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            await actualizarCliente({ ...form, apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido, idDestino: parseInt(form.idDestino) })
            showToast('¡Cliente actualizado exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar el cliente'))
        } finally {
            setSubmitting(false)
        }
    }

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        onClose()
    }

    const handleCancelar = () => cerrar()

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoDocumento
                        form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        verificarDocumentoDuplicado={verificarDocumentoDuplicado} verificarNombreDuplicado={verificarNombreDuplicado}
                    />
                )
            case 1:
                return (
                    <PasoContacto theme={theme} form={form} errores={errores} setErrores={setErrores} handleChange={handleChange}
                        destinos={destinos} destinoInput={destinoInput} setDestinoInput={setDestinoInput}
                        clienteOriginal={formOriginal} />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={formOriginal}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
                        destinos={destinos}
                    />
                )
            default:
                return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleCancelar}
            title="Editar Cliente"
            subtitle={formOriginal?.nombre && formOriginal?.apellido
                ? `Modificando datos de ${formOriginal.nombre} ${formOriginal.apellido}`
                : 'Modifica los campos que necesites.'}
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default ActualizarCliente
