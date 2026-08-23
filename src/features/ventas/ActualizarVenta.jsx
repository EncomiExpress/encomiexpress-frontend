import { useTheme } from '@mui/material/styles'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Stepper, Step, StepLabel, Button, Alert, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useVentas } from './context/VentaContext.jsx'
import { useClientes } from '../clientes/context/ClienteContext.jsx'
import { useRutaProgramacion } from '../rutas/context/RutaProgramacionContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { getGuiaPrincipal, limpiarMonedaInput, limpiarDecimalInput, capitalizarPalabras } from '../../shared/utils/formatters.js'
import { sumarDias } from '../../shared/utils/horarioLaboral.js'
import {
    steps, PAQUETE_VACIO, CAMPOS_PAQUETE,
    validarCampo, validarCampoPaquete,
} from './components/wizard/validacion.js'
import PasoParticipantes from './components/wizard/PasoParticipantes.jsx'
import PasoPaquetes from './components/wizard/PasoPaquetes.jsx'
import PasoEnvio from './components/wizard/PasoEnvio.jsx'
import PasoPago from './components/wizard/PasoPago.jsx'
import PasoConfirmacion from './components/wizard/PasoConfirmacion.jsx'

const ActualizarVenta = ({ open, onClose, venta, onSuccess }) => {
    const { actualizarVenta } = useVentas()
    const { showToast } = useToast()
    const theme = useTheme()
    const { clientes } = useClientes()
    const { rutasProgramadas, fetchRutasProgramadas } = useRutaProgramacion()
    const { tarifaPorKg, fetchConfiguracion } = useConfiguracion()
    // true en cuanto el admin edita "Valor del servicio"/"Impuestos" a mano — a partir de
    // ahí el refresco de tarifas del paso "Pago" (más abajo) deja de recalcularlos por
    // encima. Editar valorServicio SÍ resetea impuestosManualRef (vuelve a ser el 10%
    // automático), pero editar impuestos NO resetea valorServicioManualRef.
    const valorServicioManualRef = useRef(false)
    const impuestosManualRef = useRef(false)
    const [errores, setErrores] = useState({})
    const [apiError, setApiError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [clienteInput, setClienteInput] = useState('')
    const [rutaInput, setRutaInput] = useState('')
    const [ventaOriginal, setVentaOriginal] = useState(null)
    const [formOriginal, setFormOriginal] = useState(null)
    const [sinCambios, setSinCambios] = useState(false)

    useEffect(() => {
        fetchRutasProgramadas({ limit: 1000 }).catch(() => null)
    }, [fetchRutasProgramadas])

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
                if (fechaFueraDeRango) setErrores(e => ({ ...e, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' }, null) }))
                return {
                    ...prev,
                    fechaSalidaRuta: fechaSalida,
                    fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                    fechaEstimadaEntrega: fechaFueraDeRango ? '' : prev.fechaEstimadaEntrega,
                }
            })
        }).catch(() => null)
        return () => { cancelado = true }
    }, [activeStep, fetchRutasProgramadas])

    // La tarifa del destino y la tarifa por kg (fija en Configuración) pueden cambiar
    // mientras el formulario sigue abierto — igual que arriba con la capacidad, se
    // refrescan al ENTRAR al paso "Pago" y se recalcula valorServicio con los datos
    // frescos, pero solo si el admin no lo editó a mano (valorServicioManualRef):
    // si ya lo tocó, se respeta ese ajuste manual y no se pisa.
    useEffect(() => {
        if (activeStep !== 3) return
        let cancelado = false
        Promise.all([
            fetchConfiguracion(),
            fetchRutasProgramadas({ limit: 1000 }),
        ]).then(([tarifaFresca, rutasFrescas]) => {
            if (cancelado || valorServicioManualRef.current) return
            setForm(prev => {
                const ruta = (rutasFrescas || []).find(r => r.idRuta === parseInt(prev.idRuta))
                if (!ruta || !prev.idRuta) return prev
                const pesoTotal = prev.paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                const vs = Number(ruta.destino?.tarifaBase || 0) + (pesoTotal * (tarifaFresca ?? tarifaPorKg))
                // impuestos respeta su propio "manual" — si el admin ya lo editó a mano,
                // no se pisa aunque valorServicio sí se haya recalculado.
                const imp = impuestosManualRef.current ? (Number(prev.impuestos) || 0) : Math.round(vs * 0.10)
                return { ...prev, valorServicio: vs, impuestos: imp, total: vs + imp }
            })
        }).catch(() => {})
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep])

    const [form, setForm] = useState({
        idCliente: '',
        nombreDestinatario: '',
        telefonoDestinatario: '',
        direccionDestinatario: '',
        paquetes: [{ ...PAQUETE_VACIO }],
        idRuta: '',
        destino: '',
        fechaSalidaRuta: '',
        fechaLlegadaEstimadaRuta: '',
        fechaEstimadaEntrega: '',
        observaciones: '',
        metodoPago: '',
        valorServicio: '',
        impuestos: '',
        total: '',
    })

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.idRuta, form.paquetes.length, rutasProgramadas])

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
                profundidad: limpiarNumero(p.profundidad), valorDeclarado: limpiarNumero(p.valorDeclarado),
                idRutaVehiculoConductor: p.idRutaVehiculoConductor || '',
            }))
            : [{ ...PAQUETE_VACIO }]
        const datosForm = {
            idCliente: ventaData.cliente?.idCliente || ventaData.idCliente || '',
            nombreDestinatario: destinatario?.nombreDestinatario || '',
            telefonoDestinatario: destinatario?.telefonoDestinatario || '',
            direccionDestinatario: destinatario?.direccionDestinatario || '',
            paquetes: paquetesArr,
            idRuta: ventaData.idRuta || ventaData.ruta?.idRuta || '',
            destino: ventaData.ruta
                ? `${ventaData.ruta.origen || 'Sin nombre'} → ${ventaData.ruta.destino?.ciudad || 'Sin destino'} — $${Number(ventaData.ruta.destino?.tarifaBase || 0).toLocaleString('es-CO')}`
                : '',
            fechaSalidaRuta: ventaData.ruta?.fechaSalida || '',
            fechaLlegadaEstimadaRuta: ventaData.ruta?.fechaLlegadaEstimada || '',
            fechaEstimadaEntrega: ventaData.fechaEstimadaEntrega
                ? ventaData.fechaEstimadaEntrega.split('T')[0]
                : '',
            observaciones: ventaData.observaciones || '',
            metodoPago: ventaData.metodoPago || '',
            valorServicio: limpiarNumero(ventaData.valorServicio),
            impuestos: limpiarNumero(ventaData.impuestos),
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
            setRutaInput(`${r.origen || 'Sin nombre'} → ${r.destino?.ciudad || 'Sin destino'} — $${Number(r.destino?.tarifaBase || 0).toLocaleString()}`)
        } else {
            setRutaInput('')
        }
    }, [venta])

    // Si el cliente no aparece en el contexto (inhabilitado, o aún no cargaba), se arma
    // una opción sintética con los datos de la propia venta para que el Autocomplete no quede vacío.
    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente)) || (
        ventaOriginal?.cliente && parseInt(form.idCliente) === (ventaOriginal.cliente.idCliente || ventaOriginal.idCliente)
            ? ventaOriginal.cliente
            : null
    )

    const NUMERIC_LIMITS = {
        valorServicio: 999999999, impuestos: 999999999,
    }

    const PAQUETE_NUMERIC_LIMITS = {
        peso: 9999, alto: 9999, ancho: 9999, profundidad: 9999, valorDeclarado: 999999999,
    }

    // valorServicio = tarifa base del destino + (peso × tarifa por kg). El resultado
    // sigue siendo editable a mano después de este auto-cálculo.
    const calcularValorServicio = (tarifaBase, peso) => {
        const pesoNum = parseFloat(peso) || 0
        return Number(tarifaBase || 0) + (pesoNum * tarifaPorKg)
    }

    const handleChange = (e) => {
        let { name, value } = e.target

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
        if (name === 'direccionDestinatario') {
            value = value.replace(/[^a-zA-Z0-9\s,.\-#/']/g, '')
        }
        if (name === 'observaciones') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.-]/g, '')
        }

        if (name === 'valorServicio') {
            valorServicioManualRef.current = true
            impuestosManualRef.current = false
        }
        if (name === 'impuestos') impuestosManualRef.current = true

        const formActualizado = { ...form, [name]: value }
        setForm(prev => {
            const updated = { ...prev, [name]: value }
            if (name === 'valorServicio') {
                const vs = parseFloat(value) || 0
                const imp = Math.round(vs * 0.10)
                updated.impuestos = imp
                updated.total = vs + imp
            } else if (name === 'impuestos') {
                const vs = parseFloat(prev.valorServicio) || 0
                const imp = parseFloat(value) || 0
                updated.total = vs + imp
            }
            return updated
        })
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, ventaOriginal) : '' }))
        setApiError(null)
        setSinCambios(false)
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
        if (!prev.idRuta) return {}
        valorServicioManualRef.current = false
        impuestosManualRef.current = false
        const ruta = rutasProgramadas.find(r => r.idRuta === parseInt(prev.idRuta))
        const pesoTotal = paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
        const vs = calcularValorServicio(ruta?.destino?.tarifaBase, pesoTotal)
        const imp = Math.round(vs * 0.10)
        return { valorServicio: vs, impuestos: imp, total: vs + imp }
    }

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

    const handlePaqueteChange = (index, campo, value) => {
        if (campo in PAQUETE_NUMERIC_LIMITS) {
            // valorDeclarado es dinero (sin decimales, puntos de miles automáticos);
            // peso/alto/ancho/profundidad son medidas físicas y sí aceptan decimales.
            value = campo === 'valorDeclarado' ? limpiarMonedaInput(value) : limpiarDecimalInput(value)
            if (value !== '') {
                const num = parseFloat(value)
                if (!isNaN(num) && (num > PAQUETE_NUMERIC_LIMITS[campo] || num < 0)) return
            }
        }
        const paquetes = form.paquetes.map((p, i) => i === index ? { ...p, [campo]: value } : p)
        setForm(prev => {
            const updated = { ...prev, paquetes }
            if (campo === 'peso') Object.assign(updated, recalcularValorServicio(prev, paquetes))
            return updated
        })
        const yaMarcado = errores.paquetes?.[index]?.[campo]
        setErrorPaquete(index, campo, yaMarcado ? validarCampoPaquete(campo, paquetes[index]) : '')
        // El peso o el vehículo asignado de un paquete afecta la capacidad de TODOS los
        // paquetes que comparten ese mismo vehículo, no solo este — el error de
        // "ya no tiene espacio" (guardado al intentar "Siguiente") puede quedar
        // desactualizado en los DEMÁS paquetes. Se limpia acá; el cálculo en vivo del
        // render ya refleja el estado real mientras tanto.
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
        setSinCambios(false)
    }

    const handleAgregarPaquete = () => {
        setForm(prev => ({ ...prev, paquetes: [...prev.paquetes, { ...PAQUETE_VACIO }] }))
        setSinCambios(false)
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
        setSinCambios(false)
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            e.idCliente = validarCampo('idCliente', form, ventaOriginal)
            e.nombreDestinatario = validarCampo('nombreDestinatario', form, ventaOriginal)
            e.telefonoDestinatario = validarCampo('telefonoDestinatario', form, ventaOriginal)
            e.direccionDestinatario = validarCampo('direccionDestinatario', form, ventaOriginal)
        }

        if (step === 1) {
            const erroresPaquetes = form.paquetes.map(p => {
                const pe = {}
                CAMPOS_PAQUETE.forEach(campo => {
                    const err = validarCampoPaquete(campo, p)
                    if (err) pe[campo] = err
                })
                return pe
            })
            if (erroresPaquetes.some(pe => Object.keys(pe).length > 0)) e.paquetes = erroresPaquetes

            e.observaciones = validarCampo('observaciones', form, ventaOriginal)
        }

        if (step === 2) {
            e.idRuta = validarCampo('idRuta', form, ventaOriginal)
            e.fechaEstimadaEntrega = validarCampo('fechaEstimadaEntrega', form, ventaOriginal)

            const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
            if (rutaSel) {
                const erroresAsignacion = form.paquetes.map(p => {
                    const err = validarCampoPaquete('idRutaVehiculoConductor', p)
                    return err ? { idRutaVehiculoConductor: err } : {}
                })

                // Mismo cálculo que las alertas de capacidad en el render — si algún
                // vehículo del convoy ya no alcanza, se marca en rojo el select del
                // paquete correspondiente (el backend también lo valida al guardar, pero
                // avisar aquí evita llegar hasta el final para enterarse). Se excluye el
                // peso que esta misma venta ya tenía en cada vehículo antes de editar,
                // para no restarlo dos veces.
                const pesoOriginalPorPar = getPesoOriginalPorPar()
                const pares = rutaSel.paresVehiculoConductor || []
                for (const par of pares) {
                    const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                    if (capacidad == null) continue
                    const pesoUsadoOtras = Math.max(0, Number(par.pesoUsado || 0) - (pesoOriginalPorPar[par.idRutaVehiculoConductor] || 0))
                    const disponible = capacidad - pesoUsadoOtras
                    const indices = form.paquetes
                        .map((p, i) => i)
                        .filter(i => parseInt(form.paquetes[i].idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                    const pesoNuevo = indices.reduce((s, i) => s + (parseFloat(form.paquetes[i].peso) || 0), 0)
                    if (pesoNuevo > disponible) {
                        const mensaje = `${par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((pesoNuevo - disponible).toFixed(2))} kg.`
                        indices.forEach(i => { erroresAsignacion[i] = { ...erroresAsignacion[i], idRutaVehiculoConductor: mensaje } })
                    }
                }

                if (erroresAsignacion.some(pe => Object.keys(pe).length > 0)) {
                    e.paquetes = (e.paquetes || form.paquetes.map(() => ({}))).map((pe, i) => ({ ...pe, ...erroresAsignacion[i] }))
                }
            }
        }

        if (step === 3) {
            e.metodoPago = validarCampo('metodoPago', form, ventaOriginal)
        }

        Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
        return e
    }

    const handleNext = () => {
        const erroresEncontrados = validarPaso(activeStep)
        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados)
            return
        }
        setActiveStep(prev => prev + 1)
    }

    const handleBack = () => setActiveStep(prev => prev - 1)

    const handleSubmit = async () => {
        if (formOriginal) {
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
                valorServicio: parseFloat(form.valorServicio) || 0,
                impuestos: parseFloat(form.impuestos) || 0,
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario || null,
                    direccionDestinatario: form.direccionDestinatario || null,
                },
                paquetes: form.paquetes.map(p => ({
                    idPaquete: p.idPaquete,
                    descripcionContenido: p.descripcionContenido || null,
                    peso: p.peso ? parseFloat(p.peso) : null,
                    alto: p.alto ? parseFloat(p.alto) : null,
                    ancho: p.ancho ? parseFloat(p.ancho) : null,
                    profundidad: p.profundidad ? parseFloat(p.profundidad) : null,
                    valorDeclarado: p.valorDeclarado ? parseFloat(p.valorDeclarado) : null,
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

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <PasoParticipantes
                        theme={theme} clientes={clientes} clienteSeleccionado={clienteSeleccionado}
                        clienteInput={clienteInput} setClienteInput={setClienteInput}
                        form={form} setForm={setForm} errores={errores} setErrores={setErrores}
                        handleChange={handleChange} setSinCambios={setSinCambios} ventaOriginal={ventaOriginal}
                    />
                )
            case 1:
                return (
                    <PasoPaquetes
                        theme={theme} form={form} errores={errores}
                        handlePaqueteChange={handlePaqueteChange} setErrorPaquete={setErrorPaquete}
                        handleAgregarPaquete={handleAgregarPaquete} handleQuitarPaquete={handleQuitarPaquete}
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
                        impuestosManualRef={impuestosManualRef} getPesoOriginalPorPar={getPesoOriginalPorPar}
                    />
                )
            case 3:
                return <PasoPago form={form} errores={errores} setErrores={setErrores} handleChange={handleChange} ventaOriginal={ventaOriginal} />
            case 4:
                return (
                    <PasoConfirmacion
                        theme={theme} apiError={apiError} setApiError={setApiError} cardSx={cardSx}
                        clienteSeleccionado={clienteSeleccionado} form={form} formOriginal={formOriginal}
                        ventaOriginal={ventaOriginal} sinCambios={sinCambios} setSinCambios={setSinCambios}
                        clientes={clientes} rutasProgramadas={rutasProgramadas}
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
        <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Editar Venta</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        {getGuiaPrincipal(ventaOriginal)
                            ? `Modificando guía: ${getGuiaPrincipal(ventaOriginal)}${ventaOriginal.paquetes?.length > 1 ? ` (+${ventaOriginal.paquetes.length - 1})` : ''}`
                            : 'Modifica los campos que necesites.'
                        }
                    </Typography>
                </Box>
                <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 1.5 }}>
                <Box sx={{ mb: 3 }}>
                    <Stepper activeStep={activeStep} alternativeLabel
                        sx={{
                            mb: 3, mt: 2,
                            '& .MuiStepIcon-root': { color: theme.palette.divider },
                            '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
                            '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
                            '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
                            '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
                            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
                            '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
                            '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
                            '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
                        }}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>
                <Box sx={{ px: 4, py: 2 }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {renderStepContent()}
                    </Box>
                </Box>
            </DialogContent>

            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 4, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`,
            }}>
                <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />} disableRipple
                    sx={{
                        textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
                        color: theme.palette.text.primary, fontWeight: 500,
                        '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
                        '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
                    }}>
                    Anterior
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button onClick={handleCancelar} disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained"
                        disabled={submitting || (activeStep === steps.length - 1 && sinCambios)}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <SaveOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : sinCambios ? 'Sin cambios' : 'Guardar cambios')
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    )
}

export default ActualizarVenta
