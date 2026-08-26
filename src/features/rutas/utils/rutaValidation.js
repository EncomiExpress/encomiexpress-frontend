import { formatFecha, esSoloRelleno } from '../../../shared/utils/formatters.js'
import { getRangoHorario, esDomingo, sumarDias, hoyISO, MIN_DIAS_SALIDA_LLEGADA, MAX_DIAS_ANTICIPACION } from '../../../shared/utils/horarioLaboral.js'

export const mananaISO = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const pad2 = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// Rutas son recorridos regionales cortos — no tiene sentido dejar programar una salida
// o llegada con meses/años de anticipación. Mismo tope para ambas fechas (no se reduce
// el de salida para "dejar espacio" al mínimo de llegada — si una combinación puntual
// no deja ningún día de llegada válido, se explica con un mensaje claro en el campo de
// llegada, en vez de reducir el calendario de salida sin avisar por qué). Debe
// coincidir con MAX_DIAS_ANTICIPACION del backend (rutaService.js/horarioLaboral.js).
export const maxISO = () => sumarDias(hoyISO(), MAX_DIAS_ANTICIPACION)

export const steps = ['Datos de la Ruta', 'Horario', 'Confirmación']

// Máximo de pares vehículo+conductor por ruta — igual al tope del backend (MAX_PARES_RUTA
// en rutaService.js), mismo criterio que MAX_PAQUETES en Ventas.
export const MAX_PARES = 10

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "horaLlegadaEstimada" no vive
// aquí: es opcional y no tiene ninguna regla que validar. Se mantiene "fecha posterior a
// hoy" en fechaSalida también en modo Actualizar: una ruta solo se puede editar mientras
// sigue "Programada", así que su fecha de salida real siempre debe seguir siendo futura.
export const validarCampo = (name, form) => {
    switch (name) {
        case 'origen':
            if (!form.origen?.trim()) return 'El origen de la ruta es obligatorio'
            if (esSoloRelleno(form.origen)) return 'El origen de la ruta no puede contener solo espacios o guiones'
            return ''
        case 'idDestino':
            return form.idDestino ? '' : 'Selecciona un destino'
        case 'fechaSalida':
            if (!form.fechaSalida) return 'La fecha de salida es obligatoria'
            if (form.fechaSalida < mananaISO()) return 'La fecha de salida debe ser posterior a hoy'
            if (form.fechaSalida > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            if (esDomingo(form.fechaSalida)) return 'No se puede salir en domingo (la empresa permanece cerrada)'
            return ''
        case 'horaSalida': {
            if (!form.horaSalida) return 'La hora de salida es obligatoria'
            const rango = getRangoHorario(form.fechaSalida)
            if (rango && (form.horaSalida < rango.min || form.horaSalida > rango.max)) return `Debe estar entre las ${rango.min} y las ${rango.max}`
            return ''
        }
        case 'fechaLlegadaEstimada': {
            if (!form.fechaSalida) return 'Primero selecciona la fecha de salida'
            if (!form.fechaLlegadaEstimada) return 'La fecha de llegada es obligatoria'
            if (esDomingo(form.fechaLlegadaEstimada)) return 'No se puede llegar en domingo (la empresa permanece cerrada)'
            if (form.fechaLlegadaEstimada > maxISO()) return `No se puede programar con más de ${MAX_DIAS_ANTICIPACION} días de anticipación (máximo el ${formatFecha(maxISO())})`
            const minima = sumarDias(form.fechaSalida, MIN_DIAS_SALIDA_LLEGADA)
            if (form.fechaLlegadaEstimada < minima) return `Debe ser al menos ${MIN_DIAS_SALIDA_LLEGADA} días después de la salida (mínimo el ${formatFecha(minima)})`
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
            return ''
        default:
            return ''
    }
}

// Valida el array de pares vehículo+conductor (convoy de la ruta) — mismo patrón que
// validarCategorias() en RegistrarConductor.jsx para categoriasLicencia.
export const validarPares = (pares) => {
    const completos = pares.filter(p => p.idVehiculo && p.idConductor)
    const incompletos = pares.some(p => (p.idVehiculo && !p.idConductor) || (!p.idVehiculo && p.idConductor))
    if (completos.length === 0) return 'Agrega al menos un vehículo y su conductor'
    if (incompletos) return 'Completa el vehículo y el conductor de cada fila (o quítala)'
    const idsVehiculo = completos.map(p => p.idVehiculo)
    const idsConductor = completos.map(p => p.idConductor)
    if (new Set(idsVehiculo).size !== idsVehiculo.length) return 'No repitas el mismo vehículo en dos filas'
    if (new Set(idsConductor).size !== idsConductor.length) return 'No repitas el mismo conductor en dos filas'
    return ''
}

export const validarPaso = (step, form) => {
    const e = {}
    if (step === 0) {
        e.origen = validarCampo('origen', form)
        e.pares = validarPares(form.pares)
        e.idDestino = validarCampo('idDestino', form)
    }
    if (step === 1) {
        e.fechaSalida = validarCampo('fechaSalida', form)
        e.horaSalida = validarCampo('horaSalida', form)
        e.fechaLlegadaEstimada = validarCampo('fechaLlegadaEstimada', form)
        e.horaLlegadaEstimada = validarCampo('horaLlegadaEstimada', form)
        e.observaciones = validarCampo('observaciones', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
