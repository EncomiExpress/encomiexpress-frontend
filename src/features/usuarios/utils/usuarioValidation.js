import { validarNumeroDocumento } from '../../../shared/utils/documento.js'

export const steps = ['Datos Personales', 'Contacto y Credenciales', 'Confirmación']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const validarEmail = (email) => {
    const valor = (email || '').trim()
    if (!valor) return 'El correo es obligatorio'
    if (!valor.includes('@')) return 'El correo debe contener un @ (ej: usuario@dominio.com)'
    if (!valor.split('@')[1]?.includes('.')) return 'El dominio del correo debe contener un punto (ej: usuario@dominio.com)'
    if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
    return ''
}

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
export const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/

// requerirPassword: Registrar exige contraseña y confirmación; Actualizar las deja
// opcionales (password vacío = "no cambiar la actual").
export const validarCampo = (name, form, { requerirPassword = false } = {}) => {
    switch (name) {
        case 'nombre':
            if (!form.nombre.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (!form.apellido.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'tipoIdentificacion':
            return form.tipoIdentificacion ? '' : 'Selecciona un tipo de documento'
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefono)) return 'El teléfono debe tener exactamente 10 dígitos'
            return ''
        case 'email':
            return validarEmail(form.email)
        case 'idRol':
            return form.idRol ? '' : 'Selecciona un rol'
        case 'password':
            if (requerirPassword) {
                if (!form.password) return 'La contraseña es obligatoria'
                if (!PASSWORD_REGEX.test(form.password)) return PASSWORD_HELP
                return ''
            }
            if (form.password && !PASSWORD_REGEX.test(form.password)) return PASSWORD_HELP
            return ''
        case 'confirmarPassword':
            if (requerirPassword) {
                if (!form.confirmarPassword) return 'Confirma la contraseña'
                if (form.password !== form.confirmarPassword) return 'Las contraseñas no coinciden'
                return ''
            }
            if (form.password && form.password !== form.confirmarPassword) return 'Las contraseñas no coinciden'
            return ''
        default:
            return ''
    }
}

export const validarPaso = (step, form, avisos, { requerirPassword = false } = {}) => {
    const { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado } = avisos
    const e = {}

    if (step === 0) {
        e.nombre = validarCampo('nombre', form) || avisoNombreDuplicado
        e.apellido = validarCampo('apellido', form) || avisoNombreDuplicado
        e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)
        const errorDocumento = validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion)
        e.numeroIdentificacion = errorDocumento || avisoDocDuplicado
    }

    if (step === 1) {
        e.telefono = validarCampo('telefono', form)
        e.email = validarCampo('email', form) || avisoEmailDuplicado
        e.idRol = validarCampo('idRol', form)
        e.password = validarCampo('password', form, { requerirPassword })
        e.confirmarPassword = validarCampo('confirmarPassword', form, { requerirPassword })
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
