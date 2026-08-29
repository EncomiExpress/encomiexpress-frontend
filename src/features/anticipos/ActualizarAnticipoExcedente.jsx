import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Dialog } from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { useAnticipos } from './context/AnticipoExcedenteContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formatFecha } from '../../shared/utils/formatters.js'
import { steps, validarPaso, handleChangeAnticipo } from './validations/anticipoValidation.js'
import { usePaquetesPorPar } from './hooks/usePaquetesPorPar.js'
import { useAutoSeleccionParUnico } from './hooks/useAutoSeleccionParUnico.js'
import WizardDialog from '../../shared/components/WizardDialog.jsx'
import PasoRutaVehiculo from './components/wizard/PasoRutaVehiculo.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarAnticipoExcedente = ({ open, onClose, anticipo: anticipoProp, onSuccess }) => {
    const { anticipos, actualizarAnticipo, rutas } = useAnticipos()
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

    // Si se reasigna a una ruta con un solo vehículo+conductor, no tiene caso elegir — se
    // autocompleta, igual que en RegistrarAnticipoExcedente.jsx. Solo aplica mientras la
    // asignación sigue siendo editable (anticipo en estado "Entregado").
    useAutoSeleccionParUnico(form?.idRuta, rutas, setForm, setParInput, anticipoOriginal?.estado === 'Entregado')

    const paquetesPorPar = usePaquetesPorPar(form?.idRuta)

    const handleChange = (e) => handleChangeAnticipo(e, form, setForm, setErrores, { onCambio: () => setSinCambios(false) })

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form)
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
    const nombreConductorOriginal = anticipoOriginal?.conductor?.usuario
        ? `${anticipoOriginal.conductor.usuario.nombre} ${anticipoOriginal.conductor.usuario.apellido}`
        : '—'

    // Si la ruta ya avanzó de estado no aparece en "rutas" (solo trae "Programada") —
    // se arma una opción sintética con los datos del anticipo para que el Autocomplete no quede vacío.
    const rutaSeleccionada = rutas.find(r => r.idRuta === parseInt(form?.idRuta)) || (
        anticipoOriginal?.ruta
            ? {
                idRuta: anticipoOriginal.idRuta,
                nombre: anticipoOriginal.ruta.origen || `Ruta ${anticipoOriginal.idRuta}`,
                destino: anticipoOriginal.ruta.destino || null,
                paresVehiculoConductor: [{
                    idRutaVehiculoConductor: `original-${anticipoOriginal.idConductor}`,
                    idVehiculo: anticipoOriginal.ruta.vehiculo?.idVehiculo,
                    idConductor: anticipoOriginal.idConductor,
                    placa: anticipoOriginal.ruta.vehiculo?.placa || '',
                    conductorNombre: nombreConductorOriginal,
                }],
            }
            : null
    )
    const pares = rutaSeleccionada?.paresVehiculoConductor || []
    const parSeleccionado = pares.find(p => p.idRutaVehiculoConductor === form?.idRutaVehiculoConductor)

    const getNombreConductor = () => parSeleccionado?.conductorNombre || nombreConductorOriginal

    const getEtiquetaRuta = (ruta) => {
        if (!ruta) return null
        const origen = ruta.nombre || ruta.origen || 'Sin nombre'
        const destino = ruta.destino
        const destinoTxt = destino ? destino.ciudad : 'Sin destino'
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
                        rutas={rutas} rutaSeleccionada={rutaSeleccionada} pares={pares} parSeleccionado={parSeleccionado} paquetesPorPar={paquetesPorPar}
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
                        mostrarAdvertencia={!!(puedeEditarAsignacion && parSeleccionado && !(paquetesPorPar[parSeleccionado.idRutaVehiculoConductor] > 0))}
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
