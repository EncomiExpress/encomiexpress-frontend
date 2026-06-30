export const normalizarTexto = (str = '') =>
    (str || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export const hayNombreDuplicado = (registros, nombre, apellido, opciones = {}) => {
    const {
        getNombre = (r) => r.nombre,
        getApellido = (r) => r.apellido,
        getId,
        excludeId,
    } = opciones

    const n = normalizarTexto(nombre)
    const a = normalizarTexto(apellido)
    if (!n || !a) return false

    return (registros || []).some((r) => {
        if (excludeId !== undefined && getId && getId(r) === excludeId) return false
        return normalizarTexto(getNombre(r)) === n && normalizarTexto(getApellido(r)) === a
    })
}

export const MENSAJE_NOMBRE_DUPLICADO = 'Ya existe un registro con este nombre y apellido. Verifica que no sea un duplicado.'
