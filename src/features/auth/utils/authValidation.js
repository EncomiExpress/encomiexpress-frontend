// Debe coincidir con el validador del backend y con las copias independientes de esta
// misma regla en shared/layouts/Header.jsx, usuarios/utils/usuarioValidation.js y
// conductores/utils/conductorValidation.js (cada una valida su propio formulario de
// contraseña; no importan este archivo entre sí).
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validarEmailValor = (valor) => {
    if (!valor.trim()) return 'El correo es obligatorio'
    if (!EMAIL_REGEX.test(valor.trim())) return 'El correo debe tener un @ y un dominio válido (ejemplo@dominio.com)'
    return ''
}

// passwordHelp: cada pantalla mantiene su propio texto de ayuda (mismo requisito, texto
// distinto) -- ver Login.jsx y ResetearPassword.jsx.
export const validarPasswordValor = (valor, passwordHelp) => {
    if (!valor) return 'La contraseña es obligatoria'
    if (!PASSWORD_REGEX.test(valor)) return passwordHelp
    return ''
}
