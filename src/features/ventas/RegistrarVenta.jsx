import { useTheme } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Paper, MenuItem, Stepper, Step, StepLabel, Button, Alert, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton, Divider, CircularProgress, Avatar } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import RegistrarCliente from '../clientes/RegistrarCliente.jsx'
import { useVentas } from '../../shared/contexts/VentaContext.jsx'
import { useClientes } from '../../shared/contexts/ClienteContext.jsx'
import { useRutaProgramacion } from '../../shared/contexts/RutaProgramacionContext.jsx'
import { useConfiguracion } from '../../shared/contexts/ConfiguracionContext.jsx'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { FormField, FormSelect } from '../../shared/components/FormularioEstandarizado.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { formFieldStyles } from '../../shared/utils/formStyles.js'
import ConfirmRow from '../../shared/components/ConfirmRow.jsx'
import PlacaDisplay from '../../shared/components/PlacaDisplay.jsx'
import { normalizarTexto } from '../../shared/utils/duplicados.js'
import { formatFecha, formatearMoneda, limpiarMonedaInput, limpiarDecimalInput, esSoloRelleno, capitalizarPalabras } from '../../shared/utils/formatters.js'
import { sumarDias } from '../../shared/utils/horarioLaboral.js'

const steps = ['Participantes', 'Paquete', 'Envío', 'Pago', 'Confirmación']

const MAX_PAQUETES = 10
const PAQUETE_VACIO = { descripcionContenido: '', peso: '', alto: '', ancho: '', profundidad: '', valorDeclarado: '', idRutaVehiculoConductor: '' }
const CAMPOS_PAQUETE = ['descripcionContenido', 'peso', 'alto', 'ancho', 'profundidad', 'valorDeclarado']
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/

// Opción sentinel que se agrega al final de las sugerencias de Cliente — al elegirla
// se abre RegistrarCliente en un modal encima, en vez de seleccionar un cliente real.
const OPCION_CLIENTE_NUEVO = { idCliente: '__nuevo__', esNuevo: true }

// Valida un único campo del formulario principal (usado en onBlur y para re-validar
// en vivo mientras se corrige un campo ya marcado con error). valorServicio/impuestos/
// total no viven aquí: son editables sin ninguna regla de obligatoriedad.
const validarCampo = (name, form) => {
    switch (name) {
        case 'idCliente':
            return form.idCliente ? '' : 'Selecciona un cliente remitente'
        case 'nombreDestinatario':
            if (!form.nombreDestinatario.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombreDestinatario)) return 'Solo se permiten letras'
            return ''
        case 'telefonoDestinatario':
            if (!form.telefonoDestinatario.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefonoDestinatario)) return 'Debe tener 10 dígitos'
            return ''
        case 'direccionDestinatario':
            if (!form.direccionDestinatario.trim()) return 'La dirección es obligatoria'
            if (esSoloRelleno(form.direccionDestinatario)) return 'La dirección no puede contener solo espacios o guiones'
            return ''
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'fechaEstimadaEntrega': {
            if (!form.fechaEstimadaEntrega) return 'La fecha es obligatoria'
            if (form.fechaSalidaRuta) {
                const minima = sumarDias(form.fechaSalidaRuta, 1)
                if (form.fechaEstimadaEntrega < minima) return 'Debe ser al menos un día después de la salida de la ruta'
            }
            if (form.fechaLlegadaEstimadaRuta) {
                const maxima = sumarDias(form.fechaLlegadaEstimadaRuta, -1)
                if (form.fechaEstimadaEntrega > maxima) return 'Debe ser al menos un día antes de la llegada de la ruta'
            }
            return ''
        }
        case 'metodoPago':
            return form.metodoPago ? '' : 'Selecciona un método de pago'
        case 'observaciones':
            if (form.observaciones && esSoloRelleno(form.observaciones)) return 'Las observaciones no pueden contener solo espacios o guiones'
            return ''
        default:
            return ''
    }
}

