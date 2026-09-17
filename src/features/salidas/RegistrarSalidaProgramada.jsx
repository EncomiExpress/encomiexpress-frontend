import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
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
import { esMunicipioOrigen } from '../../shared/config/negocio.js'
import { getRutaLabel } from '../rutas/utils/rutaResolvers.js'
import { filtrarObservacionesRuta } from '../../shared/validations/observacionesRutaValidation.js'
import PasoRuta from './components/wizard/PasoRuta.jsx'
import PasoHorario from './components/wizard/PasoHorario.jsx'
import PasoConvoy from './components/wizard/PasoConvoy.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

// `prefill` (opcional): datos con los que arranca el formulario — tres modos
// distintos, según lo que traiga:
// - "Programar regreso" (`idSalidaIda` presente, ListarSalidaProgramada.jsx
//   handleProgramarRegreso): precarga origen/pares de la ida ya Completada. La
//   plantilla del paso "Ruta" no se elige a mano: se resuelve sola hacia la
//   base (Medellín) -- ver `rutaRegresoResuelta` más abajo. El backend general
//   (POST /salidas) sigue exigiendo `idRuta` incluso para un regreso disparado
//   desde acá (a diferencia de POST /salidas/:id/regreso-sede, que es
//   exclusivo de operador_sede y arma su propia plantilla "Regreso a
//   Medellín" solo).
// - "Reutilizar salida" (`reutilizar: true`, handleReutilizarSalida): precarga la
//   MISMA plantilla y convoy de una ida ya Completada, sin invertir nada. No
//   manda `idSalidaIda`: la salida que se cree queda totalmente independiente.
// - Vista "Salidas de una ruta" (solo `idRuta`, sin `idSalidaIda` ni `reutilizar`
//   — se llega desde Rutas/ListarRuta.jsx, botón "Salidas" -> navega a
//   /transporte/rutas/:idRuta/salidas, y CUALQUIER "Nuevo" desde ahí manda este
//   prefill): la plantilla ya está decidida por el contexto de la página (no por
//   una elección puntual del usuario), así que el paso "Ruta" ni siquiera se
//   muestra en el stepper -- sería mostrarle de vuelta algo que ya escogió al
//   entrar a esa vista. El resto del formulario (horario/convoy) se completa a
//   mano como si fuera nuevo.
const RegistrarSalidaProgramada = ({ open, onClose, onSuccess, prefill }) => {
    const { registrarSalidaProgramada } = useSalidaProgramacion()
    const { getRutasHabilitadas } = useRuta()
    const { showToast } = useToast()
    const theme = useTheme()
    const { getVehiculosHabilitados } = useVehiculo()
    const { getConductoresHabilitados } = useConductor()
    const { getDestinosHabilitados }    = useDestino()

    const [errores, setErrores]       = useState({})
    const [apiError, setApiError]     = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
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

    const esRegreso = !!prefill?.idSalidaIda
    const esReutilizar = !!prefill?.reutilizar

    // En un regreso, la plantilla no se elige a mano: siempre es la única Ruta cuyo
    // destino es la base (Medellín) -- la misma que crea/reutiliza
    // crearRegresoDesdeSede para todos los regresos (sin nombre propio, se
    // identifica solo por su idDestino). Si no existe ninguna, el campo queda
    // inválido y avisa que hace falta crear una en el módulo Rutas.
    const medellin = destinos.find(d => esMunicipioOrigen(d.municipio))
    const rutaRegresoResuelta = esRegreso
        ? (rutas.find(r => r.idDestino === medellin?.idDestino) || null)
        : null

    const idaIdDestino = esRegreso
        ? (destinos.find(d => d.municipio === prefill.origen)?.idDestino ?? null)
        : null
    const ubicacionOk = (idDestinoActual) => esRegreso
        ? idDestinoActual === idaIdDestino
        : (idDestinoActual === null || idDestinoActual === undefined)

    const vehiculosSeleccionables = vehiculos.filter(v => vehiculoDocumentosVigentes(v) && ubicacionOk(v.idDestinoActual))
    const conductoresSeleccionables = conductores.filter(c => conductorLicenciaVigente(c.categoriasLicencia) && ubicacionOk(c.idDestinoActual))
    const vehiculosExcluidos = vehiculos.length - vehiculosSeleccionables.length
    const conductoresExcluidos = conductores.length - conductoresSeleccionables.length

    const [form, setForm] = useState({
        origen: 'Medellín',
        idRuta: '',
        pares: [{ idVehiculo: '', idConductor: '' }],
        fechaSalida: '',
        horaSalida: '',
        fechaLlegadaEstimada: '',
        horaLlegadaEstimada: '',
        observaciones: ''
    })

    // Aplica el prefill (si viene) cada vez que se abre el diálogo.
    useEffect(() => {
        if (!open || !prefill) return
        setForm(prev => ({
            ...prev,
            origen: prefill.origen || prev.origen,
            idRuta: prefill.idRuta || prev.idRuta,
            pares: prefill.pares?.length > 0
                ? prefill.pares.map(p => ({
                    idVehiculo: p.idVehiculo || '',
                    idConductor: p.idConductor || '',
                }))
                : prev.pares,
            idSalidaIda: prefill.idSalidaIda || undefined,
            // Precargado de horario (solo lo manda "Asignar salida" -> handleAbrirNuevo en
            // ListarSalidaProgramada.jsx, con la fecha/hora de la última salida de esta
            // misma Ruta) -- sigue siendo editable, es solo un punto de partida.
            fechaSalida: prefill.fechaSalida || prev.fechaSalida,
            horaSalida: prefill.horaSalida || prev.horaSalida,
            fechaLlegadaEstimada: prefill.fechaLlegadaEstimada || prev.fechaLlegadaEstimada,
            horaLlegadaEstimada: prefill.horaLlegadaEstimada || prev.horaLlegadaEstimada,
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
        // "Asignar salida" (Rutas/ListarRuta.jsx): la plantilla ya viene decidida —
        // mostrar igual el paso "Ruta" sería redundante, así que se arranca
        // directo en "Horario". El paso "Ruta" sigue existiendo por si el usuario
        // quiere volver con "Anterior" a revisarlo o cambiarlo.
        if (prefill.idRuta && !prefill.idSalidaIda && !prefill.reutilizar) {
            setActiveStep(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr al abrir con un prefill nuevo
    }, [open, prefill])

    // Fija la plantilla resuelta del regreso en cuanto el catálogo de rutas/destinos
    // esté disponible (puede no estarlo todavía cuando corre el efecto del prefill).
    useEffect(() => {
        if (!open || !esRegreso || !rutaRegresoResuelta) return
        if (form.idRuta === rutaRegresoResuelta.idRuta) return
        setForm(prev => ({ ...prev, idRuta: rutaRegresoResuelta.idRuta }))
    }, [open, esRegreso, rutaRegresoResuelta, form.idRuta])

    // "Asignar salida" (prefill solo con idRuta, sin idSalidaIda/reutilizar): el
    // texto visible del Autocomplete de Ruta no se fija en el efecto del prefill de
    // arriba porque `rutas` puede no estar cargado todavía en ese momento.
    useEffect(() => {
        if (!open || !prefill?.idRuta || esRegreso || rutaInput) return
        const r = rutas.find(x => x.idRuta === parseInt(prefill.idRuta))
        if (r) setRutaInput(getRutaLabel(r))
    }, [open, prefill, esRegreso, rutas, rutaInput])

    const handleChange = (e) => {
        let { name, value } = e.target
        if (name === 'origen') value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]/g, '')
        if (name === 'observaciones') value = filtrarObservacionesRuta(value)
        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
    }

    const handleParChange = (index, campo, value) => {
        const pares = form.pares.map((p, i) => i === index ? { ...p, [campo]: value } : p)
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

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, undefined, esRegreso)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        if (activeStep === 2 && !esRegreso) {
            // Limpieza silenciosa al avanzar: quita filas de par totalmente vacías
            // (ni vehículo ni conductor).
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
        const erroresPorPaso = [0, 1, 2].map(s => validarPaso(s, form, undefined, esRegreso))
        const erroresEncontrados = Object.assign({}, ...erroresPorPaso)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(erroresPorPaso.findIndex(e => Object.keys(e).length > 0))
            return
        }

        setSubmitting(true)
        setApiError(null)
        try {
            await registrarSalidaProgramada({
                origen: form.origen,
                idRuta: parseInt(form.idRuta),
                // En un regreso, el convoy lo hereda el backend de la ida -- no se manda
                // `pares` (si se manda y no coincide EXACTO con el de la ida, el backend
                // lo rechaza, ver REGLA NUEVA en salidaProgramadaService.js).
                ...(esRegreso ? {} : {
                    pares: form.pares
                        .filter(p => p.idVehiculo && p.idConductor)
                        .map(p => ({
                            idVehiculo: parseInt(p.idVehiculo),
                            idConductor: parseInt(p.idConductor),
                        })),
                }),
                fechaSalida: form.fechaSalida,
                horaSalida: form.horaSalida,
                fechaLlegadaEstimada: form.fechaLlegadaEstimada,
                horaLlegadaEstimada: form.horaLlegadaEstimada,
                ...(form.idSalidaIda ? { idSalidaIda: form.idSalidaIda } : {}),
                observaciones: form.observaciones || '',
                estado: 'Programada'
            })
            showToast('¡Salida programada exitosamente!', 'success')
            setTimeout(() => { handleClose(); onSuccess?.() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la salida'))
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({ origen: 'Medellín', idRuta: '', pares: [{ idVehiculo: '', idConductor: '' }], fechaSalida: '', horaSalida: '', fechaLlegadaEstimada: '', horaLlegadaEstimada: '', observaciones: '' })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setRutaInput('')
        setVehiculoInputs([''])
        setConductorInputs([''])
        onClose?.()
    }

    const rutaSeleccionada = esRegreso ? rutaRegresoResuelta : (rutas.find(r => r.idRuta === parseInt(form.idRuta)) || null)

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
                        refrescarDisponibilidad={refrescarDisponibilidad} esRegreso={esRegreso}
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
                        theme={theme} form={form} formOriginal={null}
                        apiError={apiError} setApiError={setApiError}
                        sinCambios={false} setSinCambios={() => {}}
                        destinos={destinos} vehiculos={vehiculos} conductores={conductores}
                        rutaSeleccionada={rutaSeleccionada}
                    />
                )
            default: return null
        }
    }

    // La plantilla ya viene fija por contexto (vista "Salidas de una ruta") — el
    // paso "Ruta" no debe ni aparecer en el stepper, no solo saltarse. `activeStep`
    // sigue usando el índice "real" (0=Ruta,1=Horario,2=Convoy,3=Confirmación) para
    // toda la lógica de handlers/validación; acá se traduce a lo que de verdad se
    // le muestra a WizardDialog (que decide con esos props si el botón "Anterior"
    // está deshabilitado y cuál paso resalta).
    const ocultarPasoRuta = !!prefill?.idRuta && !esRegreso && !esReutilizar
    const stepsVisibles = ocultarPasoRuta ? steps.slice(1) : steps
    const activeStepVisible = ocultarPasoRuta ? activeStep - 1 : activeStep

    return (
        <WizardDialog
            open={open} onClose={handleClose}
            title={esReutilizar ? 'Reutilizar Salida' : esRegreso ? 'Programar Regreso' : prefill?.idRuta ? 'Nueva Salida' : 'Registrar Salida'}
            subtitle={esReutilizar ? 'Revisa los datos precargados de la salida y complétalos.' : esRegreso ? 'Revisa los datos precargados del viaje de vuelta y complétalos.' : prefill?.idRuta ? `Programa el viaje paso a paso para ${rutaSeleccionada ? getRutaLabel(rutaSeleccionada) : 'esta ruta'}.` : 'Elige la ruta y programa el viaje paso a paso.'}
            steps={stepsVisibles} activeStep={activeStepVisible}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitLabel="Registrar" submitIcon={<CheckOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default RegistrarSalidaProgramada
