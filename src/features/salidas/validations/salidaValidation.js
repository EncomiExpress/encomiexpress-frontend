import { formatFecha, esSoloRelleno } from '../../../shared/utils/formatters.js'
import { getRangoHorario, esDomingo, sumarDias, hoyISO, ahoraHHMM, MIN_DIAS_SALIDA_LLEGADA, MAX_DIAS_ANTICIPACION } from '../../../shared/utils/horarioLaboral.js'
import { validarObservacionesRuta } from '../../../shared/validations/observacionesRutaValidation.js'

// Salidas son recorridos regionales cortos — no tiene sentido dejar programar una
// salida o llegada con meses/años de anticipación. Debe coincidir con
// MAX_DIAS_ANTICIPACION del backend (salidaProgramadaService.js/horarioLaboral.js).
export const maxISO = () => sumarDias(hoyISO(), MAX_DIAS_ANTICIPACION)

// Orden pensado como se arma una salida en la práctica: primero el Horario (a
// qué hora sale de la base y cuándo se espera que llegue), y luego a quién se
// le encarga el viaje -- Vehículo y Conductor. Sin paso "Ruta": la plantilla ya
// viene fija por el contexto en el que se abre el wizard (siempre se llega
// desde "Salidas de <ruta>", ver ListarSalidaProgramada.jsx) o, en un regreso,
// la resuelve sola el backend -- nunca es una elección del usuario.
export const steps = ['Horario', 'Vehículo y Conductor', 'Confirmación']

// Máximo de pares vehículo+conductor por salida — igual al tope del backend
// (MAX_PARES_RUTA en salidaProgramadaService.js), mismo criterio que MAX_PAQUETES en Ventas.
export const MAX_PARES = 10

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "horaLlegadaEstimada" no vive
// aquí: es opcional y no tiene ninguna regla que validar. El piso de fechaSalida es
// hoy, no mañana — una salida puede salir más tarde el mismo día en que se programa o
// reprograma. Mismo piso replicado en el backend (salidaProgramadaService.validarHorarioRuta).
export const validarCampo = (name, form) => {
    switch (name) {
        case 'fechaSalida':
            if (!form.fechaSalida) return 'La fecha de salida es obligatoria'
            if (form.fechaSalida < hoyISO()) return 'La fecha de salida no puede ser anterior a hoy'
            if (form.fechaSalida > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            if (esDomingo(form.fechaSalida)) return 'No se puede salir en domingo (la empresa permanece cerrada)'
            return ''
        case 'horaSalida': {
            if (!form.horaSalida) return 'La hora de salida es obligatoria'
            const rango = getRangoHorario(form.fechaSalida)
            if (rango && (form.horaSalida < rango.min || form.horaSalida > rango.max)) return `Debe estar entre las ${rango.min} y las ${rango.max}`
            if (form.fechaSalida === hoyISO() && form.horaSalida <= ahoraHHMM()) {
                return 'Esa hora ya pasó — elige una hora más adelante'
            }
            return ''
        }
        case 'fechaLlegadaEstimada': {
            if (!form.fechaSalida) return 'Primero selecciona la fecha de salida'
            if (!form.fechaLlegadaEstimada) return 'La fecha de llegada es obligatoria'
            if (esDomingo(form.fechaLlegadaEstimada)) return 'No se puede llegar en domingo (la empresa permanece cerrada)'
            if (form.fechaLlegadaEstimada > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            const minima = sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA)
            if (form.fechaLlegadaEstimada < minima) {
                return MIN_DIAS_SALIDA_LLEGADA > 0
                    ? `Debe ser al menos ${MIN_DIAS_SALIDA_LLEGADA} día(s) después de la salida (mínimo el ${formatFecha(minima)})`
                    : `No puede ser anterior a la fecha de salida (mínimo el ${formatFecha(minima)})`
            }
            return ''
        }
        case 'horaLlegadaEstimada': {
            if (!form.horaLlegadaEstimada) return ''
            const rango = getRangoHorario(form.fechaLlegadaEstimada)
            if (rango && (form.horaLlegadaEstimada < rango.min || form.horaLlegadaEstimada > rango.max)) return `Debe estar entre las ${rango.min} y las ${rango.max}`
            return ''
        }
        case 'observaciones':
            if (form.observaciones && esSoloRelleno(form.observaciones)) return 'Las observaciones no pueden contener solo espacios o guiones'
            if (form.observaciones && form.observaciones.length > 500) return 'Las observaciones no pueden superar los 500 caracteres'
            return validarObservacionesRuta(form.observaciones)
        default:
            return ''
    }
}

// Valida el array de pares vehículo+conductor (convoy de la salida) — mismo patrón
// que validarCategorias() en RegistrarConductor.jsx.
//
// `capacidadCtx` (opcional, solo lo manda ActualizarSalidaProgramada.jsx) — si al
// cambiarle el vehículo a un par que YA tiene paquetes asignados el vehículo nuevo
// no aguanta ese peso, se avisa acá (mismo chequeo que el backend).
export const validarPares = (pares, { vehiculos, paresOriginales } = {}) => {
    const completos = pares.filter(p => p.idVehiculo && p.idConductor)
    const incompletos = pares.some(p => (p.idVehiculo && !p.idConductor) || (!p.idVehiculo && p.idConductor))
    if (completos.length === 0) return 'Agrega al menos un vehículo y su conductor'
    if (incompletos) return 'Completa el vehículo y el conductor de cada fila (o quítala)'
    const idsVehiculo = completos.map(p => p.idVehiculo)
    const idsConductor = completos.map(p => p.idConductor)
    if (new Set(idsVehiculo).size !== idsVehiculo.length) return 'No repitas el mismo vehículo en dos filas'
    if (new Set(idsConductor).size !== idsConductor.length) return 'No repitas el mismo conductor en dos filas'
    if (vehiculos && paresOriginales) {
        for (const par of completos) {
            const original = paresOriginales.find(p => p.idSalidaVehiculoConductor === par.idSalidaVehiculoConductor)
            if (!original || parseInt(par.idVehiculo) === original.idVehiculo) continue
            const pesoAsignado = Number(original.pesoUsado || 0)
            if (pesoAsignado <= 0) continue
            const vehiculo = vehiculos.find(v => v.idVehiculo === parseInt(par.idVehiculo))
            const capacidad = vehiculo?.capacidad ? Number(vehiculo.capacidad) : null
            if (capacidad != null && pesoAsignado > capacidad) {
                return `El vehículo ${vehiculo.placa || ''} tiene capacidad para ${capacidad} kg, pero este par ya tiene ${pesoAsignado.toFixed(2)} kg en paquetes asignados. Elige un vehículo con más capacidad.`
            }
        }
    }
    return ''
}

// esRegreso: en modo regreso el paso "Vehículo y Conductor" no valida nada (el
// convoy lo hereda el backend, ver REGLA NUEVA en salidaProgramadaService.js).
// `esRegreso` lo pasan los componentes del wizard
// (RegistrarSalidaProgramada/ActualizarSalidaProgramada).
export const validarPaso = (step, form, capacidadCtx, esRegreso = false) => {
    const e = {}
    if (step === 0) {
        e.fechaSalida = validarCampo('fechaSalida', form)
        e.horaSalida = validarCampo('horaSalida', form)
        e.fechaLlegadaEstimada = validarCampo('fechaLlegadaEstimada', form)
        e.horaLlegadaEstimada = validarCampo('horaLlegadaEstimada', form)
        e.observaciones = validarCampo('observaciones', form)
    }
    if (step === 1) {
        e.pares = esRegreso ? '' : validarPares(form.pares, capacidadCtx)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
