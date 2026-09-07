import { formatFecha, esSoloRelleno } from '../../../shared/utils/formatters.js'
import { getRangoHorario, esDomingo, sumarDias, hoyISO, ahoraHHMM, MIN_DIAS_SALIDA_LLEGADA, MAX_DIAS_ANTICIPACION } from '../../../shared/utils/horarioLaboral.js'
import { validarObservacionesRuta } from '../../../shared/validations/observacionesRutaValidation.js'

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

// Máximo de paradas intermedias por ruta — igual al tope del backend (validarParadas
// en rutaService.js).
export const MAX_PARADAS = 20

// Mismo alfabeto que ya filtra RegistrarRutaProgramacion.jsx en vivo para origen
// (letras + guion + guion bajo) — el validador replica esa misma regla.
const ORIGEN_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-_]+$/
const ORIGEN_MAX_LENGTH = 100

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). "horaLlegadaEstimada" no vive
// aquí: es opcional y no tiene ninguna regla que validar. El piso de fechaSalida es
// hoy, no mañana — una ruta puede salir más tarde el mismo día en que se programa o
// reprograma (ej. reprogramar para la tarde una Cancelada por una falla ya resuelta).
// Mismo piso replicado en el backend (rutaService.validarHorarioRuta), que además
// solo lo exige cuando la fecha efectivamente cambia — ver LOGICA.md.
export const validarCampo = (name, form) => {
    switch (name) {
        case 'origen':
            if (!form.origen?.trim()) return 'El origen de la ruta es obligatorio'
            if (esSoloRelleno(form.origen)) return 'El origen de la ruta no puede contener solo espacios o guiones'
            if (!ORIGEN_REGEX.test(form.origen)) return 'El origen contiene caracteres no permitidos'
            if (form.origen.length > ORIGEN_MAX_LENGTH) return `El origen no puede superar los ${ORIGEN_MAX_LENGTH} caracteres`
            return ''
        case 'idDestino':
            return form.idDestino ? '' : 'Selecciona un destino'
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
            // Solo aplica cuando la fecha elegida es HOY — un día futuro no tiene "hora ya
            // pasada". Es una validación de UX (backend no la exige en create/update: una
            // hora ya vencida hoy simplemente hace que el job de auto-inicio la agarre de
            // inmediato en su próximo tick, lo cual es válido si de verdad se quiere salir
            // ya — acá solo se avisa por si fue un error de dedo).
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

// Paradas intermedias del corredor — opcionales, ni siquiera hace falta agregar
// ninguna. Si se agregan, no se puede repetir el mismo municipio dos veces (mismo
// criterio que valida el backend, ver rutaService.validarParadas).
export const validarParadas = (paradas) => {
    const completas = (paradas || []).filter(p => p.idDestino)
    const idsDestino = completas.map(p => p.idDestino)
    if (new Set(idsDestino).size !== idsDestino.length) return 'No repitas el mismo municipio en dos paradas'
    return ''
}

export const validarPaso = (step, form) => {
    const e = {}
    if (step === 0) {
        e.origen = validarCampo('origen', form)
        e.pares = validarPares(form.pares)
        e.idDestino = validarCampo('idDestino', form)
        e.paradas = validarParadas(form.paradas)
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
