import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useVentas } from './context/VentaContext.jsx'
import { useClientes } from '../clientes/context/ClienteContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useRutaProgramacion } from '../rutas/context/RutaProgramacionContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { getGuiaPrincipal } from '../../shared/utils/formatters.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import { steps, PAQUETE_VACIO, formatearNit } from './validations/validacion.js'
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
    observaciones: '',
    metodoPago: '',
    total: '',
})

const ActualizarVenta = ({ open, onClose, venta, onSuccess }) => {
    const { actualizarVenta } = useVentas()
    const { showToast } = useToast()
    const theme = useTheme()
    const { clientes } = useClientes()
    const { getDestinosHabilitados } = useDestino()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion } = useConfiguracion()
    const [submitting, setSubmitting] = useState(false)
    const [ventaOriginal, setVentaOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [destinoDestinatarioInput, setDestinoDestinatarioInput] = useState('')
    const destinos = getDestinosHabilitados()

    // Peso que esta misma venta ya tenía en cada vehículo del convoy, agrupado por par —
    // se resta del "pesoUsado" de cada par para no contar dos veces el peso que ya era de
    // esta venta antes de editar. A diferencia del modelo anterior (una sola ruta), ahora
    // hay que excluirlo por vehículo, no en un solo total.
    const getPesoOriginalPorPar = () => {
        const acc = {}
        for (const p of (ventaOriginal?.paquetes || [])) {
            const id = p.idRutaVehiculoConductor
            if (id == null) continue
            acc[id] = (acc[id] || 0) + (parseFloat(p.peso) || 0)
        }
        return acc
    }

    const {
        errores, setErrores, apiError, setApiError, activeStep, setActiveStep,
        clienteInput, setClienteInput, rutaInput, setRutaInput,
        form, setForm, valorServicioManualRef, calcularValorServicio, paqueteRefs, setParticipanteRef, handleResetearTotal, totalEditadoManualmente,
        handleChange, setErrorPaquete, handlePaqueteChange,
        handleAgregarPaquete, handleQuitarPaquete, handleNext, handleBack, validarTodo,
    } = useVentaWizardForm({
        initialForm: getInitialForm(),
        rutasProgramadas, fetchRutasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion,
        ventaOriginal,
        afterChange: () => setSinCambios(false),
        getPesoOriginalPorPar,
    })

    useEffect(() => {
        if (!venta) return
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        const ventaData = venta
        setVentaOriginal(ventaData)
        const destinatario = ventaData.destinatario || null
        // Los campos DECIMAL del backend llegan como texto con dos decimales fijos
        // (ej. "9999.00", por cómo Postgres/Sequelize serializa DECIMAL) — sin esto,
        // el campo se precargaba mostrando ".00" aunque el valor real sea un entero.
        const limpiarNumero = (v) => (v === null || v === undefined || v === '') ? '' : String(parseFloat(v))
        // idPaquete viaja en el form (no se edita ni se muestra) para que el backend
        // sepa cuál paquete existente es cuál al guardar — así conserva su número de
        // guía. Los paquetes agregados con "Agregar paquete" no tienen idPaquete y el
        // backend los trata como nuevos (les asigna guía nueva).
        const paquetesArr = (ventaData.paquetes && ventaData.paquetes.length > 0)
            ? ventaData.paquetes.map(p => ({
                idPaquete: p.idPaquete,
                descripcionContenido: p.descripcionContenido || '',
                peso: limpiarNumero(p.peso), alto: limpiarNumero(p.alto), ancho: limpiarNumero(p.ancho),
                profundidad: limpiarNumero(p.profundidad),
                tipoCarga: p.tipoCarga || 'normal',
                idRutaVehiculoConductor: p.idRutaVehiculoConductor || '',
            }))
            : [{ ...PAQUETE_VACIO }]
        const datosForm = {
            idCliente: ventaData.cliente?.idCliente || ventaData.idCliente || '',
            tipoIdentificacionDestinatario: destinatario?.tipoIdentificacionDestinatario || '',
            // NIT: normaliza el valor guardado a "NNNNNNNNN-D" (mismo criterio que
            // Propietario/Cliente); si en BD está sin dígito de verificación, queda con
            // 9 dígitos y el usuario lo completa.
            numeroIdentificacionDestinatario: destinatario?.tipoIdentificacionDestinatario === 'NIT'
                ? formatearNit(destinatario?.numeroIdentificacionDestinatario)
                : (destinatario?.numeroIdentificacionDestinatario || ''),
            nombreDestinatario: destinatario?.nombreDestinatario || '',
            telefonoDestinatario: destinatario?.telefonoDestinatario || '',
            correoDestinatario: destinatario?.correoDestinatario || '',
            idDestinoDestinatario: destinatario?.idDestino || '',
            direccionDestinatario: destinatario?.direccionDestinatario || '',
            paquetes: paquetesArr,
            idRuta: ventaData.idRuta || ventaData.ruta?.idRuta || '',
            destino: ventaData.ruta
                ? `${ventaData.ruta.origen || 'Sin nombre'} → ${ventaData.ruta.destino?.municipio || 'Sin destino'} — $${Number(ventaData.ruta.destino?.tarifaBase || 0).toLocaleString('es-CO')}`
                : '',
            fechaSalidaRuta: ventaData.ruta?.fechaSalida || '',
            fechaLlegadaEstimadaRuta: ventaData.ruta?.fechaLlegadaEstimada || '',
            fechaEstimadaEntrega: ventaData.fechaEstimadaEntrega
                ? ventaData.fechaEstimadaEntrega.split('T')[0]
                : '',
            observaciones: ventaData.observaciones || '',
            metodoPago: ventaData.metodoPago || '',
            total: limpiarNumero(ventaData.total),
        }
        setForm(datosForm)
        setFormOriginal(datosForm)
        const c = ventaData.cliente
        if (c) {
            const nombre = c.apellido ? `${c.nombre} ${c.apellido}` : c.nombre || ''
            setClienteInput(nombre ? `${nombre} — ${c.numeroIdentificacion || ''}` : '')
        } else {
            setClienteInput('')
        }
        const r = ventaData.ruta
        if (r) {
            setRutaInput(`${r.origen || 'Sin nombre'} → ${r.destino?.municipio || 'Sin destino'} — $${Number(r.destino?.tarifaBase || 0).toLocaleString()}`)
        } else {
            setRutaInput('')
        }
        const dDestinatario = destinatario?.destino
        setDestinoDestinatarioInput(dDestinatario ? `${dDestinatario.municipio} - ${dDestinatario.departamento}` : '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [venta])

    // Si el cliente no aparece en el contexto (inhabilitado, o aún no cargaba), se arma
    // una opción sintética con los datos de la propia venta para que el Autocomplete no quede vacío.
    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente)) || (
        ventaOriginal?.cliente && parseInt(form.idCliente) === (ventaOriginal.cliente.idCliente || ventaOriginal.idCliente)
            ? ventaOriginal.cliente
            : null
    )

    const handleSubmit = async () => {
        // Una venta "Cancelada" nunca cae en "Sin cambios": encomiendaService.update()
        // la reactiva a "Programada" como efecto de CUALQUIER guardado exitoso (ver
        // LOGICA.md, "Ventas — Cancelada e inhabilitar/habilitar") — ni siquiera hace
        // falta tocar un campo si la ruta ya volvió a servir sola (se reprogramó) y
        // los demás datos ya son válidos. `estado` no es un campo de `form`, así que la
        // comparación de abajo nunca detecta esa transición por sí sola; sin este
        // bypass, el botón se quedaría en "Sin cambios" y la venta jamás se reactivaría.
        if (formOriginal && ventaOriginal?.estado !== 'Cancelada') {
            const hayCambiosPaquetes = JSON.stringify(form.paquetes) !== JSON.stringify(formOriginal.paquetes)
            const hayCambios = hayCambiosPaquetes || Object.keys(form).filter(key => key !== 'paquetes').some(key => {
                const original = formOriginal[key] !== undefined ? String(formOriginal[key]) : ''
                const actual = form[key] !== undefined ? String(form[key]) : ''
                return original !== actual
            })

            if (!hayCambios) {
                setSinCambios(true)
                setActiveStep(4)
                return
            }
        }

        // Revalida los 4 pasos con contenido antes de guardar — un dato pudo quedar
        // desactualizado mientras se seguía en "Confirmación" (paso sin campos propios,
        // sin validación en vivo). Si algo falla, ya deja el paso/campo correcto
        // marcado en rojo y no sigue con el guardado. Ver LOGICA.md.
        if (!validarTodo()) return

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            const numId = venta?.idEncomiendaVenta || venta?.id
            const payload = {
                idRuta: parseInt(form.idRuta),
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                total: parseFloat(form.total) || 0,
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    tipoIdentificacionDestinatario: form.tipoIdentificacionDestinatario,
                    numeroIdentificacionDestinatario: form.numeroIdentificacionDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario || null,
                    correoDestinatario: form.correoDestinatario || null,
                    idDestino: parseInt(form.idDestinoDestinatario),
                    direccionDestinatario: form.direccionDestinatario || null,
                },
                paquetes: form.paquetes.map(p => ({
                    idPaquete: p.idPaquete,
                    descripcionContenido: p.descripcionContenido || null,
                    peso: p.peso ? parseFloat(p.peso) : null,
                    alto: p.alto ? parseFloat(p.alto) : null,
                    ancho: p.ancho ? parseFloat(p.ancho) : null,
                    profundidad: p.profundidad ? parseFloat(p.profundidad) : null,
                    tipoCarga: p.tipoCarga,
                    idRutaVehiculoConductor: parseInt(p.idRutaVehiculoConductor),
                })),
            }
            await actualizarVenta(numId, payload)

            showToast('¡Venta actualizada exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar la venta.'))
        } finally {
            setSubmitting(false)
        }
    }

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        if (onClose) onClose()
    }

    const handleCancelar = () => cerrar()

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoParticipantes
                        theme={theme} clientes={clientes} clienteSeleccionado={clienteSeleccionado}
                        clienteInput={clienteInput} setClienteInput={setClienteInput}
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores}
                        handleChange={handleChange} setSinCambios={setSinCambios} ventaOriginal={ventaOriginal}
                        destinos={destinos} destinoDestinatarioInput={destinoDestinatarioInput}
                        setDestinoDestinatarioInput={setDestinoDestinatarioInput}
                        setParticipanteRef={setParticipanteRef}
                    />
                )
            case 1:
                return (
                    <PasoPaquetes
                        theme={theme} form={form} errores={errores}
                        handlePaqueteChange={handlePaqueteChange} setErrorPaquete={setErrorPaquete}
                        handleAgregarPaquete={handleAgregarPaquete} handleQuitarPaquete={handleQuitarPaquete}
                        tarifaPorKgHierro={tarifaPorKgHierro} tarifaPorKgNormal={tarifaPorKgNormal}
                        paqueteRefs={paqueteRefs}
                    />
                )
            case 2:
                return (
                    <PasoEnvio
                        theme={theme} form={form} setForm={setForm} errores={errores} setErrores={setErrores}
                        setApiError={setApiError} setSinCambios={setSinCambios}
                        rutasProgramadas={rutasProgramadas} rutaInput={rutaInput} setRutaInput={setRutaInput}
                        handleChange={handleChange} calcularValorServicio={calcularValorServicio}
                        handlePaqueteChange={handlePaqueteChange} setErrorPaquete={setErrorPaquete}
                        ventaOriginal={ventaOriginal} valorServicioManualRef={valorServicioManualRef}
                        getPesoOriginalPorPar={getPesoOriginalPorPar}
                        destinos={destinos}
                    />
                )
            case 3:
                return <PasoPago form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} ventaOriginal={ventaOriginal} handleResetearTotal={handleResetearTotal} totalEditadoManualmente={totalEditadoManualmente} />
            case 4:
                return (
                    <PasoConfirmacion
                        theme={theme} apiError={apiError} setApiError={setApiError} cardSx={cardSx(theme)}
                        clienteSeleccionado={clienteSeleccionado} form={form} formOriginal={formOriginal}
                        ventaOriginal={ventaOriginal} sinCambios={sinCambios} setSinCambios={setSinCambios}
                        clientes={clientes} rutasProgramadas={rutasProgramadas} destinos={destinos}
                    />
                )
            default:
                return null
        }
    }

    if (!ventaOriginal && !apiError) {
        return (
            <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            background: theme.palette.gradient.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AssignmentIndOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Editar Venta</Typography>
                    </Box>
                    <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                        <Typography color={theme.palette.text.secondary}>Cargando datos de la venta...</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

    if (!ventaOriginal && apiError) {
        return (
            <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            background: theme.palette.gradient.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AssignmentIndOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Editar Venta</Typography>
                    </Box>
                    <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <WizardDialog
            open={open} onClose={handleCancelar}
            title="Editar Venta"
            subtitle={getGuiaPrincipal(ventaOriginal)
                ? `Modificando guía: ${getGuiaPrincipal(ventaOriginal)}${ventaOriginal.paquetes?.length > 1 ? ` (+${ventaOriginal.paquetes.length - 1})` : ''}`
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

export default ActualizarVenta
