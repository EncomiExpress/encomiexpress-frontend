import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Typography, Dialog } from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formatFecha } from '../../shared/utils/formatters.js'
import { steps, validarPaso, handleChangeAnticipo } from './validations/anticipoValidation.js'
import { usePaquetesPorPar } from './hooks/usePaquetesPorPar.js'
import { useAutoSeleccionParUnico } from './hooks/useAutoSeleccionParUnico.js'
import { useAnticiposActivos } from './hooks/useAnticiposActivos.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoRutaVehiculo from './components/wizard/PasoRutaVehiculo.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarAnticipoExcedente = ({ open, onClose, anticipo: anticipoProp, onSuccess }) => {
    const { anticipos, actualizarAnticipo, rutas, fetchRutasProgramadas } = useAnticipos()
    const { showToast } = useToast()
    const theme = useTheme()
    const [errores, setErrores] = useState({})
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [anticipoOriginal, setAnticipoOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)
    const [form, setForm] = useState(null)
    const cargado = useRef(false)
    const [rutaInput, setRutaInput] = useState('')
    const [parInput, setParInput] = useState('')

    // "rutas" (del contexto) solo se carga una vez por sesión — si una ruta se editó en
    // otra pantalla (ej. se le reasignó el conductor a un par) mientras el usuario seguía
    // logueado, este wizard vería la versión vieja sin este refresco al abrir.
    useEffect(() => {
        if (open) fetchRutasProgramadas({ limit: 1000 })
    }, [open, fetchRutasProgramadas])

    useEffect(() => {
        if (!open) { cargado.current = false; return }
        if (!anticipoProp || cargado.current) return
        cargado.current = true
        setActiveStep(0)
        setErrores({})
        setSinCambios(false)
        // Preferir la versión más reciente desde el estado del contexto
        const anticipo = anticipos.find(a => a.idAnticipoExcedente === anticipoProp.idAnticipoExcedente) || anticipoProp
        setAnticipoOriginal(anticipo)
        // "rutas" del contexto solo trae rutas "Programada" (son las únicas asignables a
        // un anticipo nuevo) — la ruta real de este anticipo puede ya estar "En Ruta" o
        // más adelante, así que si no aparece ahí se arma un par sintético con los datos
        // que ya trae el anticipo, solo para mostrarlo (el campo queda deshabilitado).
        const r = rutas.find(x => x.idRuta === anticipo.idRuta)
        const parInicial = r?.paresVehiculoConductor?.find(p => p.idConductor === anticipo.idConductor)
        const nombreConductorAnticipo = anticipo.conductor?.usuario
            ? `${anticipo.conductor.usuario.nombre} ${anticipo.conductor.usuario.apellido}`
            : '—'
        const parSintetico = !r ? {
            idRutaVehiculoConductor: `original-${anticipo.idConductor}`,
            idVehiculo: anticipo.ruta?.vehiculo?.idVehiculo,
            idConductor: anticipo.idConductor,
            placa: anticipo.ruta?.vehiculo?.placa || '',
            conductorNombre: nombreConductorAnticipo,
        } : null
        const datos = {
            ...anticipo,
            idRutaVehiculoConductor: parInicial?.idRutaVehiculoConductor || parSintetico?.idRutaVehiculoConductor || '',
            fechaEntrega: anticipo.fechaEntrega || '',
            // valorAnticipo llega como string desde el backend por ser columna DECIMAL
            // (ej. "500000.00") — se limpia a entero plano para que nunca se vea el
            // ".00" en el campo ni en la comparación de cambios.
            valorAnticipo: anticipo.valorAnticipo !== undefined && anticipo.valorAnticipo !== null
                ? String(Math.round(Number(anticipo.valorAnticipo)))
                : '',
        }
        setFormOriginal(datos)
        setForm(datos)
        setRutaInput(r ? getEtiquetaRuta(r) : (getEtiquetaRuta(anticipo.ruta) || ''))
        const parActivo = parInicial || parSintetico
        setParInput(parActivo ? `${parActivo.placa || 'Sin placa'} — ${parActivo.conductorNombre}` : '')
    }, [open, anticipoProp, anticipos, rutas])

    const { paquetesPorPar, loading: cargandoPaquetesPorPar } = usePaquetesPorPar(form?.idRuta)
    // excluirIdAnticipo: este mismo anticipo no debe contar contra sí mismo al decidir
    // qué rutas/pares ya "tienen anticipo activo" — igual que el backend con
    // `idAnticipoExcedente: Op.ne` en update() (ver anticipoService.js).
    const { filtrarRutasDisponibles, filtrarParesDisponibles } = useAnticiposActivos({ excluirIdAnticipo: anticipoProp?.idAnticipoExcedente })

    // Si la ruta ya avanzó de estado no aparece en "rutas" (solo trae "Programada") —
    // se arma una opción sintética con los datos del anticipo para que el Autocomplete
    // no quede vacío. Calculado antes de handleChange/handleNext porque ambos la usan.
    const nombreConductorOriginal = anticipoOriginal?.conductor?.usuario
        ? `${anticipoOriginal.conductor.usuario.nombre} ${anticipoOriginal.conductor.usuario.apellido}`
        : '—'
    // Objeto sintético memoizado: si no se memoiza, se recrea (nueva referencia) en cada
    // render y el Autocomplete de Ruta lo interpreta como "el valor cambió" en cada tecla
    // que se escribe para buscar, reseteando el input al texto de la ruta — bloqueando la
    // búsqueda por completo. Solo depende de anticipoOriginal (estable mientras el modal
    // sigue abierto) y del nombre del conductor original.
    const rutaSintetica = useMemo(() => (
        anticipoOriginal?.ruta
            ? {
                idRuta: anticipoOriginal.idRuta,
                nombre: anticipoOriginal.ruta.origen || `Ruta ${anticipoOriginal.idRuta}`,
                destino: anticipoOriginal.ruta.destino || null,
                fechaSalida: anticipoOriginal.ruta.fechaSalida || null,
                paresVehiculoConductor: [{
                    idRutaVehiculoConductor: `original-${anticipoOriginal.idConductor}`,
                    idVehiculo: anticipoOriginal.ruta.vehiculo?.idVehiculo,
                    idConductor: anticipoOriginal.idConductor,
                    placa: anticipoOriginal.ruta.vehiculo?.placa || '',
                    conductorNombre: nombreConductorOriginal,
                }],
            }
            : null
    ), [anticipoOriginal, nombreConductorOriginal])

    // El objeto sintético solo debe mostrarse mientras el campo siga en la ruta ORIGINAL
    // del anticipo (form.idRuta === anticipoOriginal.idRuta) — si el usuario lo limpia con
    // la "x" (form.idRuta pasa a ''), antes esto caía igual al sintético porque solo miraba
    // si anticipoOriginal tenía ruta, ignorando que ya se había limpiado a propósito.
    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form?.idRuta)) || (
        form?.idRuta && String(form.idRuta) === String(anticipoOriginal?.idRuta) ? rutaSintetica : null
    )
    // Rutas donde ya no queda ningún par vehículo-conductor sin anticipo activo (aparte
    // de este mismo anticipo, excluido arriba) no se ofrecen en el buscador.
    const rutasDisponibles = filtrarRutasDisponibles(rutas)

    const handleChange = (e) => handleChangeAnticipo(e, form, setForm, setErrores, { onCambio: () => setSinCambios(false), rutaSeleccionada })

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, rutaSeleccionada)
        if (Object.keys(erroresEncontrados).length > 0) { setErrores(erroresEncontrados); return }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        // Verificar si hay cambios reales
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

        // handleSubmit no llamaba a ninguna validación en absoluto — a diferencia de
        // Registrar (que sí la llamaba, pero contra el paso "Confirmación" sin campos
        // propios, un no-op) acá faltaba por completo. Revalida el único paso con
        // contenido (0) antes de guardar — ver LOGICA.md.
        const erroresEncontrados = validarPaso(0, form, rutaSeleccionada)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            setActiveStep(0)
            return
        }

        setSinCambios(false)
        setSubmitting(true)
        try {
            // Este modal solo se abre con el anticipo en "Entregado" (el ícono
            // "Editar" del listado ya bloquea cualquier otro estado — legalizar
            // el anticipo, es decir registrar valorGastado, quedó como algo que
            // solo hace el conductor desde la app móvil). Por eso aquí solo se
            // mandan los campos de esa etapa.
            // `soporte` (comprobantes) no se edita desde la web — la subida de
            // archivos es exclusiva de la app móvil (POST /anticipos/:id/soporte),
            // así que no se reenvía acá.
            const payload = {
                idAnticipoExcedente: form.idAnticipoExcedente,
            }
            if (puedeEditarAsignacion) {
                payload.idRuta = form.idRuta
                payload.idRutaVehiculoConductor = form.idRutaVehiculoConductor
                payload.valorAnticipo = form.valorAnticipo
                payload.fechaEntrega = form.fechaEntrega
            }
            await actualizarAnticipo(payload)
            showToast('¡Anticipo actualizado exitosamente!', 'success')
            setTimeout(() => {
                cerrar()
                if (onSuccess) onSuccess()
            }, 1500)
        } catch (err) {
            setErrores({ submit: getErrorMessage(err, 'Error al actualizar el anticipo.') })
        } finally {
            setSubmitting(false)
        }
    }

    const cerrar = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        onClose()
    }

    const handleCancelar = () => cerrar()

    // Si la ruta elegida sigue "Programada", su conductor manda (por si se reasignó
    // el anticipo a otra ruta). Si no aparece ahí (ya avanzó de estado), se usa el
    // conductor que ya traía el anticipo desde que se cargó.
    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    // Del select de "Vehículo y conductor" solo se ofrecen los pares que todavía no
    // tienen anticipo activo (aparte de este mismo anticipo) — los que ya tienen uno no
    // aparecen ahí, ni deshabilitados.
    const paresDisponibles = filtrarParesDisponibles(pares, rutaSeleccionada?.idRuta)
    const parSeleccionado = paresDisponibles.find(p => p.idRutaVehiculoConductor === form?.idRutaVehiculoConductor)

    // Si se reasigna a una ruta donde solo queda un vehículo+conductor disponible (sin
    // anticipo activo), no tiene caso elegir — se autocompleta, igual que en
    // RegistrarAnticipoExcedente.jsx. Solo aplica mientras la asignación sigue siendo
    // editable (anticipo en estado "Entregado").
    useAutoSeleccionParUnico(form?.idRuta, paresDisponibles, setForm, setParInput, anticipoOriginal?.estado === 'Entregado')

    const getNombreConductor = () => parSeleccionado?.conductorNombre || nombreConductorOriginal

    const getEtiquetaRuta = (ruta) => {
        if (!ruta) return null
        const origen = ruta.nombre || ruta.origen || 'Sin nombre'
        const destino = ruta.destino
        const destinoTxt = destino ? destino.municipio : 'Sin destino'
        const tarifa = destino?.tarifaBase != null ? ` — $${Number(destino.tarifaBase).toLocaleString('es-CO')}` : ''
        return `${origen} → ${destinoTxt}${tarifa}`
    }

    const getNombreRuta = (id) => {
        const r = rutas.find(r => r.idRuta === parseInt(id))
        return r ? getEtiquetaRuta(r) : (getEtiquetaRuta(anticipoOriginal?.ruta) || '—')
    }

    // La ruta/conductor/valor del anticipo/fecha de entrega solo se pueden tocar
    // mientras el anticipo sigue "Entregado" (la ruta todavía no arrancó). De ahí
    // en adelante (En Legalización/Excedente pendiente/Completado) ni siquiera se
    // llega a abrir este modal (el ícono "Editar" ya queda bloqueado en la lista)
    // — legalizar el anticipo es tarea exclusiva del conductor desde la app móvil.
    const estadoActual = anticipoOriginal?.estado
    const puedeEditarAsignacion = estadoActual === 'Entregado'

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoRutaVehiculo
                        theme={theme} form={form} errores={errores} setErrores={setErrores} setForm={setForm} handleChange={handleChange}
                        rutas={rutasDisponibles} rutaSeleccionada={rutaSeleccionada} pares={paresDisponibles} parSeleccionado={parSeleccionado} paquetesPorPar={paquetesPorPar}
                        rutaInput={rutaInput} setRutaInput={setRutaInput} parInput={parInput} setParInput={setParInput}
                        getEtiquetaRuta={getEtiquetaRuta}
                        afterChange={() => setSinCambios(false)}
                        rutaDisabled={!puedeEditarAsignacion} parDisabled={!puedeEditarAsignacion}
                        valorDisabled={!puedeEditarAsignacion} fechaDisabled={!puedeEditarAsignacion}
                        rutaHelperTextOk="Busca por origen de la ruta"
                        rutaHelperTextDisabled="La ruta ya arrancó: no se puede reasignar"
                        parHelperTextDisabled="La ruta ya arrancó: no se puede reasignar"
                        valorHelperTextDisabled="La ruta ya arrancó: no se puede modificar"
                        fechaHelperTextDisabled="La ruta ya arrancó: no se puede modificar"
                        mostrarAdvertencia={!!(!cargandoPaquetesPorPar && puedeEditarAsignacion && parSeleccionado && !(paquetesPorPar[parSeleccionado.idRutaVehiculoConductor] > 0))}
                    />
                )

            case 1: {
                const sonDistintos = (a, b) => String(a ?? '') !== String(b ?? '')
                const camposComparados = formOriginal ? [
                    [form.idRutaVehiculoConductor, formOriginal.idRutaVehiculoConductor],
                    [form.idRuta, formOriginal.idRuta],
                    [form.valorAnticipo, formOriginal.valorAnticipo],
                    [form.fechaEntrega, formOriginal.fechaEntrega],
                ] : []
                const totalModificados = camposComparados.filter(([a, b]) => sonDistintos(a, b)).length

                return (
                    <PasoConfirmacion
                        theme={theme} errorSubmit={errores.submit} esEdicion={true}
                        totalModificados={totalModificados} sinCambios={sinCambios} setSinCambios={setSinCambios}
                        nombreRuta={getNombreRuta(form?.idRuta)} previousNombreRuta={formOriginal ? getNombreRuta(formOriginal.idRuta) : undefined}
                        placa={parSeleccionado?.placa} nombreConductor={getNombreConductor()} previousNombreConductor={formOriginal ? nombreConductorOriginal : undefined}
                        valorAnticipo={form?.valorAnticipo} previousValorAnticipo={formOriginal ? formOriginal.valorAnticipo : undefined}
                        fechaEntrega={formatFecha(form?.fechaEntrega)} previousFechaEntrega={formOriginal ? formatFecha(formOriginal.fechaEntrega) : undefined}
                    />
                )
            }

            default:
                return null
        }
    }

    if (!open) return null

    if (!form || !anticipoOriginal) {
        return (
            <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth>
                <Box sx={{ p: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <Typography color={theme.palette.text.secondary}>Cargando datos del anticipo...</Typography>
                </Box>
            </Dialog>
        )
    }

    return (
        <WizardDialog
            open={open} onClose={handleCancelar}
            title="Editar Anticipo / Excedente" subtitle="Modifica los campos que necesites."
            steps={steps} activeStep={activeStep}
            onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit}
            submitting={submitting} submitDisabled={sinCambios}
            submitLabel={sinCambios ? 'Sin cambios' : 'Guardar cambios'} submitIcon={<SaveOutlinedIcon />}
        >
            {renderStepContent()}
        </WizardDialog>
    )
}

export default ActualizarAnticipoExcedente
