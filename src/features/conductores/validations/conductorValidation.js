import { hoyISO } from '../../../shared/utils/horarioLaboral.js'
import { validarNumeroDocumento } from '../../../shared/utils/documento.js'
import { EMAIL_REGEX, validarUsuarioCorreo } from '../../../shared/validations/emailValidation.js'
import { PASSWORD_REGEX } from '../../../shared/validations/passwordValidation.js'

export const steps = ['Datos Personales', 'Contacto y Credenciales', 'Licencia', 'Confirmación']

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

export const PASSWORD_HELP = '8-64 caracteres, con mayúsculas, minúsculas, números y un carácter especial'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
// Manejar carga de servicio público exige mayoría de edad y licencia pública
// colombiana vigente (RUNT) -- TI/RC quedan fuera. PPT sí: desde 2023 el Ministerio
// de Transporte permite a un venezolano con PPT tramitar/convalidar licencia de
// servicio público (C2/C3) en el RUNT. Ver LOGICA.md.
const TIPOS_DOC_PERMITIDOS = ['CC', 'CE', 'PPT']

// requerirPassword: Registrar exige contraseña y confirmación; Actualizar las deja
// opcionales (password vacío = "no cambiar la actual").
export const validarCampo = (name, form, { requerirPassword = false } = {}) => {
    switch (name) {
        case 'tipoIdentificacion':
            if (!form.tipoIdentificacion) return 'Selecciona un tipo de documento'
            if (!TIPOS_DOC_PERMITIDOS.includes(form.tipoIdentificacion)) return 'Tipo de documento no permitido para este módulo'
            return ''
        case 'nombre':
            if (!form.nombre.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombre)) return 'El nombre solo puede contener letras'
            return ''
        case 'apellido':
            if (!form.apellido?.trim()) return 'El apellido es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.apellido)) return 'El apellido solo puede contener letras'
            return ''
        case 'telefono':
            if (!form.telefono.trim()) return 'El teléfono es obligatorio'
            if (!/^3\d{9}$/.test(form.telefono)) return 'El teléfono debe tener 10 dígitos y empezar por 3'
            return ''
        case 'email':
            return validarEmail(form.email)
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
        // numeroLicencia no se valida: es de solo lectura y siempre igual al número de
        // documento (Ley 769 de 2002 — ver CLAUDE.md de este repo).
        default:
            return ''
    }
}

// checkVencidas: solo RegistrarConductor.jsx valida que el vencimiento no sea una
// fecha pasada; ActualizarConductor.jsx no lo hace (así era el comportamiento original).
export const validarCategorias = (categoriasLicencia, { checkVencidas = false } = {}) => {
    const completas = categoriasLicencia.filter(c => c.categoria && c.vencimiento)
    const incompletas = categoriasLicencia.some(c => (c.categoria && !c.vencimiento) || (!c.categoria && c.vencimiento))
    if (completas.length === 0) return 'Agrega al menos una categoría con su fecha de vencimiento'
    if (incompletas) return 'Completa la categoría y la fecha en cada fila, o quita la fila'
    if (checkVencidas && completas.some(c => c.vencimiento < hoyISO())) return 'El vencimiento no puede ser una fecha anterior a hoy'
    return ''
}

export const CATEGORIAS_LICENCIA = [
    { value: 'A1', label: 'A1 - Motocicleta hasta 125 c.c.' },
    { value: 'A2', label: 'A2 - Motocicleta de más de 125 c.c.' },
    { value: 'B1', label: 'B1 - Automóvil, camioneta o microbús (particular)' },
    { value: 'B2', label: 'B2 - Camión rígido, buseta o bus (particular)' },
    { value: 'B3', label: 'B3 - Vehículo articulado (particular)' },
    { value: 'C1', label: 'C1 - Automóvil, camioneta o microbús (servicio público)' },
    { value: 'C2', label: 'C2 - Camión rígido, buseta o bus (servicio público)' },
    { value: 'C3', label: 'C3 - Vehículo articulado (servicio público)' },
]

export const getTipoLabel = (tipo) => {
    const tipos = { 'CC': 'Cédula', 'CE': 'Cédula Extranjería', 'PPT': 'PPT' }
    return tipos[tipo] || tipo
}

export const getLicenciaLabel = (lic) => CATEGORIAS_LICENCIA.find(c => c.value === lic)?.label || lic || '—'

export const formInicialConductor = () => ({
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    categoriasLicencia: [{ categoria: '', vencimiento: '' }],
    numeroLicencia: '',
})

export const validarPaso = (step, form, avisos, { requerirPassword = false, checkVencidas = false } = {}) => {
    const { avisoDocDuplicado, avisoNombreDuplicado, avisoEmailDuplicado } = avisos
    const e = {}

    if (step === 0) {
        e.tipoIdentificacion = validarCampo('tipoIdentificacion', form)
        const errorDocumento = validarNumeroDocumento(form.tipoIdentificacion, form.numeroIdentificacion)
        e.numeroIdentificacion = errorDocumento || avisoDocDuplicado
        e.nombre = validarCampo('nombre', form) || avisoNombreDuplicado
        e.apellido = validarCampo('apellido', form) || avisoNombreDuplicado
    }

    if (step === 1) {
        e.telefono = validarCampo('telefono', form)
        e.email = validarCampo('email', form) || avisoEmailDuplicado
        e.password = validarCampo('password', form, { requerirPassword })
        e.confirmarPassword = validarCampo('confirmarPassword', form, { requerirPassword })
    }

    if (step === 2) {
        const errorCategorias = validarCategorias(form.categoriasLicencia, { checkVencidas })
        if (errorCategorias) e.categoriasLicencia = errorCategorias
    }

    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
