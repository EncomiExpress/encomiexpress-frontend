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

// Usa normalizarTexto (ignora mayúsculas Y tildes) igual que hayNombreDuplicado — importa
// sobre todo para texto libre como ciudad ("Necoclí" vs "Necocli" deben contar como el
// mismo registro). Para números de documento no cambia nada (no llevan tildes).
export const hayDocumentoDuplicado = (registros, numeroIdentificacion, opciones = {}) => {
    const { getDoc = (r) => r.numeroIdentificacion, getId, excludeId } = opciones
    const doc = normalizarTexto(numeroIdentificacion)
    if (!doc) return false
    return (registros || []).some(r => {
        if (excludeId !== undefined && getId && getId(r) === excludeId) return false
        return normalizarTexto(getDoc(r)) === doc
    })
}

export const MENSAJE_DOC_DUPLICADO = 'Ya existe un registro con este número de documento. Verifica que no sea un duplicado.'

export const MENSAJE_PLACA_DUPLICADA = 'Ya existe un vehículo registrado con esta placa. Verifica que no sea un duplicado.'

export const MENSAJE_EMAIL_DUPLICADO = 'Ya existe un usuario registrado con este correo electrónico.'

export const MENSAJE_LICENCIA_DUPLICADA = 'Ya existe un conductor registrado con este número de licencia.'
