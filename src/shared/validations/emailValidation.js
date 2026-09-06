// Regla de formato de correo compartida por clientes, conductores, propietarios,
// usuarios y auth — antes copiada de forma idéntica en cada uno de esos archivos
// de validación. Cada módulo mantiene su propia función validarEmail/validarEmailValor
// (los mensajes de error varían levemente entre módulos), pero todas usan este mismo
// regex como fuente única.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Reglas de la parte anterior al @ ("nombre de usuario" del correo), estilo Gmail:
// solo letras, números y puntos; el punto no puede ir al principio, al final, ni dos
// seguidos. Devuelve el mensaje de error o '' si es válida (o si está vacía — la
// obligatoriedad la maneja cada módulo con su propio mensaje). No valida el dominio.
// Se usa SOLO en los formularios de alta/edición (Cliente, Conductor, Propietario,
// Usuario, destinatario de Venta), no en Login ni Recuperar contraseña — ahí el correo
// pertenece a una cuenta que ya existe y podría no cumplir esta regla.
export const validarUsuarioCorreo = (email) => {
    const usuario = String(email || '').split('@')[0]
    if (!usuario) return ''
    if (usuario.startsWith('.') || usuario.endsWith('.')) return 'Antes del @, el punto no puede ir al principio ni al final'
    if (usuario.includes('..')) return 'Antes del @ no puede haber dos puntos seguidos'
    if (!/^[a-zA-Z0-9.]+$/.test(usuario)) return 'Antes del @ solo se permiten letras, números y puntos'
    return ''
}

// Filtro en vivo para el handleChange del campo de correo. Quita los caracteres no
// permitidos (solo letras, números, punto, @ y guion) e impide teclear DOS de las tres
// situaciones de punto inválidas: punto al principio de la parte anterior al @ y dos
// puntos seguidos (colapsa `..` → `.`).
//
// El punto JUSTO ANTES del @ (ej. "nombre.@dominio") NO se filtra en vivo: en un campo de
// edición que ya trae "@dominio", cada punto que escribes en el usuario es transitoriamente
// "final", y quitarlo en cada tecla peleaba con el cursor y desordenaba el texto. Ese caso
// lo atrapa `validarUsuarioCorreo` al enviar, con un mensaje claro.
export const filtrarCorreo = (value) => {
    const limpio = String(value || '').replace(/[^a-zA-Z0-9.@-]/g, '')
    const at = limpio.indexOf('@')
    const usuario = (at === -1 ? limpio : limpio.slice(0, at)).replace(/\.{2,}/g, '.').replace(/^\.+/, '')
    return usuario + (at === -1 ? '' : limpio.slice(at))
}
