// Reglas del campo "Observaciones" de una Ruta. Es flexible (mezcla direcciones,
// teléfonos, montos), pero no tanto como las observaciones de una Venta (que no filtran
// nada): acá se bloquean los símbolos técnicos o de código que no aportan nada.
// El backend replica esto con `validarObservacionesRutaFormato` en `commonRules.js`.
//
// Permitido: letras (tildes/ñ/ü), números, espacios y  #  -  /  .  ,  :  ;  (  )  $
//   ("Cobro $50.000 en destino", "Tel 300-555-1122", "Bodega #4 / rampa 2")
// Prohibido: ^ + = _ ~ | < >  y cualquier otro símbolo.

export const OBSERVACIONES_RUTA_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s#/.,:;()$-]+$/

// Filtra en vivo lo no permitido (handleChange) y quita cualquier espacio inicial.
export const filtrarObservacionesRuta = (value) =>
    (value || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s#/.,:;()$-]/g, '').replace(/^\s+/, '')

// Valida el formato. Devuelve el mensaje de error o '' (el campo es opcional; la
// obligatoriedad no aplica, y el "solo espacios/guiones" lo cubre esSoloRelleno aparte).
export const validarObservacionesRuta = (valor) => {
    const v = String(valor || '')
    if (!v.trim()) return ''
    if (!OBSERVACIONES_RUTA_REGEX.test(v)) return 'Las observaciones tienen caracteres no permitidos (evita ^ + = _ ~ | < >)'
    return ''
}
