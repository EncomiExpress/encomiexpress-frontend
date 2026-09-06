import { hayDocumentoDuplicado, getValoresUnicos } from '../../../shared/utils/duplicados.js'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { validarDireccion } from '../../../shared/validations/direccionValidation.js'

export const steps = ['Ubicación', 'Tarifa', 'Confirmación']

export const TARIFA_MAX = 9999999
export const MENSAJE_MUNICIPIO_DUPLICADO = 'Ya existe un destino registrado con este municipio.'

// Sugerencias del campo Departamento (Autocomplete freeSolo): no hay tabla de
// departamentos aparte, es solo el texto que cada destino ya guarda en su propia fila.
// Se recalcula de los destinos en memoria — sin persistencia extra, sin restricción de
// cantidad (a diferencia de Municipio, el departamento SÍ puede repetirse entre destinos,
// por eso no hace falta filtrar los ya usados ni validar duplicado acá).
export const getOpcionesDepartamento = (destinos) => getValoresUnicos(destinos, d => d.departamento)

// Mismo alfabeto que ya filtra RegistrarDestino.jsx/ActualizarDestino.jsx en vivo para
// municipio/departamento (incluye ü/Ü, ej: "Güicán") — el validador replica esa misma regla.
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
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
