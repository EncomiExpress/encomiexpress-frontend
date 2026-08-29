import { EMAIL_REGEX } from '../../../shared/validations/emailValidation.js'
import { PASSWORD_REGEX } from '../../../shared/validations/passwordValidation.js'

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

// Regla de confirmación de contraseña reutilizada por ResetearPassword.jsx -- mismo
// criterio que ya usan conductorValidation.js/usuarioValidation.js para su propio campo
// confirmarPassword.
export const validarConfirmarPasswordValor = (password, confirmarPassword) => {
    if (!confirmarPassword) return 'Confirma la contraseña'
    if (password !== confirmarPassword) return 'Las contraseñas no coinciden'
    return ''
}
