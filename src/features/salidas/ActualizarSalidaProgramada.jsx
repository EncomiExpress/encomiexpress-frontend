import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useSalidaProgramacion } from './context/SalidaProgramacionContext.jsx'
import { useRuta } from '../rutas/context/RutaContext.jsx'
import { useVehiculo } from '../vehiculos/context/VehiculoContext.jsx'
import { useConductor } from '../conductores/context/ConductorContext.jsx'
import { useDestino } from '../destinos/context/DestinoContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { vehiculoDocumentosVigentes, conductorLicenciaVigente } from '../../shared/utils/vigenciaDocumentos.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import { steps, validarCampo, validarPares, validarPaso } from './validations/salidaValidation.js'
import { resolveDestinoPartes } from './utils/salidaResolvers.js'
import { getRutaLabel } from '../rutas/utils/rutaResolvers.js'
import { filtrarObservacionesRuta } from '../../shared/validations/observacionesRutaValidation.js'
import PasoRuta from './components/wizard/PasoRuta.jsx'
import PasoHorario from './components/wizard/PasoHorario.jsx'
import PasoConvoy from './components/wizard/PasoConvoy.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarSalidaProgramada = ({ open, onClose, salida, onSuccess }) => {
    const { actualizarSalidaProgramada } = useSalidaProgramacion()
    const { getRutasHabilitadas } = useRuta()
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
    const [rutaInput, setRutaInput]     = useState('')
    const [vehiculoInputs, setVehiculoInputs]     = useState([''])
    const [conductorInputs, setConductorInputs]   = useState([''])
    const [refrescarDisponibilidad, setRefrescarDisponibilidad] = useState(0)

    useEffect(() => {
        if (activeStep !== 1) return
        setRefrescarDisponibilidad(k => k + 1)
    }, [activeStep])

    const vehiculos   = getVehiculosHabilitados()
    const conductores = getConductoresHabilitados()
    const destinos    = getDestinosHabilitados()
    const rutas       = getRutasHabilitadas()

    // "Fuera de base": conductor/vehículo que quedó en otro municipio tras una salida
    // que no volvió a Medellín (idDestinoActual). Para un regreso (salida.idSalidaIda)
    // SOLO se ofrecen los que quedaron en el municipio de la ida (== salida.origen,
    // que el backend fuerza así).
    const esRegreso = !!salida?.idSalidaIda
    const idaIdDestino = esRegreso
        ? (destinos.find(d => d.municipio === salida.origen)?.idDestino ?? null)
        : null
    const ubicacionOk = (idDestinoActual) => esRegreso
        ? idDestinoActual === idaIdDestino
        : (idDestinoActual === null || idDestinoActual === undefined)

    const vehiculosSeleccionables = vehiculos.filter(v => vehiculoDocumentosVigentes(v) && ubicacionOk(v.idDestinoActual))
    const conductoresSeleccionables = conductores.filter(c => conductorLicenciaVigente(c.categoriasLicencia) && ubicacionOk(c.idDestinoActual))
    const vehiculosExcluidos = vehiculos.length - vehiculosSeleccionables.length
    const conductoresExcluidos = conductores.length - conductoresSeleccionables.length

    const [form, setForm] = useState({
        origen: '', idRuta: '', pares: [{ idSalidaVehiculoConductor: '', idVehiculo: '', idConductor: '' }],
        fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: ''
    })

    useEffect(() => {
        if (salida && open) {
            setActiveStep(0)
            setErrores({})
            setApiError(null)
            setSinCambios(false)
            const paresSalida = salida.paresVehiculoConductor || []
            const pares = paresSalida.length > 0
                ? paresSalida.map(p => ({
                    idSalidaVehiculoConductor: p.idSalidaVehiculoConductor,
                    idVehiculo: p.idVehiculo || '',
                    idConductor: p.idConductor || '',
                }))
                : [{ idSalidaVehiculoConductor: '', idVehiculo: '', idConductor: '' }]
            const datos = {
                origen:          salida.origen          || '',
                idRuta:              salida.idRuta            || '',
                pares,
                fechaSalida:         salida.fechaSalida         || '',
                horaSalida:          salida.horaSalida          || '',
                fechaLlegadaEstimada:        salida.fechaLlegadaEstimada        || '',
                horaLlegadaEstimada: salida.horaLlegadaEstimada || '',
                observaciones:       salida.observaciones       || ''
            }
            setForm(datos)
            setOriginalData(datos)
            const vHab = getVehiculosHabilitados()
            const cHab = getConductoresHabilitados()
            setVehiculoInputs(pares.map(p => {
                const v = vHab.find(x => x.idVehiculo === parseInt(p.idVehiculo))
                if (v) return `${v.placa} — ${v.marca} ${v.modelo}`
                const original = paresSalida.find(x => x.idVehiculo === parseInt(p.idVehiculo))?.vehiculo
                return original ? `${original.placa} — ${original.marca} ${original.modelo}` : ''
            }))
            setConductorInputs(pares.map(p => {
                const c = cHab.find(x => x.idConductor === parseInt(p.idConductor))
                if (c) return `${c.nombre} ${c.apellido}`
                const original = paresSalida.find(x => x.idConductor === parseInt(p.idConductor))?.conductor?.usuario
                return original ? `${original.nombre} ${original.apellido}` : ''
            }))
            setRutaInput(salida.ruta ? getRutaLabel(salida.ruta) : '')
        }
    }, [salida, open, getVehiculosHabilitados, getConductoresHabilitados, getDestinosHabilitados])

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'origen') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        if (name === 'observaciones') value = filtrarObservacionesRuta(value)
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const capacidadCtx = { vehiculos, paresOriginales: salida?.paresVehiculoConductor }

    const handleParChange = (index, campo, value) => {
        const pares = form.pares.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: (prev.pares || campo === 'idVehiculo') ? validarPares(pares, capacidadCtx) : '' }))
        setApiError(null)
        setSinCambios(false)
    }

    const handleAgregarPar = () => {
        setForm(prev => ({ ...prev, pares: [...prev.pares, { idSalidaVehiculoConductor: '', idVehiculo: '', idConductor: '' }] }))
        setVehiculoInputs(prev => [...prev, ''])
        setConductorInputs(prev => [...prev, ''])
        setSinCambios(false)
    }

    const handleQuitarPar = (index) => {
        // Mismo chequeo que el backend al guardar ("No puedes quitar un vehículo de la
        // salida si ya tiene paquetes asignados").
        const parAQuitar = form.pares[index]
        const original = parAQuitar?.idSalidaVehiculoConductor
            ? (salida?.paresVehiculoConductor || []).find(p => p.idSalidaVehiculoConductor === parAQuitar.idSalidaVehiculoConductor)
            : null
        if (original && Number(original.paquetesAsignados || 0) > 0) {
            const cantidad = original.paquetesAsignados
            setErrores(prev => ({
                ...prev,
                pares: `No puedes quitar esta fila del convoy: ya tiene ${cantidad} paquete${cantidad > 1 ? 's' : ''} asignado${cantidad > 1 ? 's' : ''} en este par (actualmente ${original.vehiculo?.placa || 'sin placa'}).`,
            }))
            return
        }
        const pares = form.pares.filter((_, i) => i !== index)
        setForm(prev => ({ ...prev, pares }))
        setErrores(prev => ({ ...prev, pares: prev.pares ? validarPares(pares, capacidadCtx) : '' }))
        setVehiculoInputs(prev => prev.filter((_, i) => i !== index))
        setConductorInputs(prev => prev.filter((_, i) => i !== index))
        setSinCambios(false)
    }

    const getVehiculoOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idVehiculo))
        const base = vehiculos.filter(v => !usados.includes(v.idVehiculo) && vehiculoDocumentosVigentes(v) && ubicacionOk(v.idDestinoActual))
        if (par.idVehiculo && !base.some(v => v.idVehiculo === parseInt(par.idVehiculo))) {
            const original = (salida?.paresVehiculoConductor || []).find(p => p.idVehiculo === parseInt(par.idVehiculo))?.vehiculo
            if (original) return [...base, original]
        }
        return base
    }
    const getConductorOpciones = (index) => {
        const par = form.pares[index]
        const usados = form.pares.filter((_, i) => i !== index).map(p => parseInt(p.idConductor))
        const base = conductores.filter(c => !usados.includes(c.idConductor) && conductorLicenciaVigente(c.categoriasLicencia) && ubicacionOk(c.idDestinoActual))
        if (par.idConductor && !base.some(c => c.idConductor === parseInt(par.idConductor))) {
            const original = (salida?.paresVehiculoConductor || []).find(p => p.idConductor === parseInt(par.idConductor))?.conductor?.usuario
            if (original) return [...base, { idConductor: parseInt(par.idConductor), nombre: original.nombre, apellido: original.apellido }]
        }
        return base
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, capacidadCtx, esRegreso)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        if (activeStep === 2 && !esRegreso) {
            const indicesConDatos = form.pares
                .map((p, i) => (p.idVehiculo || p.idConductor) ? i : -1)
                .filter(i => i !== -1)
            if (indicesConDatos.length !== form.pares.length) {
                setVehiculoInputs(indicesConDatos.map(i => vehiculoInputs[i]))
                setConductorInputs(indicesConDatos.map(i => conductorInputs[i]))
                setForm(prev => ({ ...prev, pares: indicesConDatos.map(i => form.pares[i]) }))
            }
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        const erroresPorPaso = [0, 1, 2].map(s => validarPaso(s, form, capacidadCtx, esRegreso))
        const erroresEncontrados = Object.assign({}, ...erroresPorPaso)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(erroresPorPaso.findIndex(e => Object.keys(e).length > 0))
            return
        }

        if (originalData) {
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
            const { message } = await actualizarSalidaProgramada({
                idSalida: salida.idSalida,
                origen: form.origen,
                idRuta: parseInt(form.idRuta),
                ...(esRegreso ? {} : {
                    pares: form.pares
                        .filter(p => p.idVehiculo && p.idConductor)
                        .map(p => ({
                            ...(p.idSalidaVehiculoConductor ? { idSalidaVehiculoConductor: p.idSalidaVehiculoConductor } : {}),
                            idVehiculo: parseInt(p.idVehiculo),
                            idConductor: parseInt(p.idConductor),
                        })),
                }),
                fechaSalida: form.fechaSalida,
                horaSalida: form.horaSalida,
                fechaLlegadaEstimada: form.fechaLlegadaEstimada,
                horaLlegadaEstimada: form.horaLlegadaEstimada,
                observaciones: form.observaciones || ''
            })
            showToast(message || '¡Salida actualizada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al actualizar la salida'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ origen: '', idRuta: '', pares: [{ idSalidaVehiculoConductor: '', idVehiculo: '', idConductor: '' }], fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setOriginalData(null)
        setSinCambios(false)
        setRutaInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        onClose?.()
    }

    // Respaldo por si la plantilla ya fue inhabilitada desde que se creó esta salida.
    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form.idRuta)) || (
        salida?.ruta && parseInt(form.idRuta) === salida.idRuta
            ? { idRuta: salida.idRuta, idDestino: salida.ruta.idDestino, destino: salida.ruta.destino }
            : null
    )

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoRuta
                        theme={theme} form={form} errores={errores} setErrores={setErrores}
                        handleChange={handleChange}
                        rutas={rutas} rutaInput={rutaInput} setRutaInput={setRutaInput} rutaSeleccionada={rutaSeleccionada}
                        esRegreso={esRegreso}
                    />
                )
            case 1:
                return (
                    <PasoHorario
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores} setApiError={setApiError} handleChange={handleChange}
                        idSalidaExcluir={salida?.idSalida}
                        refrescarDisponibilidad={refrescarDisponibilidad} esRegreso={esRegreso}
                        afterChange={() => setSinCambios(false)}
                    />
                )
            case 2:
                return (
                    <PasoConvoy
                        theme={theme} form={form} errores={errores} setErrores={setErrores}
                        handleParChange={handleParChange} handleAgregarPar={handleAgregarPar} handleQuitarPar={handleQuitarPar}
                        esRegreso={esRegreso}
                        vehiculos={vehiculos} conductores={conductores} vehiculosExcluidos={vehiculosExcluidos} conductoresExcluidos={conductoresExcluidos}
                        vehiculoInputs={vehiculoInputs} setVehiculoInputs={setVehiculoInputs} conductorInputs={conductorInputs} setConductorInputs={setConductorInputs}
                        getVehiculoOpciones={getVehiculoOpciones} getConductorOpciones={getConductorOpciones}
                    />
                )
            case 3:
                return (
                    <PasoConfirmacion
                        theme={theme} form={form} formOriginal={originalData}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={sinCambios} setSinCambios={setSinCambios}
                        destinos={destinos} vehiculos={vehiculos} conductores={conductores} salida={salida}
                        rutaSeleccionada={rutaSeleccionada}
                    />
                )
            default: return null
        }
    }

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title="Editar Salida"
            subtitle={originalData?.origen
                ? `Modificando datos de ${originalData.origen} - ${resolveDestinoPartes(salida || {}, destinos).municipio}`
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

export default ActualizarSalidaProgramada
