import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useRutaProgramacion } from './context/RutaProgramacionContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import { steps, validarCampo, validarPares, validarPaso } from './validations/rutaValidation.js'
import PasoDestinoPares from './components/wizard/PasoDestinoPares.jsx'
import PasoHorario from './components/wizard/PasoHorario.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarRutaProgramacion = ({ open, onClose, ruta, onSuccess }) => {
    const { actualizarRutaProgramada } = useRutaProgramacion()
    const { showToast } = useToast()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]         = useState({})
    const [apiError, setApiError]       = useState(null)
    const [activeStep, setActiveStep]   = useState(0)
    const [submitting, setSubmitting]   = useState(false)
    const [originalData, setOriginalData] = useState(null)
    const [sinCambios, setSinCambios]   = useState(false)
    const [destinoInput, setDestinoInput]     = useState('')
    const [vehiculoInputs, setVehiculoInputs]     = useState([''])
    const [conductorInputs, setConductorInputs]   = useState([''])
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
    // tieneLicenciaVigente en rutaService.js del backend). Solo afecta las opciones
    // nuevas a elegir — un par ya asignado a esta ruta sigue mostrándose tal cual,
    // aunque su documento haya vencido después de haberlo asignado.
    const vehiculosSeleccionables = vehiculos.filter(vehiculoDocumentosVigentes)
    const conductoresSeleccionables = conductores.filter(c => conductorLicenciaVigente(c.categoriasLicencia))
    const vehiculosExcluidos = vehiculos.length - vehiculosSeleccionables.length
    const conductoresExcluidos = conductores.length - conductoresSeleccionables.length

    const [form, setForm] = useState({
        origen: '', pares: [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }], idDestino: '',
        fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: ''
    })

    useEffect(() => {
        if (ruta && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const paresRuta = ruta.paresVehiculoConductor || []
            const pares = paresRuta.length > 0
                ? paresRuta.map(p => ({
                    idRutaVehiculoConductor: p.idRutaVehiculoConductor,
                    idVehiculo: p.idVehiculo || '',
                    idConductor: p.idConductor || '',
                }))
                : [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }]
            const datos = {
                origen:          ruta.origen          || '',
                pares,
                idDestino:           ruta.idDestino           || '',
                fechaSalida:         ruta.fechaSalida         || '',
                horaSalida:          ruta.horaSalida          || '',
                fechaLlegadaEstimada:        ruta.fechaLlegadaEstimada        || '',
                horaLlegadaEstimada: ruta.horaLlegadaEstimada || '',
                observaciones:       ruta.observaciones       || ''
            }
            setForm(datos)
            setOriginalData(datos)
            // Si el vehículo/conductor/destino de esta ruta ya fue inhabilitado desde que
            // se creó, no aparece en las listas de habilitados — se usan los datos que ya
            // trae la propia ruta como respaldo, para que el campo nunca se vea vacío.
            const vHab = getVehiculosHabilitados()
            const cHab = getConductoresHabilitados()
            const d = getDestinosHabilitados().find(x => x.idDestino === ruta.idDestino)
            setVehiculoInputs(pares.map(p => {
                const v = vHab.find(x => x.idVehiculo === parseInt(p.idVehiculo))
                if (v) return `${v.placa} — ${v.marca} ${v.modelo}`
                const original = paresRuta.find(x => x.idVehiculo === parseInt(p.idVehiculo))?.vehiculo
                return original ? `${original.placa} — ${original.marca} ${original.modelo}` : ''
            }))
            setConductorInputs(pares.map(p => {
                const c = cHab.find(x => x.idConductor === parseInt(p.idConductor))
                if (c) return `${c.nombre} ${c.apellido}`
                const original = paresRuta.find(x => x.idConductor === parseInt(p.idConductor))?.conductor?.usuario
                return original ? `${original.nombre} ${original.apellido}` : ''
            }))
            setDestinoInput(d ? (d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`) : (ruta.destino ? `${ruta.destino.departamento} - ${ruta.destino.ciudad}` : ''))
        }
    }, [ruta, open, getVehiculosHabilitados, getConductoresHabilitados, getDestinosHabilitados])

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'origen') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
        setSinCambios(false)
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
        setSinCambios(false)
    }

    const handleAgregarPar = () => {
        setForm(prev => ({ ...prev, pares: [...prev.pares, { idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }] }))
        setVehiculoInputs(prev => [...prev, ''])
        setConductorInputs(prev => [...prev, ''])
        setSinCambios(false)
    }

    const handleQuitarPar = (index) => {
        const pares = form.pares.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares) : '' }))
        setVehiculoInputs(prev => prev.filter((_, i) => i !== index))
        setConductorInputs(prev => prev.filter((_, i) => i !== index))
        setSinCambios(false)
    }

    // Opciones disponibles para la fila `index`: vehículos/conductores habilitados que no
    // estén ya usados en OTRA fila, más el propio (aunque esté inhabilitado) si es el que
    // ya traía esta fila — para que el Autocomplete no se vea vacío al editar.
    const getVehiculoOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idVehiculo))
        // El backend rechaza igual un vehículo con documentos vencidos — se excluye acá
        // salvo que sea el que ya tenía asignado esta fila (ver el fallback abajo, que
        // igual lo vuelve a mostrar si venció después de haber sido asignado).
        const base = vehiculos.filter(v => !usados.includes(v.idVehiculo) && vehiculoDocumentosVigentes(v))
        if (par.idVehiculo && !base.some(v => v.idVehiculo === parseInt(par.idVehiculo))) {
            const original = (ruta?.paresVehiculoConductor || []).find(p => p.idVehiculo === parseInt(par.idVehiculo))?.vehiculo
            if (original) return [...base, original]
        }
        return base
    }
    const getConductorOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idConductor))
        // El backend rechaza igual un conductor sin licencia vigente — se excluye acá
        // salvo que sea el que ya tenía asignado esta fila (ver el fallback abajo, que
        // igual lo vuelve a mostrar si venció después de haber sido asignado).
        const base = conductores.filter(c => !usados.includes(c.idConductor) && conductorLicenciaVigente(c.categoriasLicencia))
        if (par.idConductor && !base.some(c => c.idConductor === parseInt(par.idConductor))) {
            const original = (ruta?.paresVehiculoConductor || []).find(p => p.idConductor === parseInt(par.idConductor))?.conductor?.usuario
            if (original) return [...base, { idConductor: parseInt(par.idConductor), nombre: original.nombre, apellido: original.apellido }]
        }
        return base
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

        if (originalData) {
            // Comparación genérica (String()) no sirve para "pares": es un array de
            // objetos y String() de eso siempre da "[object Object]" sin importar el
            // contenido — se compara aparte con JSON.stringify, igual que en Ventas.
            const hayCambiosPares = JSON.stringify(form.pares) !== JSON.stringify(originalData.pares)
            const hayCambios = hayCambiosPares || Object.keys(form).filter(k => k !== 'pares').some(key => {
                const orig = originalData[key] !== undefined ? String(originalData[key]) : ''
                const act  = form[key]         !== undefined ? String(form[key])         : ''
                return orig !== act
            })
            if (!hayCambios) { setSinCambios(true); return }
        }

        setSinCambios(false)
        setSubmitting(true)
        setApiError(null)
        try {
            // El id puede estar como idRuta (API) o idRutaProgramada (legacy)
            const id = ruta.idRuta ?? ruta.idRutaProgramada
            await actualizarRutaProgramada({
                idRuta: id,
                ...form,
                pares: form.pares
                    .filter(p => p.idVehiculo && p.idConductor)
                    .map(p => ({
                        ...(p.idRutaVehiculoConductor ? { idRutaVehiculoConductor: p.idRutaVehiculoConductor } : {}),
                        idVehiculo: parseInt(p.idVehiculo),
                        idConductor: parseInt(p.idConductor),
                    })),
                idDestino:   parseInt(form.idDestino),
                observaciones: form.observaciones || ''
            })
            showToast('¡Ruta actualizada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar la ruta'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ origen: '', pares: [{ idRutaVehiculoConductor: '', idVehiculo: '', idConductor: '' }], idDestino: '', fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setOriginalData(null)
        setSinCambios(false)
        setDestinoInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        onClose?.()
    }

    // Mismo respaldo que arriba, pero como opción "sintética" para que el Autocomplete
    // tenga un value consistente (si no, algunos re-renders de MUI vacían el campo).
    const destinoSeleccionado = destinos.find(d => d.idDestino === parseInt(form.idDestino)) || (
        ruta?.destino && parseInt(form.idDestino) === ruta.idDestino
            ? { idDestino: ruta.idDestino, nombre: ruta.destino.nombre, ciudad: ruta.destino.ciudad, departamento: ruta.destino.departamento }
            : null
    )

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
                    />
                )
            case 1:
                return (
                    <PasoHorario
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores} setApiError={setApiError} handleChange={handleChange}
                        idRutaExcluir={ruta?.idRuta ?? ruta?.idRutaProgramada}
                        refrescarDisponibilidad={refrescarDisponibilidad}
                        afterChange={() => setSinCambios(false)}
                    />
                )
            case 2:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={originalData}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
                        destinos={destinos} vehiculos={vehiculos} conductores={conductores} ruta={ruta}
                    />
                )
            default: return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Editar Ruta"
            subtitle={originalData?.origen ? `Modificando datos de ${originalData.origen}` : 'Modifica los campos que necesites.'}
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default ActualizarRutaProgramacion
