import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { useRutaProgramacion } from './context/RutaProgramacionContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import { steps, validarCampo, validarPares, validarParadas, validarPaso } from './validations/rutaValidation.js'
import PasoDestinoPares from './components/wizard/PasoDestinoPares.jsx'
import PasoHorario from './components/wizard/PasoHorario.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

// `prefill` (opcional): datos con los que arranca el formulario — hoy solo lo usa
// "Programar regreso" (ListarRutaProgramacion.jsx), para precargar origen/pares/
// paradas invertidos de la ruta que ya se completó. `{ idRutaIda, origen, pares,
// paradas }` — el destino final del regreso queda vacío a propósito: el origen de
// la ruta original es texto libre, no un Destino real, así que no se puede inferir
// con certeza a cuál Destino corresponde.
const RegistrarRutaProgramacion = ({ open, onClose, onSuccess, prefill }) => {
    const { registrarRutaProgramada } = useRutaProgramacion()
    const { showToast } = useToast()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]       = useState({})
    const [apiError, setApiError]     = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [destinoInput, setDestinoInput]     = useState('')
    const [vehiculoInputs, setVehiculoInputs]     = useState([''])
    const [conductorInputs, setConductorInputs]   = useState([''])
    const [paradaInputs, setParadaInputs]         = useState([])
    const [refrescarDisponibilidad, setRefrescarDisponibilidad] = useState(0)

    // Sin tiempo real (WebSockets) en este proyecto, el calendario de disponibilidad
    // trae los datos una sola vez y podría quedar desactualizado si alguien más
    // programa otra ruta con el mismo vehículo/conductor mientras este formulario
    // sigue abierto. Se refresca cada vez que se ENTRA al paso "Horario" (índice 1) —
    // en cualquier dirección (con "Siguiente" desde Datos de la Ruta, o con "Anterior"
    // desde Confirmación) — mismo patrón ya usado para la capacidad en Ventas.
    useEffect(() => {
        if (activeStep !== 1) return
        setRefrescarDisponibilidad(k => k + 1)
    }, [activeStep])

    const vehiculos   = getVehiculosHabilitados()
    const conductores = getConductoresHabilitados()
    const destinos    = getDestinosHabilitados()

    // El backend rechaza igual asignar un vehículo con algún documento vencido o un
    // conductor sin licencia vigente — se excluyen acá antes para no dejar elegir algo
    // que de todas formas no puede transitar (ver validarDocumentosVehiculo/
    // tieneLicenciaVigente en rutaService.js del backend).
    const vehiculosSeleccionables = vehiculos.filter(vehiculoDocumentosVigentes)
    const conductoresSeleccionables = conductores.filter(c => conductorLicenciaVigente(c.categoriasLicencia))
    const vehiculosExcluidos = vehiculos.length - vehiculosSeleccionables.length
    const conductoresExcluidos = conductores.length - conductoresSeleccionables.length

    const [form, setForm] = useState({
        origen: 'Medellín',
        pares: [{ idVehiculo: '', idConductor: '' }],
        idDestino: '',
        paradas: [],
        fechaSalida: '',
        horaSalida: '',
        fechaLlegadaEstimada: '',
        horaLlegadaEstimada: '',
        observaciones: ''
    })

    // Aplica el prefill (si viene) cada vez que se abre el diálogo — después de
    // declarar `form`/los *Inputs de arriba, para no depender del orden de hooks.
    useEffect(() => {
        if (!open || !prefill) return
        setForm(prev => ({
            ...prev,
            origen: prefill.origen || prev.origen,
            pares: prefill.pares?.length > 0 ? prefill.pares.map(p => ({ idVehiculo: p.idVehiculo || '', idConductor: p.idConductor || '' })) : prev.pares,
            paradas: prefill.paradas || [],
            idRutaIda: prefill.idRutaIda || undefined,
        }))
        if (prefill.pares?.length > 0) {
            setVehiculoInputs(prefill.pares.map(p => {
                const v = vehiculos.find(x => x.idVehiculo === p.idVehiculo)
                return v ? `${v.placa} — ${v.marca} ${v.modelo}` : ''
            }))
            setConductorInputs(prefill.pares.map(p => {
                const c = conductores.find(x => x.idConductor === p.idConductor)
                return c ? `${c.nombre} ${c.apellido}` : ''
            }))
        }
        if (prefill.paradas?.length > 0) {
            setParadaInputs(prefill.paradas.map(p => {
                const d = destinos.find(x => x.idDestino === parseInt(p.idDestino))
                return d ? `${d.ciudad} - ${d.departamento}` : ''
            }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr al abrir con un prefill nuevo, no en cada cambio de vehiculos/conductores/destinos
    }, [open, prefill])

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'origen') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    const handleParChange = (index, campo, value) => {
        const pares = form.pares.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        // La fecha ya elegida se conserva — casi siempre sigue siendo válida con el
        // vehículo/conductor nuevo. El propio calendario recalcula la disponibilidad
        // para el par actualizado y marca el día en rojo si de verdad queda bloqueado
        // (ver CalendarioDisponibilidad, estilo de celda seleccionada+bloqueada).
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setApiError(null)
    }

    const handleAgregarPar = () => {
        setForm(prev => ({ ...prev, pares: [...prev.pares, { idVehiculo: '', idConductor: '' }] }))
        setVehiculoInputs(prev => [...prev, ''])
        setConductorInputs(prev => [...prev, ''])
    }

    const handleQuitarPar = (index) => {
        const pares = form.pares.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setVehiculoInputs(prev => prev.filter((_, i) => i !== index))
        setConductorInputs(prev => prev.filter((_, i) => i !== index))
    }

    const handleParadaChange = (index, idDestino) => {
        const paradas = form.paradas.map((p, i) => i === index ? { ...p, idDestino } : p)
        setForm(prev => ({ ...prev, paradas }))
        setErrores(prev => ({ ...prev, paradas: prev.paradas ? validarParadas(paradas) : '' }))
        setApiError(null)
    }

    const handleAgregarParada = () => {
        setForm(prev => ({ ...prev, paradas: [...prev.paradas, { idDestino: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '' }] }))
        setParadaInputs(prev => [...prev, ''])
    }

    const handleParadaFechaChange = (index, campo, value) => {
        const paradas = form.paradas.map((p, i) => i === index
            ? { ...p, [campo]: value, ...(campo === 'fechaLlegadaEstimada' && !value ? { horaLlegadaEstimada: '' } : {}) }
            : p)
        setForm(prev => ({ ...prev, paradas }))
        setApiError(null)
    }

    const handleQuitarParada = (index) => {
        const paradas = form.paradas.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, paradas }))
        setErrores(prev => ({ ...prev, paradas: prev.paradas ? validarParadas(paradas) : '' }))
        setParadaInputs(prev => prev.filter((_, i) => i !== index))
    }

    // Reordena una parada moviéndola una posición arriba (-1) o abajo (+1) — el
    // "orden" que se manda al backend es la posición en el array, así que reordenar
    // acá es lo único que hace falta (ver rutaService.validarParadas del backend).
    const handleMoverParada = (index, direccion) => {
        const destino = index + direccion
        if (destino < 0 || destino >= form.paradas.length) return
        const paradas = [...form.paradas]
        ;[paradas[index], paradas[destino]] = [paradas[destino], paradas[index]]
        setForm(prev => ({ ...prev, paradas }))
        setParadaInputs(prev => {
            const copia = [...prev]
            ;[copia[index], copia[destino]] = [copia[destino], copia[index]]
            return copia
        })
    }

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
        setApiError(null)
        try {
            await registrarRutaProgramada({
                ...form,
                pares: form.pares
                    .filter(p => p.idVehiculo && p.idConductor)
                    .map(p => ({ idVehiculo: parseInt(p.idVehiculo), idConductor: parseInt(p.idConductor) })),
                idDestino:   parseInt(form.idDestino),
                paradas: form.paradas.filter(p => p.idDestino).map(p => ({
                    idDestino: parseInt(p.idDestino),
                    fechaLlegadaEstimada: p.fechaLlegadaEstimada || null,
                    horaLlegadaEstimada: p.fechaLlegadaEstimada ? (p.horaLlegadaEstimada || null) : null,
                })),
                ...(form.idRutaIda ? { idRutaIda: form.idRutaIda } : {}),
                observaciones: form.observaciones || '',
                estado: 'Programada'
            })
            showToast('¡Ruta programada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ origen: 'Medellín', pares: [{ idVehiculo: '', idConductor: '' }], idDestino: '', paradas: [], fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setDestinoInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        setParadaInputs([])
        onClose?.()
    }

    const destinoSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestino)) || null

    const getVehiculoOpciones = (index) => {
        const usados = form.pares.filter((_, i) => i !== index).map(p => p.idVehiculo)
        return vehiculosSeleccionables.filter(v => !usados.includes(v.idVehiculo))
    }
    const getConductorOpciones = (index) => {
        const usados = form.pares.filter((_, i) => i !== index).map(p => p.idConductor)
        return conductoresSeleccionables.filter(c => !usados.includes(c.idConductor))
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoDestinoPares
                        theme={theme} form={form} errores={errores} setErrores={setErrores}
                        handleChange={handleChange} handleParChange={handleParChange} handleAgregarPar={handleAgregarPar} handleQuitarPar={handleQuitarPar}
                        destinos={destinos} destinoInput={destinoInput} setDestinoInput={setDestinoInput} destinoSeleccionado={destinoSeleccionado}
                        vehiculos={vehiculos} conductores={conductores} vehiculosExcluidos={vehiculosExcluidos} conductoresExcluidos={conductoresExcluidos}
                        vehiculoInputs={vehiculoInputs} setVehiculoInputs={setVehiculoInputs} conductorInputs={conductorInputs} setConductorInputs={setConductorInputs}
                        getVehiculoOpciones={getVehiculoOpciones} getConductorOpciones={getConductorOpciones}
                        handleParadaChange={handleParadaChange} handleAgregarParada={handleAgregarParada}
                        handleQuitarParada={handleQuitarParada} handleMoverParada={handleMoverParada}
                        handleParadaFechaChange={handleParadaFechaChange}
                        paradaInputs={paradaInputs} setParadaInputs={setParadaInputs}
                    />
                )
            case 1:
                return (
                    <PasoHorario
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores} setApiError={setApiError} handleChange={handleChange}
                        refrescarDisponibilidad={refrescarDisponibilidad}
                    />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={null}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={false} setSinCambios={() => {}}
                        destinos={destinos} vehiculos={vehiculos} conductores={conductores}
                    />
                )
            default: return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title={prefill ? 'Programar Regreso' : 'Registrar Ruta'}
            subtitle={prefill ? 'Revisa los datos precargados del viaje de vuelta y complétalos.' : 'Ingresa los datos de la nueva ruta paso a paso.'}
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarRutaProgramacion
