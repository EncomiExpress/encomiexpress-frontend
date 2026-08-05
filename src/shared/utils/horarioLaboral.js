// Horario laboral de la empresa. Índice = Date.prototype.getDay() (0 = domingo).
// DEBE coincidir con encomiexpress-backend/src/utils/horarioLaboral.js
export const HORARIO_LABORAL = {
    0: null,
    1: { min: '07:00', max: '19:00' },
    2: { min: '07:00', max: '19:00' },
    3: { min: '07:00', max: '19:00' },
    4: { min: '07:00', max: '19:00' },
    5: { min: '07:00', max: '19:00' },
    6: { min: '08:00', max: '15:00' },
}

export const MIN_DIAS_SALIDA_LLEGADA = 2

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

export const getRangoHorario = (iso) => (iso ? HORARIO_LABORAL[parseFechaLocal(iso).getDay()] || null : null)

export const esDomingo = (iso) => !!iso && parseFechaLocal(iso).getDay() === 0

export const horaDentroDeRango = (iso, horaStr) => {
    if (!iso || !horaStr) return true
    const rango = getRangoHorario(iso)
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

export const hoyISO = () => {
    const d = new Date()
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
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
