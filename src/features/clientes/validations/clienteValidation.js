import { maxLengthDocumento, docHelperText as docHelperTextBase, validarNumeroDocumento } from '../../../shared/utils/documento.js'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { EMAIL_REGEX } from '../../../shared/validations/emailValidation.js'

export const steps = ['Datos Personales', 'Contacto', 'Confirmación']

const EMAIL_MAX_LENGTH = 100
export const validarEmail = (email) => {
    const valor = (email || '').trim()
    if (!valor) return 'El correo es obligatorio'
    if (!valor.includes('@')) return 'El correo debe contener un @ (ej: usuario@dominio.com)'
    if (!valor.split('@')[1]?.includes('.')) return 'El dominio del correo debe contener un punto (ej: usuario@dominio.com)'
    if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
    if (valor.length > EMAIL_MAX_LENGTH) return `El correo no puede superar los ${EMAIL_MAX_LENGTH} caracteres`
    return ''
}

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo
// mientras se corrige un campo ya marcado con error). numeroIdentificacion no vive
// aquí porque ya tiene su propia validación (validarDocumentoCompleto, más abajo).
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
const DIRECCION_MAX_LENGTH = 200
export const validarCampo = (name, form) => {
    const esNIT = form.tipoIdentificacion === 'NIT'
    switch (name) {
        case 'tipoIdentificacion':
            return form.tipoIdentificacion ? '' : 'Selecciona un tipo de documento'
        case 'nombre':
            if (!form.nombre.trim()) return esNIT ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
            if (esNIT && esSoloRelleno(form.nombre)) return 'La razón social no puede contener solo espacios o guiones'
            if (!esNIT && !SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (esNIT) return ''
            if (!form.apellido.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefono)) return 'El teléfono debe tener exactamente 10 dígitos'
            return ''
        case 'email':
            return validarEmail(form.email)
        case 'direccion':
            if (!form.direccion.trim()) return 'La dirección es obligatoria'
            if (esSoloRelleno(form.direccion)) return 'La dirección no puede contener solo espacios o guiones'
            if (form.direccion.length > DIRECCION_MAX_LENGTH) return `La dirección no puede superar los ${DIRECCION_MAX_LENGTH} caracteres`
            return ''
        default:
            return ''
    }
}

export const getMaxLengthDoc = (tipoIdentificacion) => {
    if (tipoIdentificacion === 'NIT') return 15
    return maxLengthDocumento(tipoIdentificacion)
}

export const docHelperText = (tipoIdentificacion) => {
    if (tipoIdentificacion === 'NIT') return 'Números con guión, hasta 15 caracteres'
    return docHelperTextBase(tipoIdentificacion) || ''
}

// NIT tiene su propio formato (dígitos + guión, hasta 15) — no encaja en las
// reglas genéricas de documento.js, así que se valida aparte aquí.
export const validarDocumentoCompleto = (tipo, valor) => {
    const limpio = (valor || '').trim()
    if (!limpio) return 'El número de documento es obligatorio'
    if (tipo === 'NIT') {
        if (!/^[0-9-]+$/.test(limpio)) return 'Solo se permiten números y guión'
        if (!/\d/.test(limpio)) return 'Debe contener al menos un número'
        if (limpio.length > 15) return 'Máximo 15 caracteres'
        return null
    }
    return validarNumeroDocumento(tipo, limpio)
}

export const validarPaso = (step, form, { avisoDocDuplicado, avisoNombreDuplicado }) => {
    const e = {}

    if (step === 0) {
        e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)
        const errorDocumento = validarDocumentoCompleto(form.tipoIdentificacion, form.numeroIdentificacion)
        e.numeroIdentificacion = errorDocumento || avisoDocDuplicado
        e.nombre = validarCampo('nombre', form) || avisoNombreDuplicado
        e.apellido = validarCampo('apellido', form) || avisoNombreDuplicado
    }

    if (step === 1) {
        e.telefono = validarCampo('telefono', form)
        e.email = validarCampo('email', form)
        e.direccion = validarCampo('direccion', form)
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
