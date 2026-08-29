import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useClientes } from './context/ClienteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { MENSAJE_NOMBRE_DUPLICADO } from '../../shared/utils/duplicados.js'
import { esDocAlfanumerico } from '../../shared/utils/documento.js'
import { capitalizarPalabras } from '../../shared/utils/formatters.js'
import { steps, validarCampo, validarDocumentoCompleto, validarPaso } from './validations/clienteValidation.js'
import { useDuplicadoCliente } from './hooks/useDuplicadoCliente.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoDocumento from './components/wizard/PasoDocumento.jsx'
import PasoContacto from './components/wizard/PasoContacto.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarCliente = ({ open, onClose, cliente: clienteProp, onSuccess }) => {
    const { clientes, loading, actualizarCliente } = useClientes()
    const { showToast } = useToast()
    const theme = useTheme()
    const [apiError, setApiError] = useState(null)
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const cargado = useRef(false)

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        direccion: '',
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
            setForm(datosForm)
            setFormOriginal(datosForm)
        }
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
                value = value.replace(/[^0-9-]/g, '')
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
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'email') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
        }
        if (name === 'direccion') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/' ]/g, '')
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
        const erroresEncontrados = validarPaso(activeStep, form, { avisoDocDuplicado, avisoNombreDuplicado })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
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
            await actualizarCliente({ ...form, apellido: form.tipoIdentificacion === 'NIT' ? '' : form.apellido })
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
                    <PasoContacto form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={formOriginal}
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
