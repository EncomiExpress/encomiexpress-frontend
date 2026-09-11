import { maxLengthDocumento, docHelperText as docHelperTextBase, validarNumeroDocumento, formatearNit, NIT_MAX_LENGTH, validarNitConDv } from '../../../shared/utils/documento.js'
import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { EMAIL_REGEX, validarUsuarioCorreo } from '../../../shared/validations/emailValidation.js'
import { validarTelefono } from '../../../shared/validations/telefonoValidation.js'

export const steps = ['Datos Personales', 'Contacto y Flota', 'Confirmación']

export const validarEmail = (email) => {
    const valor = (email || '').trim()
    if (!valor) return 'El correo es obligatorio'
    if (!valor.includes('@')) return 'El correo debe contener un @ (ej: usuario@dominio.com)'
    const errorUsuario = validarUsuarioCorreo(valor)
    if (errorUsuario) return errorUsuario
    if (!valor.split('@')[1]?.includes('.')) return 'El dominio del correo debe contener un punto (ej: usuario@dominio.com)'
    if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
    return ''
}

const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
// Sin TI/RC (menores de edad) -- ver LOGICA.md ("Tipos de documento por módulo").
export const TIPOS_DOC_PERMITIDOS = ['CC', 'NIT', 'CE', 'PAS']

export const validarCampo = (name, form) => {
    const esNIT = form.tipoIdentificacion === 'NIT'
    switch (name) {
        case 'tipoIdentificacion':
            if (!form.tipoIdentificacion) return 'Selecciona un tipo de documento'
            if (!TIPOS_DOC_PERMITIDOS.includes(form.tipoIdentificacion)) return 'Tipo de documento no permitido para este módulo'
            return ''
        case 'nombre':
            if (!form.nombre.trim()) return esNIT ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
            if (esNIT && esSoloRelleno(form.nombre)) return 'La razón social no puede contener solo espacios o guiones'
            if (!esNIT && !SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (esNIT) return ''
            if (!form.apellido?.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'telefono':
            return validarTelefono(form.telefono, form.tipoIdentificacion)
        case 'email':
            return validarEmail(form.email)
        default:
            return ''
    }
}

// NIT: máscara y validación estricta viven en shared/utils/documento.js (las comparte
// con Cliente). Se re-exporta formatearNit porque los componentes del wizard lo importan
// desde este archivo.
export { formatearNit }

export const getMaxLengthDoc = (tipoIdentificacion) => {
    if (tipoIdentificacion === 'NIT') return NIT_MAX_LENGTH
    return maxLengthDocumento(tipoIdentificacion)
}

export const docHelperText = (tipoIdentificacion) => {
    if (tipoIdentificacion === 'NIT') return 'Escribe solo números: los 9 dígitos y luego el de verificación. El guion se pone solo.'
    return docHelperTextBase(tipoIdentificacion) || ''
}

export const validarDocumentoCompleto = (tipo, valor) => {
    if (tipo === 'NIT') return validarNitConDv(valor)
    const limpio = (valor || '').trim()
    if (!limpio) return 'El número de documento es obligatorio'
    return validarNumeroDocumento(tipo, limpio)
}

export const getTipoLabel = (tipo) => {
    const tipos = { CC: 'Cédula', NIT: 'NIT', CE: 'Cédula Extranjería', PAS: 'Pasaporte' }
    return tipos[tipo] || tipo
}

export const EMPTY_FORM = {
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    tipoFlota: '',
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
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