// Valida un único campo de un paquete (usado en onBlur y para re-validar en vivo).
const validarCampoPaquete = (campo, paquete) => {
    switch (campo) {
        case 'descripcionContenido':
            if (!paquete.descripcionContenido.trim()) return 'La descripción es obligatoria'
            if (paquete.descripcionContenido.length > 300) return 'Máximo 300 caracteres'
            if (esSoloRelleno(paquete.descripcionContenido)) return 'La descripción no puede contener solo espacios o guiones'
            return ''
        case 'peso': {
            const n = parseFloat(paquete.peso)
            if (!paquete.peso) return 'El peso es obligatorio'
            if (isNaN(n) || n < 1) return 'El peso debe ser de al menos 1 kg'
            if (n > 9999) return 'Máximo 9999 kg'
            return ''
        }
        case 'alto': {
            const n = parseFloat(paquete.alto)
            if (!paquete.alto) return 'El alto es obligatorio'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'ancho': {
            const n = parseFloat(paquete.ancho)
            if (!paquete.ancho) return 'El ancho es obligatorio'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'profundidad': {
            const n = parseFloat(paquete.profundidad)
            if (!paquete.profundidad) return 'La profundidad es obligatoria'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 9999) return 'Máximo 9999 cm'
            return ''
        }
        case 'valorDeclarado':
            if (paquete.valorDeclarado) {
                const n = parseFloat(paquete.valorDeclarado)
                if (isNaN(n) || n < 1) return 'Debe ser de al menos $1'
                if (n > 999999999) return 'Valor demasiado alto'
            }
            return ''
        case 'idRutaVehiculoConductor':
            return paquete.idRutaVehiculoConductor ? '' : 'Asigna un vehículo'
        default:
            return ''
    }
}

const RegistrarVenta = ({ open, onClose, onSuccess }) => {
    const { agregarVenta } = useVentas()
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
    const [modalNuevoCliente, setModalNuevoCliente] = useState(false)

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
                if (fechaFueraDeRango) setErrores(e => ({ ...e, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' }) }))
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
        estadoPago: 'Pendiente',
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

    const handleClose = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        setForm({
            idCliente: '',
            nombreDestinatario: '',
            telefonoDestinatario: '',
            direccionDestinatario: '',
            paquetes: [{ ...PAQUETE_VACIO }],
            idRuta: '', destino: '', fechaSalidaRuta: '', fechaLlegadaEstimadaRuta: '',
            fechaEstimadaEntrega: '', observaciones: '',
            metodoPago: '', estadoPago: 'Pendiente',
            valorServicio: '', impuestos: '', total: '',
        })
        setErrores({})
        setApiError(null)
        setActiveStep(0)
        setClienteInput('')
        setRutaInput('')
        onClose()
    }

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
        setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
        setApiError(null)
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
    }

    const handleAgregarPaquete = () => {
        setForm(prev => ({ ...prev, paquetes: [...prev.paquetes, { ...PAQUETE_VACIO }] }))
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
    }

    const validarPaso = (step) => {
        const e = {}

        if (step === 0) {
            e.idCliente = validarCampo('idCliente', form)
            e.nombreDestinatario = validarCampo('nombreDestinatario', form)
            e.telefonoDestinatario = validarCampo('telefonoDestinatario', form)
            e.direccionDestinatario = validarCampo('direccionDestinatario', form)
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
        }

        if (step === 2) {
            e.idRuta = validarCampo('idRuta', form)
            e.fechaEstimadaEntrega = validarCampo('fechaEstimadaEntrega', form)
            e.observaciones = validarCampo('observaciones', form)

            const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
            if (rutaSel) {
                const erroresPaquetes = form.paquetes.map(p => {
                    const err = validarCampoPaquete('idRutaVehiculoConductor', p)
                    return err ? { idRutaVehiculoConductor: err } : {}
                })

                // Mismo cálculo que el aviso de capacidad en el render — si algún vehículo
                // del convoy ya no alcanza, se marca en rojo el select del paquete
                // correspondiente (el backend también lo valida al guardar, pero avisar
                // aquí evita llegar hasta el final para enterarse).
                const pares = rutaSel.paresVehiculoConductor || []
                for (const par of pares) {
                    const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                    if (capacidad == null) continue
                    const disponible = capacidad - Number(par.pesoUsado || 0)
                    const indices = form.paquetes
                        .map((p, i) => i)
                        .filter(i => parseInt(form.paquetes[i].idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                    const pesoNuevo = indices.reduce((s, i) => s + (parseFloat(form.paquetes[i].peso) || 0), 0)
                    if (pesoNuevo > disponible) {
                        const mensaje = `${par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((pesoNuevo - disponible).toFixed(2))} kg.`
                        indices.forEach(i => { erroresPaquetes[i] = { ...erroresPaquetes[i], idRutaVehiculoConductor: mensaje } })
                    }
                }

                if (erroresPaquetes.some(pe => Object.keys(pe).length > 0)) e.paquetes = erroresPaquetes
            }
        }

        if (step === 3) {
            e.metodoPago = validarCampo('metodoPago', form)
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
        setSubmitting(true)
        setApiError(null)
        try {
            await agregarVenta({
                idCliente: parseInt(form.idCliente),
                idRuta: parseInt(form.idRuta),
                destinatario: {
                    nombreDestinatario: form.nombreDestinatario,
                    telefonoDestinatario: form.telefonoDestinatario,
                    direccionDestinatario: form.direccionDestinatario,
                },
                paquetes: form.paquetes.map(p => ({
                    descripcionContenido: p.descripcionContenido,
                    peso: parseFloat(p.peso),
                    alto: parseFloat(p.alto),
                    ancho: parseFloat(p.ancho),
                    profundidad: parseFloat(p.profundidad),
                    // null y no 0 -- el validador del backend acepta el campo vacío
                    // (optional nullable), pero 0 sí choca contra isFloat({min:1}).
                    valorDeclarado: p.valorDeclarado ? parseFloat(p.valorDeclarado) : null,
                    idRutaVehiculoConductor: parseInt(p.idRutaVehiculoConductor),
                })),
                fechaEstimadaEntrega: form.fechaEstimadaEntrega || null,
                observaciones: form.observaciones || null,
                metodoPago: form.metodoPago,
                valorServicio: parseFloat(form.valorServicio) || 0,
                impuestos: parseFloat(form.impuestos) || 0,
                estadoPago: form.estadoPago,
            })
            showToast('¡Venta registrada exitosamente!', 'success')
            setTimeout(() => { handleClose(); if (onSuccess) onSuccess() }, 1500)
        } catch (err) {
            setApiError(getErrorMessage(err, 'Error al registrar la venta.'))
        } finally {
            setSubmitting(false)
        }
    }

    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(form.idCliente))

    const getPlacaPaquete = (paquete) => {
        const rutaSel = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
        const par = (rutaSel?.paresVehiculoConductor || []).find(p => p.idRutaVehiculoConductor === parseInt(paquete.idRutaVehiculoConductor))
        return par?.vehiculo?.placa || '—'
    }

    const cardSx = {
        flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, overflow: 'hidden',
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Remitente — solo seleccionar cliente */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                                Remitente
                            </Typography>
                            <Autocomplete
                                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                options={clientes.filter(c => c.habilitado)}
                                getOptionLabel={(option) => {
                                    if (option.esNuevo) return ''
                                    const nombre = option.apellido ? `${option.nombre} ${option.apellido}` : option.nombre
                                    return `${nombre} — ${option.numeroIdentificacion}`
                                }}
                                isOptionEqualToValue={(opt, val) => opt.idCliente === val.idCliente}
                                filterOptions={(opts, { inputValue }) => {
                                    const base = !inputValue.trim()
                                        ? [...opts].sort((a, b) => b.idCliente - a.idCliente).slice(0, 5)
                                        : opts.filter(c => {
                                            const q = normalizarTexto(inputValue)
                                            return normalizarTexto(c.nombre || '').includes(q) ||
                                                normalizarTexto(c.apellido || '').includes(q) ||
                                                normalizarTexto(c.numeroIdentificacion || '').includes(q)
                                        })
                                    return [...base, OPCION_CLIENTE_NUEVO]
                                }}
                                value={clienteSeleccionado || null}
                                inputValue={clienteInput}
                                onInputChange={(_, val, reason) => {
                                    if (reason === 'input') {
                                        setClienteInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                                    } else if (reason === 'reset') {
                                        setClienteInput(val)
                                    } else if (reason === 'clear') {
                                        setClienteInput('')
                                    }
                                }}
                                onChange={(_, newValue) => {
                                    if (newValue?.esNuevo) {
                                        setModalNuevoCliente(true)
                                        return
                                    }
                                    setForm(prev => ({ ...prev, idCliente: newValue ? newValue.idCliente : '' }))
                                    setErrores(prev => newValue
                                        ? { ...prev, idCliente: '' }
                                        : (prev.idCliente ? { ...prev, idCliente: validarCampo('idCliente', { idCliente: '' }) } : prev))
                                }}
                                onBlur={() => setErrores(prev => ({ ...prev, idCliente: validarCampo('idCliente', form) }))}
                                renderOption={(props, option) => {
                                    const { key, ...rest } = props
                                    if (option.esNuevo) {
                                        return (
                                            <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                                                <Box sx={{
                                                    width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: theme.palette.primary.activeBg, color: theme.palette.primary.main,
                                                }}>
                                                    <AddOutlinedIcon sx={{ fontSize: 20 }} />
                                                </Box>
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.primary.main}>
                                                    Registrar nuevo cliente
                                                </Typography>
                                            </Box>
                                        )
                                    }
                                    const nombre = option.apellido ? `${option.nombre} ${option.apellido}` : option.nombre
                                    const iniciales = option.iniciales && option.iniciales !== 'U' ? option.iniciales : (option.nombre?.[0] || '') + (option.apellido?.[0] || '') || 'C'
                                    return (
                                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                width: 34, height: 34, flexShrink: 0,
                                                backgroundColor: theme.palette.avatarDefault.bg,
                                                color: theme.palette.avatarDefault.color,
                                                fontSize: '0.73rem', fontWeight: 700,
                                            }}>
                                                {iniciales}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                {nombre}
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                                {option.numeroIdentificacion}
                                            </Typography>
                                        </Box>
                                    )
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Cliente *"
                                        error={!!errores.idCliente} helperText={errores.idCliente || 'Busca por nombre, apellido o documento'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                        sx={formFieldStyles} />
                                )}
                            />
                            {clienteSeleccionado && (
                                <Paper elevation={0} sx={{
                                    mt: 1.5, p: 1.5, borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.background.default,
                                }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Nombre:</Box>
                                            {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>{clienteSeleccionado.tipoIdentificacion || 'ID'}:</Box>
                                            {clienteSeleccionado.numeroIdentificacion}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Teléfono:</Box>
                                            {clienteSeleccionado.telefono}
                                        </Typography>
                                        <Typography variant="body2">
                                            <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Correo:</Box>
                                            {clienteSeleccionado.email}
                                        </Typography>
                                        {clienteSeleccionado.direccion && (
                                            <Box sx={{ gridColumn: '1 / -1' }}>
                                                <Typography variant="body2">
                                                    <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Dirección:</Box>
                                                    {clienteSeleccionado.direccion}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            )}
                        </Box>

                        <Divider />

                        {/* Destinatario */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: theme.palette.text.primary }}>
                                Destinatario
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                                <FormField label="Nombre completo" name="nombreDestinatario" value={form.nombreDestinatario}
                                    onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, nombreDestinatario: validarCampo('nombreDestinatario', form) }))}
                                    required error={errores.nombreDestinatario}
                                    helperText={errores.nombreDestinatario} icon={PersonOutlinedIcon}
                                    placeholder="Ej: Juan Pérez" inputProps={{ maxLength: 50 }} />
                                <FormField label="Teléfono" name="telefonoDestinatario" value={form.telefonoDestinatario}
                                    onChange={handleChange}
                                    onBlur={() => setErrores(prev => ({ ...prev, telefonoDestinatario: validarCampo('telefonoDestinatario', form) }))}
                                    required error={errores.telefonoDestinatario}
                                    helperText={errores.telefonoDestinatario || 'Número de 10 dígitos'} icon={PhoneOutlinedIcon}
                                    inputProps={{ maxLength: 10 }} />
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <FormField label="Dirección de entrega" name="direccionDestinatario" value={form.direccionDestinatario}
                                        onChange={handleChange}
                                        onBlur={() => setErrores(prev => ({ ...prev, direccionDestinatario: validarCampo('direccionDestinatario', form) }))}
                                        required error={errores.direccionDestinatario}
                                        placeholder="Ej: Cra 23 #80-5"
                                        helperText={errores.direccionDestinatario || `${(form.direccionDestinatario || '').length}/300`}
                                        icon={HomeOutlinedIcon} multiline rows={2} inputProps={{ maxLength: 300 }} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {form.paquetes.map((paquete, index) => {
                            const errPaquete = errores.paquetes?.[index] || {}
                            return (
                                <Box key={index} sx={{
                                    display: 'flex', flexDirection: 'column', gap: 2.5,
                                    ...(form.paquetes.length > 1 ? { p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } : {}),
                                }}>
                                    {form.paquetes.length > 1 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                                Paquete {index + 1}
                                            </Typography>
                                            <IconButton onClick={() => handleQuitarPaquete(index)}
                                                disabled={form.paquetes.length === 1}
                                                sx={{ visibility: form.paquetes.length === 1 ? 'hidden' : 'visible' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                    <FormField label="Descripción del contenido" name="descripcionContenido" value={paquete.descripcionContenido}
                                        onChange={(e) => handlePaqueteChange(index, 'descripcionContenido', e.target.value)}
                                        onBlur={() => setErrorPaquete(index, 'descripcionContenido', validarCampoPaquete('descripcionContenido', paquete))}
                                        required error={errPaquete.descripcionContenido}
                                        helperText={errPaquete.descripcionContenido || `${paquete.descripcionContenido.length}/300`}
                                        multiline rows={2} inputProps={{ maxLength: 300 }} />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                                        <FormField label="Peso (kg)" name="peso" value={paquete.peso}
                                            onChange={(e) => handlePaqueteChange(index, 'peso', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'peso', validarCampoPaquete('peso', paquete))}
                                            required error={errPaquete.peso}
                                            placeholder="Ej: 1.5" helperText={errPaquete.peso || 'Ej: 1.5'}
                                            inputProps={{ maxLength: 7 }} />
                                        <FormField label="Alto (cm)" name="alto" value={paquete.alto}
                                            onChange={(e) => handlePaqueteChange(index, 'alto', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'alto', validarCampoPaquete('alto', paquete))}
                                            required error={errPaquete.alto}
                                            placeholder="Ej: 30" helperText={errPaquete.alto || 'Ej: 30'}
                                            inputProps={{ maxLength: 4 }} />
                                        <FormField label="Ancho (cm)" name="ancho" value={paquete.ancho}
                                            onChange={(e) => handlePaqueteChange(index, 'ancho', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'ancho', validarCampoPaquete('ancho', paquete))}
                                            required error={errPaquete.ancho}
                                            placeholder="Ej: 20" helperText={errPaquete.ancho || 'Ej: 20'}
                                            inputProps={{ maxLength: 4 }} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                                        <FormField label="Profundidad (cm)" name="profundidad" value={paquete.profundidad}
                                            onChange={(e) => handlePaqueteChange(index, 'profundidad', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'profundidad', validarCampoPaquete('profundidad', paquete))}
                                            required error={errPaquete.profundidad}
                                            placeholder="Ej: 15" helperText={errPaquete.profundidad || 'Ej: 15'}
                                            inputProps={{ maxLength: 4 }} />
                                        <FormField label="Valor declarado ($)" name="valorDeclarado" value={formatearMoneda(paquete.valorDeclarado)}
                                            onChange={(e) => handlePaqueteChange(index, 'valorDeclarado', e.target.value)}
                                            onBlur={() => setErrorPaquete(index, 'valorDeclarado', validarCampoPaquete('valorDeclarado', paquete))}
                                            helperText={errPaquete.valorDeclarado || 'Opcional'}
                                            placeholder="Ej: 50.000" error={errPaquete.valorDeclarado}
                                            inputProps={{ maxLength: 11 }} />
                                    </Box>
                                </Box>
                            )
                        })}
                        <Button
                            onClick={handleAgregarPaquete}
                            startIcon={<AddOutlinedIcon />}
                            disabled={form.paquetes.length >= MAX_PAQUETES}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
                        >
                            Agregar paquete
                        </Button>
                    </Box>
                )
            case 2: {
                const rutaElegida = rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta))
                const paresElegida = rutaElegida?.paresVehiculoConductor || []
                // Un Alert por cada vehículo del convoy que ya tiene paquetes asignados —
                // la capacidad ahora es por vehículo, no por ruta completa.
                const paresConUso = paresElegida
                    .map(par => {
                        const pesoNuevo = form.paquetes
                            .filter(p => parseInt(p.idRutaVehiculoConductor) === par.idRutaVehiculoConductor)
                            .reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                        const capacidad = par.vehiculo?.capacidad ? Number(par.vehiculo.capacidad) : null
                        // "disponible" es el espacio que había ANTES de esta venta (contra el
                        // que se compara si pesoNuevo se pasa o no). "disponibleFinal" es lo
                        // que de verdad queda después de contar los paquetes que se están
                        // registrando ahora mismo — como si la venta ya estuviera guardada —
                        // para que el aviso muestre el sobrante real en vivo, no el de antes.
                        const disponible = capacidad != null ? Math.max(0, capacidad - Number(par.pesoUsado || 0)) : null
                        const disponibleFinal = disponible != null ? Math.max(0, disponible - pesoNuevo) : null
                        return { par, pesoNuevo, disponible, disponibleFinal, excede: disponible != null && pesoNuevo > disponible }
                    })
                    .filter(item => item.pesoNuevo > 0)
                // Cada alerta de capacidad se ancla al último paquete asignado a ese
                // vehículo, en vez de mostrarlas todas juntas al final — así queda
                // pegada al vehículo al que corresponde y no se desordena cuando hay
                // varios paquetes/vehículos.
                const alertaPorIndice = new Map()
                paresConUso.forEach(item => {
                    let ultimoIndice = -1
                    form.paquetes.forEach((p, i) => {
                        if (parseInt(p.idRutaVehiculoConductor) === item.par.idRutaVehiculoConductor) ultimoIndice = i
                    })
                    if (ultimoIndice >= 0) alertaPorIndice.set(ultimoIndice, item)
                })

                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <Autocomplete
                                popupIcon={<KeyboardArrowDownOutlinedIcon />}
                                options={rutasProgramadas.filter(r => r.habilitado !== false && r.estado === 'Programada')}
                                getOptionLabel={(option) => {
                                    // Placas de todos los vehículos del convoy en la etiqueta misma: si hay
                                    // dos rutas con el mismo nombre (ej. mismo conductor, distinto vehículo),
                                    // así se distinguen directo en la lista, sin tener que elegir una para verlo.
                                    const placas = (option.paresVehiculoConductor || []).map(p => p.vehiculo?.placa).filter(Boolean).join(', ')
                                    const destinoTxt = option.destino?.ciudad || 'Sin destino'
                                    return `${option.origen || 'Sin nombre'} → ${destinoTxt}${placas ? ` (${placas})` : ''} — $${Number(option.destino?.tarifaBase || 0).toLocaleString()}`
                                }}
                                isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
                                renderOption={(props, option) => {
                                    const { key, ...rest } = props
                                    return (
                                        <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                width: 34, height: 34, flexShrink: 0,
                                                backgroundColor: theme.palette.avatarDefault.bg,
                                                color: theme.palette.avatarDefault.color,
                                            }}>
                                                <RouteOutlinedIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                                {option.origen || 'Sin nombre'} → {option.destino?.ciudad || 'Sin destino'}
                                            </Typography>
                                            <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                                                ${Number(option.destino?.tarifaBase || 0).toLocaleString('es-CO')}
                                            </Typography>
                                        </Box>
                                    )
                                }}
                                filterOptions={(opts, { inputValue }) => {
                                    if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                                    const q = normalizarTexto(inputValue)
                                    return opts.filter(r =>
                                        normalizarTexto(r.origen || '').includes(q) ||
                                        normalizarTexto(r.destino?.ciudad || '').includes(q) ||
                                        normalizarTexto(r.destino?.departamento || '').includes(q)
                                    )
                                }}
                                value={rutasProgramadas.find(r => r.idRuta === parseInt(form.idRuta)) || null}
                                inputValue={rutaInput}
                                onInputChange={(_, val, reason) => {
                                    if (reason === 'input') {
                                        setRutaInput(val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s-]/g, ''))
                                    } else if (reason === 'reset') {
                                        setRutaInput(val)
                                    } else if (reason === 'clear') {
                                        setRutaInput('')
                                    }
                                }}
                                onChange={(_, newValue) => {
                                    // Cambiar de ruta invalida cualquier asignación de paquete→vehículo que
                                    // ya se hubiera hecho (esos idRutaVehiculoConductor pertenecen al convoy
                                    // de la ruta anterior, no a la nueva).
                                    const fechaSalida = newValue?.fechaSalida || ''
                                    const fechaLlegadaEstimada = newValue?.fechaLlegadaEstimada || ''
                                    const minimaNueva = fechaSalida ? sumarDias(fechaSalida, 1) : ''
                                    const maximaNueva = fechaLlegadaEstimada ? sumarDias(fechaLlegadaEstimada, -1) : ''
                                    const fechaResetea = !!(newValue && form.fechaEstimadaEntrega && (
                                        (minimaNueva && form.fechaEstimadaEntrega < minimaNueva) ||
                                        (maximaNueva && form.fechaEstimadaEntrega > maximaNueva)
                                    ))
                                    if (newValue) {
                                        valorServicioManualRef.current = false
                                        impuestosManualRef.current = false
                                        setForm(prev => {
                                            const pesoTotal = prev.paquetes.reduce((s, p) => s + (parseFloat(p.peso) || 0), 0)
                                            const valorServicio = calcularValorServicio(newValue.destino?.tarifaBase, pesoTotal)
                                            const impuestos = Math.round(valorServicio * 0.10)
                                            return {
                                                ...prev,
                                                idRuta: newValue.idRuta,
                                                destino: `${newValue.origen || 'Sin nombre'} → ${newValue.destino?.ciudad || 'Sin destino'} — $${Number(newValue.destino?.tarifaBase || 0).toLocaleString('es-CO')}`,
                                                fechaSalidaRuta: fechaSalida,
                                                fechaLlegadaEstimadaRuta: fechaLlegadaEstimada,
                                                fechaEstimadaEntrega: prev.fechaEstimadaEntrega && (
                                                    (minimaNueva && prev.fechaEstimadaEntrega < minimaNueva) ||
                                                    (maximaNueva && prev.fechaEstimadaEntrega > maximaNueva)
                                                ) ? '' : prev.fechaEstimadaEntrega,
                                                valorServicio,
                                                impuestos,
                                                total: valorServicio + impuestos,
                                                paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                                            }
                                        })
                                    } else {
                                        setForm(prev => ({
                                            ...prev, idRuta: '', destino: '', fechaSalidaRuta: '', fechaLlegadaEstimadaRuta: '',
                                            paquetes: prev.paquetes.map(p => ({ ...p, idRutaVehiculoConductor: '' })),
                                        }))
                                    }
                                    setErrores(prev => ({
                                        ...prev,
                                        idRuta: newValue ? '' : (prev.idRuta ? validarCampo('idRuta', { idRuta: '' }) : prev.idRuta),
                                        fechaEstimadaEntrega: fechaResetea && prev.fechaEstimadaEntrega
                                            ? validarCampo('fechaEstimadaEntrega', { fechaEstimadaEntrega: '' })
                                            : (newValue ? prev.fechaEstimadaEntrega : ''),
                                        // El cambio de ruta invalida el vehículo asignado, pero no otros
                                        // errores del paquete (peso, dimensiones, etc.) que no dependen de la ruta.
                                        paquetes: prev.paquetes?.map(pe => {
                                            const { idRutaVehiculoConductor: _omit, ...resto } = pe || {}
                                            return resto
                                        }),
                                    }))
                                    setApiError(null)
                                }}
                                onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
                                noOptionsText="No se encontraron rutas"
                                renderInput={(params) => (
                                    <TextField {...params} label="Ruta *"
                                        error={!!errores.idRuta} helperText={errores.idRuta || 'Busca por origen o destino'}
                                        slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                                        sx={formFieldStyles} />
                                )}
                            />
                            <TextField fullWidth label="Fecha estimada de entrega" name="fechaEstimadaEntrega"
                                type="date" value={form.fechaEstimadaEntrega} onChange={handleChange}
                                onBlur={() => setErrores(prev => ({ ...prev, fechaEstimadaEntrega: validarCampo('fechaEstimadaEntrega', form) }))} required
                                error={!!errores.fechaEstimadaEntrega}
                                helperText={errores.fechaEstimadaEntrega || (form.fechaSalidaRuta
                                    ? `Desde el ${formatFecha(sumarDias(form.fechaSalidaRuta, 1))}${form.fechaLlegadaEstimadaRuta ? ` hasta el ${formatFecha(sumarDias(form.fechaLlegadaEstimadaRuta, -1))}` : ''}`
                                    : 'Selecciona primero una ruta')}
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: {
                                    min: form.fechaSalidaRuta ? sumarDias(form.fechaSalidaRuta, 1) : undefined,
                                    max: form.fechaLlegadaEstimadaRuta ? sumarDias(form.fechaLlegadaEstimadaRuta, -1) : undefined,
                                } }}
                                sx={formFieldStyles} />
                        </Box>
                        {rutaElegida && (
                            <Paper elevation={0} sx={{
                                p: 1.5, borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.default,
                            }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Destino:</Box>
                                        {rutaElegida.destino ? `${rutaElegida.destino.ciudad}, ${rutaElegida.destino.departamento}` : '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Salida:</Box>
                                        {rutaElegida.fechaSalida ? `${formatFecha(rutaElegida.fechaSalida)}${rutaElegida.horaSalida ? ' · ' + rutaElegida.horaSalida.slice(0, 5) : ''}` : '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mr: 0.5 }}>Llegada:</Box>
                                        {rutaElegida.fechaLlegadaEstimada ? `${formatFecha(rutaElegida.fechaLlegadaEstimada)}${rutaElegida.horaLlegadaEstimada ? ' · ' + rutaElegida.horaLlegadaEstimada.slice(0, 5) : ''}` : '—'}
                                    </Typography>
                                </Box>
                            </Paper>
                        )}
                        {rutaElegida && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                    Asignar paquetes a vehículo
                                </Typography>
                                {form.paquetes.map((paquete, index) => {
                                    const alerta = alertaPorIndice.get(index)
                                    const mensajeCapacidad = alerta?.excede
                                        ? `${alerta.par.vehiculo?.placa || 'Este vehículo'} ya no tiene espacio — supera la capacidad en ${Number((alerta.pesoNuevo - alerta.disponible).toFixed(2))} kg. Reasígnalo a otro vehículo.`
                                        : null
                                    const errorCampo = errores.paquetes?.[index]?.idRutaVehiculoConductor || mensajeCapacidad
                                    return (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <FormSelect
                                                label={form.paquetes.length > 1 ? `Paquete ${index + 1} — Vehículo` : 'Vehículo'}
                                                name="idRutaVehiculoConductor"
                                                value={paquete.idRutaVehiculoConductor}
                                                onChange={(e) => handlePaqueteChange(index, 'idRutaVehiculoConductor', e.target.value)}
                                                onBlur={() => setErrorPaquete(index, 'idRutaVehiculoConductor', validarCampoPaquete('idRutaVehiculoConductor', paquete))}
                                                required
                                                error={!!errorCampo}
                                                helperText={errorCampo || `¿A cuál vehículo va este paquete?${paquete.peso ? ` (${paquete.peso} kg)` : ''}`}
                                                renderValue={(val) => {
                                                    const par = paresElegida.find(p => p.idRutaVehiculoConductor === val)
                                                    if (!par) return ''
                                                    const marcaModelo = [par.vehiculo?.marca, par.vehiculo?.modelo].filter(Boolean).join(' ')
                                                    const nombreConductor = par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'
                                                    return `${par.vehiculo?.placa || 'Sin placa'}${marcaModelo ? ' — ' + marcaModelo : ''} — ${nombreConductor}`
                                                }}>
                                                {paresElegida.map((par) => (
                                                    <MenuItem key={par.idRutaVehiculoConductor} value={par.idRutaVehiculoConductor} sx={{ py: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                            <PlacaDisplay placa={par.vehiculo?.placa} theme={theme} />
                                                            <Typography variant="body2" color={theme.palette.text.secondary} noWrap sx={{ minWidth: 0 }}>
                                                                {[par.vehiculo?.marca, par.vehiculo?.modelo].filter(Boolean).join(' ')}
                                                            </Typography>
                                                            <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                                                            <Avatar sx={{
                                                                width: 28, height: 28, flexShrink: 0,
                                                                backgroundColor: theme.palette.avatarDefault.bg,
                                                                color: theme.palette.avatarDefault.color,
                                                                fontSize: '0.68rem', fontWeight: 700,
                                                            }}>
                                                                {(par.conductor?.usuario?.nombre?.[0] || '')}{(par.conductor?.usuario?.apellido?.[0] || '')}
                                                            </Avatar>
                                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
                                                                {par.conductor?.usuario ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}` : 'Sin conductor'}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </FormSelect>
                                            {alerta && !alerta.excede && (
                                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                    <strong>{alerta.par.vehiculo?.placa || 'Vehículo'}:</strong> quedan{' '}
                                                    <strong>{alerta.disponibleFinal != null ? Number(alerta.disponibleFinal.toFixed(2)) : '∞'} kg</strong> disponibles.
                                                </Alert>
                                            )}
                                        </Box>
                                    )
                                })}
                            </Box>
                        )}
                        <FormField label="Observaciones" name="observaciones" value={form.observaciones}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, observaciones: validarCampo('observaciones', form) }))}
                            multiline rows={2}
                            helperText={errores.observaciones || `Opcional · ${(form.observaciones || '').length}/500`}
                            error={errores.observaciones}
                            inputProps={{ maxLength: 500 }} />
                    </Box>
                )
            }
            case 3:
                return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                            onChange={handleChange}
                            onBlur={() => setErrores(prev => ({ ...prev, metodoPago: validarCampo('metodoPago', form) }))} required error={errores.metodoPago}
                            helperText={errores.metodoPago}>
                            <MenuItem value="Contraentrega">Contraentrega</MenuItem>
                            <MenuItem value="Efectivo">Efectivo</MenuItem>
                            <MenuItem value="Transferencia">Transferencia</MenuItem>
                        </FormSelect>
                        <FormField label="Valor del servicio ($)" name="valorServicio"
                            value={formatearMoneda(form.valorServicio)} onChange={handleChange}
                            helperText="Tarifa del destino + peso × tarifa por kg (editable)"
                            inputProps={{ maxLength: 11 }} />
                        <FormField label="Impuestos ($)" name="impuestos"
                            value={formatearMoneda(form.impuestos)} onChange={handleChange}
                            helperText="10% del valor del servicio (editable)"
                            inputProps={{ maxLength: 11 }} />
                        <FormField label="Total a pagar ($)" name="total"
                            value={formatearMoneda(form.total)} onChange={handleChange} disabled />
                    </Box>
                )
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {apiError && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentIndOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Remitente</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del cliente</Typography>
                                {clienteSeleccionado && <>
                                    <ConfirmRow label="Nombre" value={`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`} />
                                    <ConfirmRow label="Identificación" value={clienteSeleccionado.numeroIdentificacion} />
                                    <ConfirmRow label="Teléfono" value={clienteSeleccionado.telefono} />
                                </>}
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PersonOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Destinatario</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Información del destinatario</Typography>
                                <ConfirmRow label="Nombre" value={form.nombreDestinatario} />
                                <ConfirmRow label="Teléfono" value={form.telefonoDestinatario} />
                                <ConfirmRow label="Dirección" value={form.direccionDestinatario} />
                            </Paper>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">{form.paquetes.length > 1 ? 'Paquetes' : 'Paquete'}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                    {form.paquetes.length > 1 ? 'Características de los paquetes' : 'Características del paquete'}
                                </Typography>
                                {form.paquetes.map((p, i) => (
                                    <Box key={i}>
                                        {form.paquetes.length > 1 && (
                                            <Typography variant="caption" fontWeight={700} color={theme.palette.text.secondary}
                                                sx={{ display: 'block', mt: i > 0 ? 1.5 : 0, mb: 0.5 }}>
                                                Paquete {i + 1}
                                            </Typography>
                                        )}
                                        <ConfirmRow label="Contenido" value={p.descripcionContenido} />
                                        <ConfirmRow label="Peso" value={p.peso ? `${p.peso} kg` : null} />
                                        <ConfirmRow label="Dimensiones" value={p.alto ? `${p.alto}×${p.ancho}×${p.profundidad} cm` : null} />
                                        <ConfirmRow label="Valor declarado" value={p.valorDeclarado ? `$${parseFloat(p.valorDeclarado).toLocaleString()}` : null} />
                                        <ConfirmRow label="Vehículo" value={getPlacaPaquete(p)} />
                                        {i < form.paquetes.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </Box>
                                ))}
                            </Paper>
                            <Paper elevation={0} sx={cardSx}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <PaymentOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                    <Typography fontWeight={700} fontSize="0.95rem">Envío y Pago</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Ruta, fechas y valores</Typography>
                                <ConfirmRow label="Ruta" value={form.destino} />
                                <ConfirmRow label="Fecha entrega" value={formatFecha(form.fechaEstimadaEntrega)} />
                                <ConfirmRow label="Observaciones" value={form.observaciones} />
                                <ConfirmRow label="Método de pago" value={form.metodoPago} />
                                <ConfirmRow label="Valor del servicio" value={form.valorServicio ? `$${parseFloat(form.valorServicio).toLocaleString()}` : null} />
                                <ConfirmRow label="Impuestos" value={form.impuestos ? `$${parseFloat(form.impuestos).toLocaleString()}` : null} />
                                <ConfirmRow label="Total" value={form.total ? `$${parseFloat(form.total).toLocaleString()}` : null} />
                            </Paper>
                        </Box>
                    </Box>
                )
            default:
                return null
        }
    }

    return (
        <>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Registrar Venta</Typography>
                    <Typography variant="body2" color={theme.palette.text.secondary}>
                        Complete los datos de la nueva encomienda paso a paso.
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
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
                    <Button onClick={handleClose} disableRipple
                        sx={{
                            textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
                            '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
                        }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={activeStep < steps.length - 1 ? handleNext : handleSubmit}
                        variant="contained" disabled={submitting}
                        endIcon={submitting ? undefined : (activeStep < steps.length - 1 ? <ArrowForwardOutlinedIcon /> : <CheckOutlinedIcon />)}
                        disableRipple
                        sx={{
                            textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 160,
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
                            '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
                            '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
                        }}>
                        {submitting
                            ? <CircularProgress size={18} color="inherit" />
                            : (activeStep < steps.length - 1 ? 'Siguiente' : 'Registrar')}
                    </Button>
                </Box>
            </Box>
        </Dialog>
        <RegistrarCliente
            open={modalNuevoCliente}
            onClose={() => setModalNuevoCliente(false)}
            onSuccess={(nuevoCliente) => {
                setModalNuevoCliente(false)
                if (nuevoCliente) {
                    setForm(prev => ({ ...prev, idCliente: nuevoCliente.idCliente }))
                    setErrores(prev => ({ ...prev, idCliente: '' }))
                    const nombre = nuevoCliente.apellido ? `${nuevoCliente.nombre} ${nuevoCliente.apellido}` : nuevoCliente.nombre
                    setClienteInput(`${nombre} — ${nuevoCliente.numeroIdentificacion}`)
                }
            }}
        />
        </>
    )
}

export default RegistrarVenta
