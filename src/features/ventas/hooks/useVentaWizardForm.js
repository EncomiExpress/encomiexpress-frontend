import { useEffect, useRef, useState } from 'react'
import { limpiarMonedaInput, limpiarDecimalInput, capitalizarPalabras } from '../../../shared/utils/formatters.js'
import { sumarDias } from '../../../shared/utils/horarioLaboral.js'
import { PAQUETE_VACIO, validarCampo, validarCampoPaquete } from '../validations/validacion.js'
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
    rutasProgramadas, fetchRutasProgramadas,
    tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete, fetchConfiguracion,
    ventaOriginal = null,
    afterChange = () => {},
    getPesoOriginalPorPar,
}) => {
    // true en cuanto el admin edita "Valor del servicio" a mano — a partir de ahí el
    // refresco de tarifas de los pasos "Paquete"/"Pago" (más abajo) deja de recalcularlo
    // por encima, hasta que vuelva a cambiar la ruta o el peso/cantidad de paquetes.
    const valorServicioManualRef = useRef(false)
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [clienteInput, setClienteInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')
    const [form, setForm] = useState(initialForm)

    useEffect(() => {
        fetchRutasProgramadas({ limit: 1000 }).catch(() => null)
    }, [fetchRutasProgramadas])

    // Las tarifas por kg (hierro/normal) y por paquete pueden cambiar mientras el
    // formulario sigue abierto -- igual que el refresco del paso "Pago" más abajo, se
    // refrescan al ENTRAR al paso "Paquete" (índice 1) para que el preview de peso
    // volumétrico/costo por paquete (calculado en vivo en el render de PasoPaquetes.jsx
    // a partir de tarifaPorKgHierro/tarifaPorKgNormal) nunca quede con tarifas obsoletas.
    // Si ya hay una ruta elegida (se volvió con "Anterior" desde un paso posterior),
    // además recalcula valorServicio/total con los datos frescos, respetando
    // valorServicioManualRef.
    useEffect(() => {
        if (activeStep !== 1) return
        let cancelado = false
        fetchConfiguracion().then((tarifasFrescas) => {
            if (cancelado || valorServicioManualRef.current) return
            setForm(prev => {
                const resultado = calcularValoresPaquetes(
                    prev.idRuta, prev.paquetes, rutasProgramadas,
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
        fetchRutasProgramadas({ limit: 1000 }).then(rutasFrescas => {
            if (cancelado) return
            setForm(prev => {
                if (!prev.idRuta) return prev
                const ruta = (rutasFrescas || []).find(r => r.idRuta === parseInt(prev.idRuta))
                if (!ruta) return prev
                const fechaSalida = ruta.fechaSalida || ''
                const fechaLlegadaEstimada = ruta.fechaLlegadaEstimada || ''
                if (fechaSalida === prev.fechaSalidaRuta && fechaLlegadaEstimada === prev.fechaLlegadaEstimadaRuta) return prev
                const minimaNueva = fechaSalida ? sumarDias(fechaSalida, 1) : ''
                const maximaNueva = fechaLlegadaEstimada ? sumarDias(fechaLlegadaEstimada, -1) : ''
                const fechaFueraDeRango = !!(prev.fechaEstimadaEntrega && (
                    (minimaNueva && prev.fechaEstimadaEntrega < minimaNueva) ||
                    (maximaNueva && prev.fechaEstimadaEntrega > maximaNueva)
                ))
                if (fechaFueraDeRango) setErrores(e => ({ ...e, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' }, ventaOriginal) }))
                return {
                    ...prev,
                    fechaSalidaRuta: fechaSalida,
                    fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                    fechaEstimadaEntrega: fechaFueraDeRango ? '' : prev.fechaEstimadaEntrega,
                }
            })
        }).catch(() => null)
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, fetchRutasProgramadas])

    // La tarifa del destino, las tarifas por kg y la tarifa por paquete (fijas en
    // Configuración) pueden cambiar mientras el formulario sigue abierto — igual que
    // arriba con la capacidad, se refrescan al ENTRAR al paso "Pago" y se recalcula
    // valorServicio con los datos frescos, pero solo si el admin no lo editó a mano
    // (valorServicioManualRef): si ya lo tocó, se respeta ese ajuste manual y no se pisa.
    useEffect(() => {
        if (activeStep !== 3) return
        let cancelado = false
        Promise.all([
            fetchConfiguracion(),
            fetchRutasProgramadas({ limit: 1000 }),
        ]).then(([tarifasFrescas, rutasFrescas]) => {
            if (cancelado || valorServicioManualRef.current) return
            setForm(prev => {
                const ruta = (rutasFrescas || []).find(r => r.idRuta === parseInt(prev.idRuta))
                if (!ruta || !prev.idRuta) return prev
                const vs = calcularValorServicioBase(
                    ruta.destino?.tarifaBase, prev.paquetes,
                    tarifasFrescas?.tarifaPorKgHierro ?? tarifaPorKgHierro,
                    tarifasFrescas?.tarifaPorKgNormal ?? tarifaPorKgNormal,
                    tarifasFrescas?.tarifaPorPaquete ?? tarifaPorPaquete,
                )
                return { ...prev, valorServicio: vs, total: vs }
            })
        }).catch(() => {})
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep])

    // Si la ruta elegida tiene un solo vehículo, no tiene caso elegir — todos los
    // paquetes (incluidos los que se agreguen después) van directo a ese único vehículo.
    useEffect(() => {
        const ruta = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
        const pares = ruta?.paresVehiculoConductor || []
        if (pares.length !== 1) return
        const unico = pares[0].idRutaVehiculoConductor
        setForm(prev => {
            if (prev.paquetes.every(p => p.idRutaVehiculoConductor === unico)) return prev
            return { ...prev, paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: unico })) }
        })
    }, [form.idRuta, form.paquetes.length, rutasProgramadas])

    const calcularValorServicio = (tarifaBase, paquetes = form.paquetes) =>
        calcularValorServicioBase(tarifaBase, paquetes, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)

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
        if (name === 'nombreDestinatario') {
            value = capitalizarPalabras(value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))
        }
        if (name === 'telefonoDestinatario') {
            value = value.replace(/[^0-9]/g, '')
        }
        if (name === 'correoDestinatario') {
            value = value.replace(/[^a-zA-Z0-9@._%+-]/g, '')
        }
        if (name === 'direccionDestinatario') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/']/g, '')
        }
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        if (name === 'valorServicio') {
            valorServicioManualRef.current = true
        }

        const formActualizado = { ...form, [name]: value }
        setForm(prev => {
            const updated = { ...prev, [name]: value }
            if (name === 'valorServicio') {
                const vs = parseFloat(value) || 0
                updated.total = vs
            }
            return updated
        })
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
        const resultado = calcularValoresPaquetes(prev.idRuta, paquetes, rutasProgramadas, tarifaPorKgHierro, tarifaPorKgNormal, tarifaPorPaquete)
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
            // peso de este paquete y por lo tanto el valorServicio de toda la venta.
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
        if (campo === 'peso' || campo === 'idRutaVehiculoConductor') {
            setErrores(prev => ({
                ...prev,
                paquetes: (prev.paquetes || []).map((pe, i) => {
                    if (i === index || !pe?.idRutaVehiculoConductor) return pe
                    const { idRutaVehiculoConductor: _omit, ...resto } = pe
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
                    if (!pe?.idRutaVehiculoConductor) return pe
                    const { idRutaVehiculoConductor: _omit, ...resto } = pe
                    return resto
                }),
        }))
        afterChange()
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep, form, rutasProgramadas, {
            ventaOriginal, getPesoOriginalPorPar,
        })
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    return {
        errores, setErrores,
        apiError, setApiError,
        activeStep, setActiveStep,
        clienteInput, setClienteInput,
        rutaInput, setRutaInput,
        form, setForm,
        valorServicioManualRef,
        calcularValorServicio,
        handleChange,
        setErrorPaquete,
        handlePaqueteChange,
        handleAgregarPaquete,
        handleQuitarPaquete,
        handleNext,
        handleBack,
    }
}

export default useVentaWizardForm
