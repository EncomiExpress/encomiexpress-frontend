import { hayDocumentoDuplicado } from '../../../shared/utils/duplicados.js'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'

export const steps = ['Ubicación', 'Tarifa', 'Confirmación']

export const departamentos = ['Antioquia', 'Córdoba']
export const TARIFA_MAX = 999999999
export const MENSAJE_CIUDAD_DUPLICADA = 'Ya existe un destino registrado con esta ciudad.'

// Ciudades donde la empresa ya opera hoy (Bajo Cauca antioqueño + sur de Córdoba) —
// no es la lista oficial de municipios de cada departamento (esa tiene 123 y 30
// entradas respectivamente), es la lista real de destinos de la empresa, para que el
// caso común quede sin errores de tipeo. "Otra ciudad" cubre cualquier destino nuevo
// que no esté en esta lista todavía.
export const CIUDADES_POR_DEPARTAMENTO = {
    Antioquia: ['Cáceres', 'Caucasia', 'El Bagre', 'Nechí', 'Puerto Valdivia', 'Tarazá', 'Zaragoza'],
    'Córdoba': ['Ayapel', 'Montelíbano', 'Montería', 'Puerto Libertador'],
}
export const OTRA_CIUDAD = '__otra__'
export const OTRO_DEPARTAMENTO = '__otro__'

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error).
export const validarCampo = (name, form) => {
    switch (name) {
        case 'departamento':
            return form.departamento ? '' : 'Selecciona un departamento'
        case 'ciudad':
            return form.ciudad?.trim() ? '' : 'La ciudad es obligatoria'
        case 'direccion':
            if (form.direccion && esSoloRelleno(form.direccion)) return 'La dirección no puede contener solo espacios o guiones'
            return ''
        case 'tarifaBase':
            if (form.tarifaBase === '' || form.tarifaBase === undefined) return 'La tarifa base es obligatoria'
            if (isNaN(Number(form.tarifaBase)) || Number(form.tarifaBase) < 0) return 'La tarifa base debe ser un número positivo'
            if (Number(form.tarifaBase) > TARIFA_MAX) return `La tarifa base no puede ser mayor a $${TARIFA_MAX.toLocaleString('es-CO')}`
            return ''
        default:
            return ''
    }
}

// Mismo criterio de comparación (sin mayúsculas/acentos) que ya usan Cliente/Conductor/
// etc. para nombre y documento duplicado — acá no hace falta consultar al backend
// porque el contexto ya trae todos los destinos cargados en memoria.
// excludeId: solo Actualizar lo pasa (para no marcar el propio destino como duplicado
// de sí mismo si no cambió de ciudad).
export const validarCiudadDuplicada = (destinos, ciudad, excludeId) =>
    hayDocumentoDuplicado(destinos, ciudad, {
        getDoc: d => d.ciudad,
        ...(excludeId !== undefined ? { excludeId, getId: d => d.idDestino } : {}),
    }) ? MENSAJE_CIUDAD_DUPLICADA : ''

export const validarPaso = (step, form, destinos, excludeId) => {
    const e = {}
    if (step === 0) {
        e.departamento = validarCampo('departamento', form)
        e.ciudad = validarCampo('ciudad', form) || validarCiudadDuplicada(destinos, form.ciudad, excludeId)
        e.direccion = validarCampo('direccion', form)
    }
    if (step === 1) {
        e.tarifaBase = validarCampo('tarifaBase', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
