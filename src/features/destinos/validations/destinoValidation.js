import { hayDocumentoDuplicado } from '../../../shared/utils/duplicados.js'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { validarDireccion } from '../../../shared/validations/direccionValidation.js'

export const steps = ['Ubicación', 'Tarifa', 'Confirmación']

export const TARIFA_MAX = 9999999
export const MENSAJE_MUNICIPIO_DUPLICADO = 'Ya existe un destino registrado con este municipio.'

// Departamento/Municipio ahora se eligen de dos Autocomplete controlados (no freeSolo)
// alimentados por colombiaService.js (API-Colombia) — PasoUbicacion.jsx ya no deja
// escribir nada fuera de esas listas. Este regex se queda como defensa en el submit
// (y su espejo en el backend, destinosValidator.js) por si el dato llega de otra
// forma. Incluye el punto porque "Bogotá D.C." es el único municipio real de los
// ~1100 que trae la API que no es solo letras/espacios/tildes.
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.]+$/
const DIRECCION_MAX_LENGTH = 200

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error).
export const validarCampo = (name, form) => {
    switch (name) {
        case 'departamento':
            if (!form.departamento?.trim()) return 'El departamento es obligatorio'
            if (esSoloRelleno(form.departamento)) return 'El departamento no puede contener solo espacios o guiones'
            if (!SOLO_LETRAS_REGEX.test(form.departamento)) return 'El departamento solo puede contener letras'
            return ''
        case 'municipio':
            if (!form.municipio?.trim()) return 'El municipio es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.municipio)) return 'El municipio solo puede contener letras'
            return ''
        case 'direccion':
            if (form.direccion && form.direccion.length > DIRECCION_MAX_LENGTH) return `La dirección no puede superar los ${DIRECCION_MAX_LENGTH} caracteres`
            return validarDireccion(form.direccion)
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
// de sí mismo si no cambió de municipio).
export const validarMunicipioDuplicado = (destinos, municipio, excludeId) =>
    hayDocumentoDuplicado(destinos, municipio, {
        getDoc: d => d.municipio,
        ...(excludeId !== undefined ? { excludeId, getId: d => d.idDestino } : {}),
    }) ? MENSAJE_MUNICIPIO_DUPLICADO : ''

export const validarPaso = (step, form, destinos, excludeId) => {
    const e = {}
    if (step === 0) {
        e.departamento = validarCampo('departamento', form)
        e.municipio = validarCampo('municipio', form) || validarMunicipioDuplicado(destinos, form.municipio, excludeId)
        e.direccion = validarCampo('direccion', form)
    }
    if (step === 1) {
        e.tarifaBase = validarCampo('tarifaBase', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
