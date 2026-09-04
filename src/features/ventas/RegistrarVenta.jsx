import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import RegistrarCliente from '../clientes/RegistrarCliente.jsx'
import { useVentas } from './context/VentaContext.jsx'
import { useClientes } from '../clientes/context/ClienteContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useRutaProgramacion } from '../rutas/context/RutaProgramacionContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import { steps, PAQUETE_VACIO } from './validations/validacion.js'
import { cardSx } from './style/wizardStyles.js'
import useVentaWizardForm from './hooks/useVentaWizardForm.js'
import PasoParticipantes from './components/wizard/PasoParticipantes.jsx'
import PasoPaquetes from './components/wizard/PasoPaquetes.jsx'
import PasoEnvio from './components/wizard/PasoEnvio.jsx'
import PasoPago from './components/wizard/PasoPago.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const getInitialForm = () => ({
    idCliente: '',
    tipoIdentificacionDestinatario: '',
    numeroIdentificacionDestinatario: '',
    nombreDestinatario: '',
    telefonoDestinatario: '',
    correoDestinatario: '',
    idDestinoDestinatario: '',
    direccionDestinatario: '',
    paquetes: [{ ...PAQUETE_VACIO }],
    idRuta: '',
    destino: '',
    fechaSalidaRuta: '',
    fechaLlegadaEstimadaRuta: '',
    fechaEstimadaEntrega: '',
    entregaSinFecha: false,
    observaciones: '',
    metodoPago: '',
    estadoPago: 'Pendiente',
    valorServicio: '',
    total: '',
})

const RegistrarVenta = ({ open, onClose, onSuccess }) => {
    const { agregarVenta } = useVentas()
    const { showToast } = useToast()
    const theme = useTheme()
    const { clientes } = useClientes()
    const { getDestinosHabilitados } = useDestino()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion } = useConfiguracion()
    const [submitting, setSubmitting] = useState(false)
    const [modalNuevoCliente, setModalNuevoCliente] = useState(false)
    const [destinoDestinatarioInput, setDestinoDestinatarioInput] = useState('')
    const destinos = getDestinosHabilitados()

    const {
        errores, setErrores, apiError, setApiError, activeStep, setActiveStep,
        clienteInput, setClienteInput, rutaInput, setRutaInput,
        form, setForm, calcularValorServicio,
        handleChange, setErrorPaquete, handlePaqueteChange,
        handleAgregarPaquete, handleQuitarPaquete, handleNext, handleBack,
    } = useVentaWizardForm({
        initialForm: getInitialForm(),
        rutasProgramadas, fetchRutasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion,
    })

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm(getInitialForm())
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setClienteInput('')
        setRutaInput('')
        setDestinoDestinatarioInput('')
        onClose()
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setApiError(null)
        try {
            await agregarVenta({
                idCliente: parseInt(form.idCliente),
                idRuta: parseInt(form.idRuta),
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    tipoIdentificacionDestinatario: form.tipoIdentificacionDestinatario,
                    numeroIdentificacionDestinatario: form.numeroIdentificacionDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario,
                    correoDestinatario: form.correoDestinatario || null,
                    idDestino: parseInt(form.idDestinoDestinatario),
                    direccionDestinatario: form.direccionDestinatario,
                },
                paquetes: form.paquetes.map(p => ({
                    descripcionContenido: p.descripcionContenido,
                    peso: parseFloat(p.peso),
                    alto: parseFloat(p.alto),
                    ancho: parseFloat(p.ancho),
                    profundidad: parseFloat(p.profundidad),
                    // null y no 0 -- el validador del backend acepta el campo vacío
                    // (optional nullable), pero 0 sí choca contra isFloat({min:1}).
                    tipoCarga: p.tipoCarga,
                    idRutaVehiculoConductor: parseInt(p.idRutaVehiculoConductor),
                })),
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio) || 0,
                estadoPago: form.estadoPago,
            })
            showToast('¡Venta registrada exitosamente!', 'success')
            setTimeout(() => { handleClose(); if (onSuccess) onSuccess() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la venta.'))
        } finally {
            setSubmitting(false)
        }
    }

    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente))

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoParticipantes
                        theme={theme} clientes={clientes} clienteSeleccionado={clienteSeleccionado}
                        clienteInput={clienteInput} setClienteInput={setClienteInput}
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores}
                        handleChange={handleChange} onNuevoCliente={() => setModalNuevoCliente(true)}
                        destinos={destinos} destinoDestinatarioInput={destinoDestinatarioInput}
                        setDestinoDestinatarioInput={setDestinoDestinatarioInput}
                    />
                )
            case 1:
                return (
                    <PasoPaquetes
                        theme={theme} form={form} errores={errores}
                        handlePaqueteChange={handlePaqueteChange} setErrorPaquete={setErrorPaquete}
                        handleAgregarPaquete={handleAgregarPaquete} handleQuitarPaquete={handleQuitarPaquete}
                        tarifaPorKgHierro={tarifaPorKgHierro} tarifaPorKgNormal={tarifaPorKgNormal}
                    />
                )
            case 2:
                return (
                    <PasoEnvio
                        theme={theme} form={form} setForm={setForm} errores={errores} setErrores={setErrores} setApiError={setApiError}
                        rutasProgramadas={rutasProgramadas} rutaInput={rutaInput} setRutaInput={setRutaInput}
                        handleChange={handleChange} calcularValorServicio={calcularValorServicio}
                        handlePaqueteChange={handlePaqueteChange} setErrorPaquete={setErrorPaquete}
                        destinos={destinos}
                    />
                )
            case 3:
                return <PasoPago form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} />
            case 4:
                return (
                    <PasoConfirmacion
                        theme={theme} apiError={apiError} setApiError={setApiError} cardSx={cardSx(theme)}
                        clienteSeleccionado={clienteSeleccionado} form={form} rutasProgramadas={rutasProgramadas}
                        destinos={destinos}
                    />
                )
            default:
                return null
        }
    }

    return (
        <>
        <WizardDialog
            open={open} onClose={handleClose}
            title="Registrar Venta" subtitle="Complete los datos de la nueva encomienda paso a paso."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
        <RegistrarCliente
            open={modalNuevoCliente}
            onClose={() => setModalNuevoCliente(false)}
            onSuccess={(nuevoCliente) => {
                setModalNuevoCliente(false)
                if (nuevoCliente) {
                    setForm(prev => ({ ...prev, idCliente: nuevoCliente.idCliente }))
                    setErrores(prev => ({ ...prev, idCliente: '' }))
                    const nombre = nuevoCliente.apellido ? `${nuevoCliente.nombre} ${nuevoCliente.apellido}` : nuevoCliente.nombre
                    setClienteInput(`${nombre} — ${nuevoCliente.numeroIdentificacion}`)
                }
            }}
        />
        </>
    )
}

export default RegistrarVenta
