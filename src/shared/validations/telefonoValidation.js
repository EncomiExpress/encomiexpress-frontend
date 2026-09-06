// Validación de teléfono por tipo de documento del titular.
//
// - **CC y NIT** → celular colombiano: 10 dígitos, empieza por 3. Una persona natural
//   colombiana y una empresa registrada en Colombia (NIT) tienen línea local.
// - **CE, Pasaporte, PPT** → teléfono internacional: un '+' opcional y de 7 a 15
//   dígitos (rango E.164). Extranjeros residentes o de paso (CE/PAS) y migrantes
//   venezolanos regularizados (PPT) suelen conservar la línea de su país de origen o
//   una de WhatsApp del exterior para recibir notificaciones. Este formato también
//   acepta un celular colombiano de 10 dígitos, así que es un superconjunto del caso
//   nacional (nadie con línea local queda bloqueado).
//
// NOTA: Conductor y Usuario NO usan este helper — su teléfono es siempre colombiano
// (validan con su propio `^3\d{9}$` en conductorValidation.js/usuarioValidation.js).
//
// Réplica en el backend: commonRules.validarTelefonoPorTipo / TELEFONO_INTL_REGEX.

export const TELEFONO_CO_REGEX = /^3\d{9}$/
export const TELEFONO_INTL_REGEX = /^\+?\d{7,15}$/

// Tipos de documento cuyo titular puede tener un teléfono del exterior. CC y NIT
// quedan obligados a celular colombiano.
const TIPOS_DOC_TELEFONO_INTL = ['CE', 'PAS', 'PPT']
export const permiteTelefonoInternacional = (tipoIdentificacion) => TIPOS_DOC_TELEFONO_INTL.includes(tipoIdentificacion)

// Filtro en vivo del input (handleChange). Internacional: deja un único '+' al inicio y
// dígitos. CC/NIT: solo dígitos.
export const filtrarTelefono = (valor, tipoIdentificacion) => {
    const s = String(valor ?? '')
    if (!permiteTelefonoInternacional(tipoIdentificacion)) return s.replace(/\D/g, '')
    const limpio = s.replace(/[^\d+]/g, '')
    const conMas = limpio.startsWith('+')
    return (conMas ? '+' : '') + limpio.replace(/\+/g, '')
}

// maxLength del campo según el tipo: '+' + 15 dígitos para internacional, 10 para CC/NIT.
export const maxLengthTelefono = (tipoIdentificacion) => (permiteTelefonoInternacional(tipoIdentificacion) ? 16 : 10)

// Texto de ayuda gris del campo según el tipo.
export const telefonoHelperText = (tipoIdentificacion) => (permiteTelefonoInternacional(tipoIdentificacion)
    ? 'Con prefijo de país si es del exterior (ej: +584121234567)'
    : 'Empieza por 3, 10 dígitos')

// Devuelve el mensaje de error o '' si el valor es válido. El teléfono es obligatorio.
export const validarTelefono = (valor, tipoIdentificacion) => {
    const v = String(valor ?? '').trim()
    if (!v) return 'El teléfono es obligatorio'
    if (permiteTelefonoInternacional(tipoIdentificacion)) {
        if (!TELEFONO_INTL_REGEX.test(v)) return 'Teléfono inválido. Si es del exterior, usa el prefijo de país (ej: +584121234567)'
        return ''
    }
    if (!TELEFONO_CO_REGEX.test(v)) return 'El teléfono debe tener 10 dígitos y empezar por 3'
    return ''
}
