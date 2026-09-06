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
// sobre todo para texto libre como municipio ("Necoclí" vs "Necocli" deben contar como el
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

// Deriva las opciones sugeridas para un campo de texto libre (ej. Autocomplete freeSolo)
// a partir de los valores ya usados en una lista de registros — sin tabla de referencia
// aparte, la "lista" es solo lo que ya existe en los datos cargados en memoria. Dedupe
// sin importar mayúsculas/tildes (normalizarTexto), preservando la primera grafía real
// encontrada para cada valor.
export const getValoresUnicos = (registros, getValor) => {
    const vistos = new Map()
    for (const r of registros || []) {
        const val = getValor(r)?.trim()
        if (!val) continue
        const n = normalizarTexto(val)
        if (!vistos.has(n)) vistos.set(n, val)
    }
    return [...vistos.values()].sort((a, b) => a.localeCompare(b, 'es'))
}
