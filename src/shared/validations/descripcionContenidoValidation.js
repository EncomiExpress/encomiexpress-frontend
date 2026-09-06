// Reglas del campo "Descripción del contenido" de un paquete (wizard de Ventas). Más
// restrictivo que Observaciones (que deja escribir cualquier cosa): una descripción de
// mercancía real no necesita símbolos abstractos ni de programación. El backend replica
// esto con `validarDescripcionContenidoFormato` en `commonRules.js`.
//
// Permitido: letras (con tildes/ñ/ü), números, espacios y  * , . - /
//   ("Zapatos x3", "Repuestos * 5", "Motor 2.0", "Ropa de hombre/mujer", "Baterías - Tipo A")
// Prohibido: _ + = ^ $ % & @ ~ | ¡ ! ¿ ? " '  y demás. No puede empezar con espacio ni
// con un símbolo — el primer carácter debe ser letra o número.

export const DESCRIPCION_CONTENIDO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,*/-]+$/
const DESCRIPCION_INICIO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]/

// Filtra en vivo lo no permitido (handleChange) y quita cualquier espacio inicial.
export const filtrarDescripcionContenido = (value) =>
    (value || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,*/-]/g, '').replace(/^\s+/, '')

// Valida el formato de una descripción ya no vacía. Devuelve el mensaje de error o ''.
export const validarDescripcionContenido = (valor) => {
    if (valor && /^\s/.test(valor)) return 'La descripción no puede empezar con un espacio'
    const v = (valor || '').trim()
    if (!v) return ''
    if (!DESCRIPCION_INICIO_REGEX.test(v)) return 'La descripción debe empezar con una letra o un número'
    if (!DESCRIPCION_CONTENIDO_REGEX.test(v)) return 'La descripción solo admite letras, números, espacios y los signos . , - / *'
    return ''
}
