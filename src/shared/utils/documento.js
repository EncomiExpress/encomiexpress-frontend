// Reglas de número de documento por tipo, según la cédula colombiana:
// - CC (Cédula de Ciudadanía): mínimo 6 dígitos (cédulas antiguas), máximo 10 (NUIP actual).
// - TI (Tarjeta de Identidad): siempre 10 dígitos (NUIP).
// - CE / Pasaporte: alfanumérico, sin un mínimo estricto, hasta 12 caracteres.
export const REGLAS_DOCUMENTO = {
    CC: { min: 6, max: 10 },
    TI: { min: 10, max: 10 },
    CE: { min: 1, max: 12, alfanumerico: true },
    PAS: { min: 1, max: 12, alfanumerico: true },
    // Registro Civil: sin un rango oficial documentado aparte, se deja igual que CC.
    RC: { min: 6, max: 10 },
}

// NIT (persona jurídica, solo Clientes) tiene su propio manejo especial en
// RegistrarCliente.jsx/ActualizarCliente.jsx (acepta dígitos y guión, hasta 15
// caracteres) porque su formato no encaja en "numérico" ni "alfanumérico" — no
// se valida con esta función.

export const esDocAlfanumerico = (tipo) => !!REGLAS_DOCUMENTO[tipo]?.alfanumerico

export const maxLengthDocumento = (tipo) => REGLAS_DOCUMENTO[tipo]?.max ?? 12

export const docHelperText = (tipo) => {
    const regla = REGLAS_DOCUMENTO[tipo]
    if (!regla) return 'Sin puntos ni comas'
    if (regla.alfanumerico) return `Alfanumérico, hasta ${regla.max} caracteres`
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
