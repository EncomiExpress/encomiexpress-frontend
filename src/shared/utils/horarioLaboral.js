// Horario de SALIDA de las rutas (despacho). Los vehículos se despachan de noche, una
// vez organizada la carga que se recibió en la oficina durante el día (dato del
// cliente) — por eso la hora de salida de una salida programada solo puede ser nocturna.
// Índice = Date.prototype.getDay() (0 = domingo: la empresa permanece cerrada).
// DEBE coincidir con encomiexpress-backend/src/utils/horarioLaboral.js
//
// Cada rango tiene que caber dentro de UN solo día (min < max): SelectorHora no maneja
// rangos que cruzan la medianoche (ej. 19:00 → 05:00).
//
// El horario de recepción de paquetes en la oficina (lunes a viernes 08:00–19:00,
// sábados 08:00–15:00, también dato del cliente) NO se valida ni se muestra en ningún
// lado — no forma parte de esta tabla.
export const HORARIO_SALIDA = {
    0: null,
    1: { min: '19:00', max: '23:59' },
    2: { min: '19:00', max: '23:59' },
    3: { min: '19:00', max: '23:59' },
    4: { min: '19:00', max: '23:59' },
    5: { min: '19:00', max: '23:59' },
    6: { min: '19:00', max: '23:59' },
}

// La hora estimada de LLEGADA no tiene ventana: un despacho de noche llega de madrugada
// o esa misma noche. Solo se le exige ser posterior a la salida cuando es el mismo día
// (ver salidaValidation.js).
export const RANGO_LLEGADA = { min: '00:00', max: '23:59' }

export const MIN_DIAS_SALIDA_LLEGADA = 0

// Margen mínimo entre el final de una ruta y el inicio de la siguiente, para el mismo
// vehículo/conductor — cubre descargar, revisar el vehículo y que el conductor
// descanse antes de volver a salir. Concepto distinto de MIN_DIAS_SALIDA_LLEGADA (ese
// es sobre la duración mínima de UNA sola ruta, este es sobre el espacio entre dos
// rutas distintas). Debe coincidir con DIAS_MARGEN_ENTRE_RUTAS del backend.
export const DIAS_MARGEN_ENTRE_RUTAS = 1

// Horizonte máximo de programación: rutas son recorridos regionales cortos, no tiene
// sentido dejar programar una salida o llegada con meses/años de anticipación.
export const MAX_DIAS_ANTICIPACION = 90

// "fecha" es un DATEONLY ("YYYY-MM-DD") — construir por componentes locales evita el bug
// de zona horaria ya documentado en el proyecto (new Date(iso) interpreta UTC medianoche).
const parseFechaLocal = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export const getRangoSalida = (iso) => (iso ? HORARIO_SALIDA[parseFechaLocal(iso).getDay()] || null : null)

// Rango de la hora de llegada de una fecha: sin ventana, salvo que aún no hay fecha.
export const getRangoLlegada = (iso) => (iso ? RANGO_LLEGADA : null)

export const esDomingo = (iso) => !!iso && parseFechaLocal(iso).getDay() === 0

// ¿La hora de salida cae en la ventana nocturna del día? (sin fecha u hora no hay nada
// que validar; en domingo nunca — no hay ventana)
export const horaSalidaValida = (iso, horaStr) => {
    if (!iso || !horaStr) return true
    const rango = getRangoSalida(iso)
    if (!rango) return false
    const hora = horaStr.slice(0, 5)
    return hora >= rango.min && hora <= rango.max
}

const pad2 = (n) => String(n).padStart(2, '0')

export const sumarDias = (iso, dias) => {
    const d = parseFechaLocal(iso)
    d.setDate(d.getDate() + dias)
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// Primer día hábil (no domingo) a partir de `iso` (inclusive) -- usado para
// proponer fecha de salida/llegada por defecto sin caer en un domingo, que la
// empresa no opera (ver validarCampo 'fechaSalida'/'fechaLlegadaEstimada').
export const siguienteDiaHabil = (iso) => (esDomingo(iso) ? sumarDias(iso, 1) : iso)

export const hoyISO = () => {
    const d = new Date()
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// Hora actual como "HH:MM" (24h, con cero a la izquierda) — para validar en vivo que
// una hora de salida elegida para HOY no haya quedado ya en el pasado.
export const ahoraHHMM = () => {
    const d = new Date()
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// Lista de horas "sugeridas" dentro de un rango {min,max} (ambos "HH:MM"), cada
// "pasoMinutos" minutos, incluyendo los dos extremos — para el menú rápido de
// SelectorHora (clic en el ícono del reloj). Es solo un atajo de selección: el campo
// de texto sigue aceptando cualquier minuto exacto, esta lista no lo restringe.
export const generarSlotsHorario = (rango, pasoMinutos = 30) => {
    if (!rango) return []
    const slots = []
    let [h, m] = rango.min.split(':').map(Number)
    const [hMax, mMax] = rango.max.split(':').map(Number)
    while (h < hMax || (h === hMax && m <= mMax)) {
        slots.push(`${pad2(h)}:${pad2(m)}`)
        m += pasoMinutos
        if (m >= 60) { m -= 60; h += 1 }
    }
    return slots
}
