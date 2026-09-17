import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../shared/contexts/AuthContext.jsx'
import { limpiarMonedaInput, limpiarDecimalInput, capitalizarPalabras } from '../../../shared/utils/formatters.js'
import { sumarDias } from '../../../shared/utils/horarioLaboral.js'
import { filtrarDireccion } from '../../../shared/validations/direccionValidation.js'
import { filtrarCorreo } from '../../../shared/validations/emailValidation.js'
import { filtrarTelefono } from '../../../shared/validations/telefonoValidation.js'
import { PAQUETE_VACIO, validarCampo, validarCampoPaquete, esDocAlfanumerico, formatearNit } from '../validations/validacion.js'
import {
    NUMERIC_LIMITS, PAQUETE_NUMERIC_LIMITS,
    calcularValorServicio as calcularValorServicioBase, calcularValoresPaquetes, validarPaso,
} from '../validations/ventaValidation.js'

// Orquestación del wizard de Ventas compartida entre RegistrarVenta.jsx y
// ActualizarVenta.jsx: los 4 useEffect de refresco/auto-asignación y los handlers de
// campos/paquetes/navegación son byte a byte (o casi) idénticos entre ambos — la única
// diferencia real es qué pasa DESPUÉS de cada cambio (afterChange no-op en Registrar,
// setSinCambios(false) en Actualizar) y qué validación extra aplica handleNext
// (validarPasoOpts, vacío en Registrar). Lo que NO vive acá porque es genuinamente
// distinto entre ambos: handleSubmit/el payload al backend, la hidratación desde una
// venta existente, el estado sinCambios/formOriginal, y el modal de "nuevo cliente".
export const useVentaWizardForm = ({
    initialForm,
    salidasProgramadas, fetchSalidasProgramadas,
    tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion,
    ventaOriginal = null,
    afterChange = () => {},
    getPesoOriginalPorPar,
}) => {
    // Contexto de sede — solo tiene efecto para operador_sede (WS5, "Sedes
    // remotas"): ahí el paso "Envío" ofrece regresos en vez de idas.
    const { usuario, sedeActual } = useAuth()
    const esOperadorSede = usuario?.rol?.codigo === 'operador_sede'

    // true en cuanto el admin edita "Total a pagar" a mano — a partir de ahí el
    // refresco de tarifas de los pasos "Paquete"/"Pago" (más abajo) deja de recalcularlo
    // por encima, hasta que vuelva a cambiar la salida o el peso/cantidad de paquetes.
    const valorServicioManualRef = useRef(false)
    // Un elemento DOM por paquete (índice), para poder hacer scroll hasta el primero
    // que quede con error al intentar avanzar de paso — ver handleNext.
    const paqueteRefs = useRef([])
    // Un elemento DOM por campo del paso "Participantes" (índice = nombre del campo),
    // mismo propósito que paqueteRefs pero para campos sueltos en vez de una lista.
    // setParticipanteRef (no participantesRefs directo) es lo que se pasa a
    // PasoParticipantes.jsx -- mutar un ref recibido por props dentro de un callback
    // de ref choca con la regla react-hooks/immutability del linter; pasar una función
    // que hace la mutación del lado de quien es dueño del ref (acá) sí es válido.
    const participantesRefs = useRef({})
    const setParticipanteRef = (campo, el) => { participantesRefs.current[campo] = el }
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [clienteInput, setClienteInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')
    const [form, setForm] = useState(initialForm)

    useEffect(() => {
        fetchSalidasProgramadas({ limit: 1000 }).catch(() => null)
    }, [fetchSalidasProgramadas])

    // Las tarifas por kg (hierro/normal) y por paquete pueden cambiar mientras el
    // formulario sigue abierto -- igual que el refresco del paso "Pago" más abajo, se
    // refrescan al ENTRAR al paso "Paquete" (índice 1) para que el preview de peso
    // volumétrico/costo por paquete (calculado en vivo en el render de PasoPaquetes.jsx
    // a partir de tarifaPorKgHierro/tarifaPorKgNormal) nunca quede con tarifas obsoletas.
    // Si ya hay una salida elegida (se volvió con "Anterior" desde un paso posterior),
    // además recalcula total con los datos frescos, respetando
    // valorServicioManualRef.
    useEffect(() => {
        if (activeStep !== 1) return
        let cancelado = false
        fetchConfiguracion().then((tarifasFrescas) => {
            if (cancelado || valorServicioManualRef.current) return
            setForm(prev => {
                const resultado = calcularValoresPaquetes(
                    prev.idSalida, prev.paquetes, salidasProgramadas,
                    tarifasFrescas?.tarifaPorKgHierro ?? tarifaPorKgHierro,
                    tarifasFrescas?.tarifaPorKgNormal ?? tarifaPorKgNormal,
                    tarifasFrescas?.tarifaPorPaquete ?? tarifaPorPaquete,
                )
                return Object.keys(resultado).length > 0 ? { ...prev, ...resultado } : prev
            })
        }).catch(() => {})
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep])

    // No hay tiempo real (WebSockets) en este proyecto — el peso ya usado de cada
    // vehículo (pesoUsado) se trae una sola vez al montar y puede quedar desactualizado
    // si alguien más registra otra venta mientras este formulario sigue abierto. Para
    // no dejarlo obsoleto toda la sesión, se refresca cada vez que se ENTRA al paso
    // "Envío" (índice 2) — sin importar la dirección (llegando con "Siguiente" desde
    // Paquete, o volviendo con "Anterior" desde Pago): ambos casos hacen que activeStep
    // pase a valer 2, así que basta con reaccionar a ese valor, no a qué botón se usó.
    useEffect(() => {
        if (activeStep !== 2) return
        let cancelado = false
        fetchSalidasProgramadas({ limit: 1000 }).then(salidasFrescas => {
            if (cancelado) return
            setForm(prev => {
                if (!prev.idSalida) return prev
                const ruta = (salidasFrescas || []).find(r => r.idSalida === parseInt(prev.idSalida))
                // Bug corregido (2026-09-07): fetchSalidasProgramadas({limit:1000}) trae
                // TODAS las salidas sin filtrar por estado/habilitado, así que `find()`
                // siempre "encontraba" una salida Cancelada/inhabilitada/etc. — este chequeo
                // solo miraba `!ruta` (ausente del todo), nunca disparaba para una salida que
                // sigue existiendo pero ya no sirve, y el selector se quedaba mostrando esa
                // salida inválida como si nada (típico al editar una venta que quedó
                // Cancelada por esa razón). Mismo criterio que rutaSigueSirviendo() del
                // backend — ver utils/ventaResolvers.js, motivoVentaCancelada().
                //
                // Se le sumó (2026-09-13, ver LOGICA.md "Ventas huérfanas al editar el
                // destino de una ruta"): la salida puede seguir Programada y habilitada,
                // pero haber dejado de cubrir el destino de ESTA venta (le cambiaron el
                // destino final de su plantilla). Mismo criterio que
                // motivoVentaCancelada() -- si no calza, se trata igual que "la salida ya
                // no sirve" y se limpia el selector, para que la usuaria elija una nueva
                // salida a propósito en vez de guardar sin darse cuenta.
                const idDestinoVenta = parseInt(prev.idDestinoDestinatario) || null
                const destinoFueraDeRuta = !!ruta && idDestinoVenta != null && idDestinoVenta !== ruta.ruta?.idDestino
                if (!ruta || ruta.estado !== 'Programada' || ruta.habilitado === false || destinoFueraDeRuta) {
                    // La salida ya no sirve (salió, se completó, se canceló, se inhabilitó)
                    // — se limpia la selección en vez de dejar un id "fantasma":
                    // validarCampo('idSalida') solo mira si hay algo puesto, así que un id
                    // que ya no es una opción válida pasaría la validación sin que nadie lo
                    // note. Mismo criterio que elegir "ninguna salida" a mano en el
                    // Autocomplete (ver el onChange de más abajo).
                    setErrores(e => ({ ...e, idSalida: '' }))
                    return {
                        ...prev,
                        // fechaEstimadaEntrega también se limpia acá (bug corregido, ver
                        // LOGICA.md): antes se quedaba con el valor viejo, ya sin ninguna
                        // salida que lo acote — sin min/max, el calendario nativo dejaba
                        // elegir cualquier fecha hasta que se seleccionara una salida nueva.
                        idSalida: '', destino: '', fechaSalidaRuta: '', fechaLlegadaEstimadaRuta: '', fechaEstimadaEntrega: '',
                        paquetes: prev.paquetes.map(p => ({ ...p, idSalidaVehiculoConductor: '' })),
                    }
                }
                const fechaSalida = ruta.fechaSalida || ''
                const fechaLlegadaEstimada = ruta.fechaLlegadaEstimada || ''
                if (fechaSalida === prev.fechaSalidaRuta && fechaLlegadaEstimada === prev.fechaLlegadaEstimadaRuta) return prev
                const minimaNueva = fechaLlegadaEstimada || (fechaSalida ? sumarDias(fechaSalida, 1) : '')
                // La salida cambió de fecha mientras el formulario seguía abierto (ej.
                // alguien la editó desde otra pestaña) — se sincroniza igual que al
                // elegirla o al editarla desde el módulo de Salidas, en vez de solo
                // limpiar si quedó fuera de rango.
                setErrores(e => ({ ...e, fechaEstimadaEntrega: '' }))
                return {
                    ...prev,
                    fechaSalidaRuta: fechaSalida,
                    fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                    fechaEstimadaEntrega: minimaNueva || prev.fechaEstimadaEntrega,
                }
            })
        }).catch(() => null)
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, fetchSalidasProgramadas])

    // La tarifa del destino, las tarifas por kg y la tarifa por paquete (fijas en
    // Configuración) pueden cambiar mientras el formulario sigue abierto — se refrescan
    // y se recalcula `total` con los datos frescos en dos momentos: automáticamente al
    // ENTRAR al paso "Pago" (si el admin no lo editó a mano, ver valorServicioManualRef),
    // y a demanda con el botón "Recalcular" de PasoPago.jsx, que sí fuerza el recálculo
    // aunque ya estuviera editado a mano (ver handleResetearTotal más abajo). Ambos
    // casos comparten el cálculo en sí (calcularTotalConTarifasFrescas); cada uno decide
    // por separado cuándo pedir los datos frescos y qué hacer con la promesa.
    const calcularTotalConTarifasFrescas = (paquetes, idSalida, tarifasFrescas, salidasFrescas) => {
        const ruta = (salidasFrescas || []).find(r => r.idSalida === parseInt(idSalida))
        if (!ruta || !idSalida) return null
        return calcularValorServicioBase(
            ruta.ruta?.destino?.tarifaBase, paquetes,
            tarifasFrescas?.tarifaPorKgHierro ?? tarifaPorKgHierro,
            tarifasFrescas?.tarifaPorKgNormal ?? tarifaPorKgNormal,
            tarifasFrescas?.tarifaPorPaquete ?? tarifaPorPaquete,
        )
    }

    useEffect(() => {
        if (activeStep !== 3 || valorServicioManualRef.current) return
        let cancelado = false
        Promise.all([
            fetchConfiguracion(),
            fetchSalidasProgramadas({ limit: 1000 }),
        ]).then(([tarifasFrescas, salidasFrescas]) => {
            if (cancelado) return
            setForm(prev => {
                const vs = calcularTotalConTarifasFrescas(prev.paquetes, prev.idSalida, tarifasFrescas, salidasFrescas)
                return vs == null ? prev : { ...prev, total: vs }
            })
        }).catch(() => {})
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep])

    // Botón "Recalcular" junto al campo "Total a pagar" (PasoPago.jsx): vuelve a poner
    // el valor de fórmula aunque el admin ya lo hubiera editado a mano — sin esto, la
    // única forma de deshacer una edición manual por error era salir del registro
    // completo y volver a llenar todo desde cero.
    const handleResetearTotal = () => {
        valorServicioManualRef.current = false
        Promise.all([
            fetchConfiguracion(),
            fetchSalidasProgramadas({ limit: 1000 }),
        ]).then(([tarifasFrescas, salidasFrescas]) => {
            setForm(prev => {
                const vs = calcularTotalConTarifasFrescas(prev.paquetes, prev.idSalida, tarifasFrescas, salidasFrescas)
                return vs == null ? prev : { ...prev, total: vs }
            })
        }).catch(() => {})
    }

    // Si la salida elegida tiene un solo vehículo, no tiene caso elegir — todos los
    // paquetes (incluidos los que se agreguen después) van directo a ese único vehículo.
    useEffect(() => {
        const ruta = salidasProgramadas.find(r => r.idSalida === parseInt(form.idSalida))
        const pares = ruta?.paresVehiculoConductor || []
        if (pares.length !== 1) return
        const unico = pares[0].idSalidaVehiculoConductor
        setForm(prev => {
            if (prev.paquetes.every(p => p.idSalidaVehiculoConductor === unico)) return prev
            return { ...prev, paquetes: prev.paquetes.map(p => ({ ...p, idSalidaVehiculoConductor: unico })) }
        })
    }, [form.idSalida, form.paquetes.length, salidasProgramadas])

    const calcularValorServicio = (tarifaBase, paquetes = form.paquetes) =>
        calcularValorServicioBase(tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)

    // Le dice a PasoPago.jsx si debe mostrar el botón "Recalcular" — solo cuando el
    // campo ya NO coincide con lo que la fórmula daría ahora mismo (con las tarifas y
    // paquetes actuales), no cuando ya está en el valor de siempre. Es independiente de
    // valorServicioManualRef (ese decide si un refresco automático puede pisarlo o no;
    // esto decide si mostrar el botón). Se compara redondeado a entero porque el campo
    // en pantalla nunca muestra decimales (formatearMoneda los descarta al formatear).
    const rutaParaTotal = salidasProgramadas.find(r => r.idSalida === parseInt(form.idSalida))
    const totalEditadoManualmente = !!rutaParaTotal && Math.round(Number(form.total) || 0) !==
        Math.round(calcularValorServicio(rutaParaTotal.ruta?.destino?.tarifaBase, form.paquetes))

    const handleChange = (e) => {
        const { name } = e.target
        let { value } = e.target

        if (name in NUMERIC_LIMITS) {
            value = limpiarMonedaInput(value)
            if (value !== '') {
                const num = parseFloat(value)
                if (!isNaN(num) && (num > NUMERIC_LIMITS[name] || num < 0)) return
            }
        }
        // Cambiar el tipo de documento invalida el número ya escrito (el límite de
        // caracteres y el formato dependen del tipo) — mismo patrón que
        // RegistrarCliente.jsx al cambiar tipoIdentificacion.
        if (name === 'tipoIdentificacionDestinatario') {
            setForm(prev => ({ ...prev, tipoIdentificacionDestinatario: value, numeroIdentificacionDestinatario: '' }))
            // "nombreDestinatario" pasa a validarse distinto entre NIT (razón social,
            // texto libre) y persona natural (solo letras) — cualquier error previo
            // queda obsoleto.
            setErrores(prev => ({ ...prev, tipoIdentificacionDestinatario: '', numeroIdentificacionDestinatario: '', nombreDestinatario: '' }))
            setApiError(null)
            afterChange()
            return
        }
        if (name === 'numeroIdentificacionDestinatario') {
            if (form.tipoIdentificacionDestinatario === 'NIT') {
                value = formatearNit(value)
            } else if (esDocAlfanumerico(form.tipoIdentificacionDestinatario)) {
                value = value.replace(/[^a-zA-Z0-9]/g, '')
            } else {
                value = value.replace(/[^0-9]/g, '')
            }
        }
        if (name === 'nombreDestinatario' && form.tipoIdentificacionDestinatario !== 'NIT') {
            // Razón social (NIT) es texto libre — no se filtra ni se capitaliza, igual
            // que el "nombre" de un cliente NIT en RegistrarCliente.jsx.
            value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
        }
        if (name === 'telefonoDestinatario') {
            value = filtrarTelefono(value, form.tipoIdentificacionDestinatario)
        }
        if (name === 'correoDestinatario') {
            value = filtrarCorreo(value)
        }
        if (name === 'direccionDestinatario') {
            value = filtrarDireccion(value)
        }
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        if (name === 'total') {
            valorServicioManualRef.current = true
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => ({ ...prev, [name]: value }))
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, ventaOriginal) : '' }))
        setApiError(null)
        afterChange()
    }

    // Garantiza que errores.paquetes tenga una entrada por cada paquete actual (sin pisar
    // los errores ya marcados en otros campos/paquetes) y fija el mensaje de uno solo.
    const setErrorPaquete = (index, campo, mensaje) => {
        setErrores(prev => {
            const erroresPaquetes = form.paquetes.map((_, i) => prev.paquetes?.[i] || {})
            erroresPaquetes[index] = { ...erroresPaquetes[index], [campo]: mensaje }
            return { ...prev, paquetes: erroresPaquetes }
        })
    }

    const recalcularValorServicio = (prev, paquetes) => {
        const resultado = calcularValoresPaquetes(prev.idSalida, paquetes, salidasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)
        if (Object.keys(resultado).length > 0) {
            valorServicioManualRef.current = false
        }
        return resultado
    }

    const handlePaqueteChange = (index, campo, value) => {
        if (campo in PAQUETE_NUMERIC_LIMITS) {
            // peso/alto/ancho/profundidad son medidas físicas y aceptan decimales.
            value = limpiarDecimalInput(value)
            if (value !== '') {
                const num = parseFloat(value)
                if (!isNaN(num) && (num > PAQUETE_NUMERIC_LIMITS[campo] || num < 0)) return
            }
        }
        const paquetes = form.paquetes.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        setForm(prev => {
            const updated = { ...prev, paquetes }
            // peso/alto/ancho/profundidad alimentan el peso efectivo (real vs. volumétrico)
            // y tipoCarga decide qué tarifa por kg aplica -- los cuatro afectan el costo por
            // peso de este paquete y por lo tanto el total de toda la venta.
            if (['peso', 'alto', 'ancho', 'profundidad', 'tipoCarga'].includes(campo)) {
                Object.assign(updated, recalcularValorServicio(prev, paquetes))
            }
            return updated
        })
        const yaMarcado = errores.paquetes?.[index]?.[campo]
        setErrorPaquete(index, campo, yaMarcado ? validarCampoPaquete(campo, paquetes[index]) : '')
        // El peso o el vehículo asignado de un paquete afecta la capacidad de TODOS los
        // paquetes que comparten ese mismo vehículo, no solo este — el error de
        // "ya no tiene espacio" (guardado al intentar "Siguiente") puede quedar
        // desactualizado en los DEMÁS paquetes. Se limpia acá; el cálculo en vivo del
        // render (alertaPorIndice) ya refleja el estado real mientras tanto.
        if (campo === 'peso' || campo === 'idSalidaVehiculoConductor') {
            setErrores(prev => ({
                ...prev,
                paquetes: (prev.paquetes || []).map((pe, i) => {
                    if (i === index || !pe?.idSalidaVehiculoConductor) return pe
                    const { idSalidaVehiculoConductor: _omit, ...resto } = pe
                    return resto
                }),
            }))
        }
        setApiError(null)
        afterChange()
    }

    const handleAgregarPaquete = () => {
        // A diferencia de antes de que existiera tarifaPorPaquete, agregar un paquete
        // (aunque llegue con peso vacío) ya cambia el total -- la cantidad de paquetes
        // es en sí misma parte de la fórmula, no solo el peso acumulado.
        setForm(prev => {
            const paquetes = [...prev.paquetes, { ...PAQUETE_VACIO }]
            return { ...prev, paquetes, ...recalcularValorServicio(prev, paquetes) }
        })
        afterChange()
    }

    const handleQuitarPaquete = (index) => {
        setForm(prev => {
            const paquetes = prev.paquetes.filter((_, i) => i !== index)
            return { ...prev, paquetes, ...recalcularValorServicio(prev, paquetes) }
        })
        // Quitar un paquete puede aliviar la sobrecarga de un vehículo compartido con
        // otros paquetes — se limpia el error de capacidad de los que quedan, igual
        // que en handlePaqueteChange.
        setErrores(prev => ({
            ...prev,
            paquetes: (prev.paquetes || [])
                .filter((_, i) => i !== index)
                .map(pe => {
                    if (!pe?.idSalidaVehiculoConductor) return pe
                    const { idSalidaVehiculoConductor: _omit, ...resto } = pe
                    return resto
                }),
        }))
        afterChange()
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, salidasProgramadas, {
            ventaOriginal, getPesoOriginalPorPar, esOperadorSede, sedeMunicipio: sedeActual?.municipio,
        })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            // Si el paso es "Participantes", se hace scroll hasta el primer campo con
            // error (en el mismo orden en que validarPaso los revisa, que coincide con
            // el orden visual del formulario) para que no pase inadvertido.
            if (activeStep === 0) {
                const primerCampoConError = Object.keys(erroresEncontrados).find(campo => erroresEncontrados[campo])
                if (primerCampoConError) {
                    participantesRefs.current[primerCampoConError]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
            // Si el paso es "Paquete" y quedó algún paquete con error fuera de vista
            // (ej. varios paquetes cargados y el error está en uno de los primeros),
            // se hace scroll hasta el primero con error para que no pase inadvertido.
            if (activeStep === 1 && erroresEncontrados.paquetes) {
                const idxConError = erroresEncontrados.paquetes.findIndex(pe => pe && Object.keys(pe).length > 0)
                if (idxConError !== -1) {
                    paqueteRefs.current[idxConError]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    // Revalida los 4 pasos con contenido antes de guardar de verdad (llamada al
    // principio de handleSubmit, que vive en RegistrarVenta.jsx/ActualizarVenta.jsx —
    // ver el comentario de arriba sobre qué NO vive en este hook). Antes, el guardado
    // final no revalidaba nada en absoluto: si un dato quedaba desactualizado mientras
    // se seguía en "Confirmación" (ej. alguien más editó la salida elegida, o el reloj
    // alcanzó una hora que ya no es válida), el guardado pasaba igual. Devuelve
    // true si todo está bien; si no, devuelve false y ya dejó `errores`/`activeStep`
    // apuntando al primer paso con problemas, listos para que el campo se vea en rojo.
    const validarTodo = () => {
        const pasos = [0, 1, 2, 3].map(step => validarPaso(step, form, salidasProgramadas, {
            ventaOriginal, getPesoOriginalPorPar, esOperadorSede, sedeMunicipio: sedeActual?.municipio,
        }))
        const pasoConError = pasos.findIndex(e => Object.keys(e).length > 0)
        if (pasoConError === -1) return true

        const combinados = { ...pasos[0], ...pasos[1], ...pasos[2], ...pasos[3] }
        // El paso "Paquete" (medidas/peso) y el paso "Envío" (vehículo asignado) pueden
        // generar cada uno su propio arreglo `paquetes` — se combinan índice a índice,
        // si no el spread de arriba descartaría uno de los dos por completo.
        if (pasos[1].paquetes && pasos[2].paquetes) {
            combinados.paquetes = pasos[1].paquetes.map((pe, i) => ({ ...pe, ...pasos[2].paquetes[i] }))
        }
        setErrores(combinados)
        setActiveStep(pasoConError)
        return false
    }

    return {
        errores, setErrores,
        apiError, setApiError,
        activeStep, setActiveStep,
        clienteInput, setClienteInput,
        rutaInput, setRutaInput,
        form, setForm,
        valorServicioManualRef,
        paqueteRefs,
        setParticipanteRef,
        calcularValorServicio,
        totalEditadoManualmente,
        handleResetearTotal,
        handleChange,
        setErrorPaquete,
        handlePaqueteChange,
        handleAgregarPaquete,
        handleQuitarPaquete,
        handleNext,
        handleBack,
        validarTodo,
    }
}

export default useVentaWizardForm
