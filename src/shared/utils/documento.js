// Reglas de número de documento por tipo, según la cédula colombiana. TI y RC (Tarjeta
// de Identidad / Registro Civil, documentos de menores de edad) no se incluyen: ningún
// módulo del sistema los deja elegir -- ver LOGICA.md ("Tipos de documento por
// módulo") -- así que mantenerlos acá sería código muerto sin ninguna función.
// - CC (Cédula de Ciudadanía): mínimo 7 dígitos (cédulas antiguas de hombres mayores),
//   máximo 10 (NUIP actual).
// - CE: alfanumérico, sin un mínimo estricto, hasta 12 caracteres.
// - Pasaporte: alfanumérico, hasta 20 caracteres — los pasaportes extranjeros mezclan
//   letras y números con formatos que varían mucho según el país emisor.
// - PPT (Permiso por Protección Temporal, migrantes venezolanos): estrictamente
//   numérico, de 6 a 10 dígitos (correlativo asignado por Migración Colombia).
export const REGLAS_DOCUMENTO = {
    CC: { min: 7, max: 10 },
    CE: { min: 1, max: 12, alfanumerico: true },
    PAS: { min: 1, max: 20, alfanumerico: true },
    PPT: { min: 6, max: 10 },
}

// NIT (persona jurídica) no entra en REGLAS_DOCUMENTO: su formato no es "numérico" ni
// "alfanumérico" simple. En Colombia es 9 dígitos de raíz + 1 dígito de verificación
// (DV) separados por guion (ej. 123456789-0). El usuario solo teclea números y el
// formulario inserta el guion tras el 9º dígito. Lo usan Propietario y Cliente; el
// backend lo replica con commonRules.validarNitEstricto.
export const NIT_MAX_LENGTH = 11 // 9 dígitos + guion + dígito de verificación

// Normaliza a "NNNNNNNNN-D". Idempotente: acepta un valor que ya trae guion, puntos o
// espacios (los quita y reubica el guion). Corta a 10 dígitos.
export const formatearNit = (valor) => {
    const digitos = String(valor || '').replace(/\D/g, '').slice(0, 10)
    return digitos.length > 9 ? `${digitos.slice(0, 9)}-${digitos.slice(9)}` : digitos
}

// Mensaje de error (string) o null. Exige exactamente 9 dígitos + guion + 1 dígito.
// No verifica el DV con módulo 11 (evita rechazar NITs viejos mal cargados en BD).
export const validarNitConDv = (valor) => {
    const limpio = (valor || '').trim()
    if (!limpio) return 'El número de documento es obligatorio'
    if (!/^\d{9}-\d$/.test(limpio)) return 'El NIT debe tener 9 dígitos y el dígito de verificación (ej: 123456789-0)'
    return null
}

export const esDocAlfanumerico = (tipo) => !!REGLAS_DOCUMENTO[tipo]?.alfanumerico

export const maxLengthDocumento = (tipo) => REGLAS_DOCUMENTO[tipo]?.max ?? 12

export const docHelperText = (tipo) => {
    const regla = REGLAS_DOCUMENTO[tipo]
    if (!regla) return 'Sin puntos ni comas'
    if (regla.alfanumerico) return `Letras y números, hasta ${regla.max} caracteres`
    if (regla.min === regla.max) return `Solo dígitos, debe tener ${regla.min} dígitos`
    return `Solo dígitos, entre ${regla.min} y ${regla.max}`
}

// Devuelve el mensaje de error (string) o null si el valor es válido para ese tipo.
export const validarNumeroDocumento = (tipo, numero) => {
    const valor = (numero || '').trim()
    if (!valor) return 'El número de documento es obligatorio'

    const regla = REGLAS_DOCUMENTO[tipo]
    if (!regla) return null

    if (regla.alfanumerico) {
        if (!/^[a-zA-Z0-9]+$/.test(valor)) return 'Solo letras y números, sin caracteres especiales'
    } else if (!/^\d+$/.test(valor)) {
        return 'Solo se permiten dígitos'
    }

    if (valor.length < regla.min || valor.length > regla.max) {
        const unidad = regla.alfanumerico ? 'caracteres' : 'dígitos'
        return regla.min === regla.max
            ? `Debe tener exactamente ${regla.min} ${unidad}`
            : `Debe tener entre ${regla.min} y ${regla.max} ${unidad}`
    }

    return null
}
