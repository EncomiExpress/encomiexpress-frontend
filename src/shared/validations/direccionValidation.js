// Reglas compartidas para todos los campos de dirección del sistema (dirección del
// Cliente, dirección de la oficina de un Destino, dirección de entrega del destinatario
// de una Venta). El backend replica esto con `validarDireccionFormato` en
// `commonRules.js`.
//
// Nomenclatura de direcciones colombianas: "Cl. 10 # 5-12", "Calle 45 / Carrera 50",
// "Carrera 43A Sur, Apto. 302, Bloque 4".
//
// Permitido: letras (con tildes/ñ/ü), números, espacios y los signos  #  -  .  ,  /
// Prohibido: $ % & * = ¿ ? ¡ ! " '  y cualquier otro símbolo. Además no puede empezar
// con un espacio ni con un símbolo — el primer carácter debe ser letra o número.

export const DIRECCION_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s#.,/-]+$/
const DIRECCION_INICIO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ]/

// Filtra en vivo lo que no está permitido (para el handleChange del input). También
// quita cualquier espacio inicial, para que el campo nunca empiece con espacio.
export const filtrarDireccion = (value) =>
    (value || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s#.,/-]/g, '').replace(/^\s+/, '')

// Valida el formato de una dirección. Devuelve el mensaje de error o '' si es válida
// (o si está vacía — la obligatoriedad la maneja cada módulo: la dirección de un
// Destino es opcional, la del Cliente y la del destinatario de una Venta no).
export const validarDireccion = (valor) => {
    if (valor && /^\s/.test(valor)) return 'La dirección no puede empezar con un espacio'
    const v = (valor || '').trim()
    if (!v) return ''
    if (!DIRECCION_INICIO_REGEX.test(v)) return 'La dirección debe empezar con una letra o un número'
    if (!DIRECCION_REGEX.test(v)) return 'La dirección solo admite letras, números, espacios y los signos # - . , /'
    return ''
}
