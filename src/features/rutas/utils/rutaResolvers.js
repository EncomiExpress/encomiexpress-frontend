import { getDocumentoVehiculoVencido, conductorLicenciaVigente } from '../../../shared/utils/vigenciaDocumentos.js'

// El id de una ruta puede venir como idRuta (API actual) o idRutaProgramada (legacy).
export const getRutaId = (ruta) => ruta.idRuta ?? ruta.idRutaProgramada

// Une lo que necesitan ListarRutaProgramacion.jsx (vehiculoInhabilitado/conductorInhabilitado,
// para el chip "Reasignar vehículo/conductor") y ModalConsultarRutaProgramacion.jsx
// (idVehiculo/idConductor, para el onClick "abrir en otra pestaña") en un solo resultado
// superconjunto -- cada consumidor usa solo los campos que le aplican.
export const resolvePares = (ruta, { getVehiculos, getConductores }) => (ruta.paresVehiculoConductor || []).map(par => {
    const vehiculoCtx = getVehiculos().find(v => v.idVehiculo === par.idVehiculo)
    const conductorCtx = getConductores().find(c => c.idConductor === par.idConductor)
    return {
        idRutaVehiculoConductor: par.idRutaVehiculoConductor,
        idVehiculo: par.idVehiculo,
        idConductor: par.idConductor,
        placa: par.vehiculo?.placa ?? (vehiculoCtx?.placa || 'N/A'),
        conductorNombre: par.conductor?.usuario
            ? `${par.conductor.usuario.nombre} ${par.conductor.usuario.apellido}`
            : (conductorCtx ? `${conductorCtx.nombre} ${conductorCtx.apellido}` : 'N/A'),
        vehiculoInhabilitado: vehiculoCtx?.habilitado === false,
        conductorInhabilitado: conductorCtx?.habilitado === false,
        // El backend solo revalida documentos/licencia al crear/cambiar el par o al pasar
        // a "En Ruta" — nunca de forma continua — así que se marca acá para que no quede
        // invisible mientras la ruta sigue Programada.
        documentoVencido: par.vehiculo ? getDocumentoVehiculoVencido(par.vehiculo) : null,
        licenciaVencida: par.conductor ? !conductorLicenciaVigente(par.conductor.categoriasLicencia) : false,
    }
})

// preferNombre: ListarRutaProgramacion.jsx prefiere el nombre propio del destino si lo
// tiene (getDestinoNombre original); ModalConsultarRutaProgramacion.jsx siempre mostraba
// "ciudad, departamento" incluso cuando el destino tenía nombre -- diferencia real
// preexistente entre ambos, preservada acá en vez de unificada.
export const resolveDestino = (ruta, destinos, { preferNombre = false } = {}) => {
    if (ruta.destino) return `${ruta.destino.ciudad}, ${ruta.destino.departamento}`
    const d = destinos.find(x => x.idDestino === ruta.idDestino)
    if (!d) return 'N/A'
    return preferNombre ? (d.nombre || `${d.ciudad}, ${d.departamento}`) : `${d.ciudad}, ${d.departamento}`
}

// paresOriginales / rutaOriginal: solo los pasa ActualizarRutaProgramacion.jsx (el arreglo
// de pares ya guardados en la ruta, o la ruta original completa) -- sirven de respaldo
// cuando el vehículo/conductor/destino ya fue inhabilitado desde que se creó la ruta y por
// eso no aparece en las listas de habilitados. RegistrarRutaProgramacion.jsx no tiene
// ningún dato "original" que consultar, así que simplemente no los pasa (quedan en su
// valor por defecto) y el resultado es igual al de sus versiones locales de antes.

export const getVehiculoLabel = (id, vehiculos, paresOriginales = []) => {
    const v = vehiculos.find(x => x.idVehiculo === parseInt(id))
    if (v) return `${v.placa} - ${v.marca} ${v.modelo}`
    const original = paresOriginales.find(p => p.idVehiculo === parseInt(id))?.vehiculo
    return original ? `${original.placa} - ${original.marca} ${original.modelo}` : '—'
}

export const getConductorLabel = (id, conductores, paresOriginales = []) => {
    const c = conductores.find(x => x.idConductor === parseInt(id))
    if (c) return `${c.nombre} ${c.apellido}`
    const original = paresOriginales.find(p => p.idConductor === parseInt(id))?.conductor?.usuario
    return original ? `${original.nombre} ${original.apellido}` : '—'
}

export const getDestinoLabel = (id, destinos, rutaOriginal = null) => {
    const d = destinos.find(x => x.idDestino === parseInt(id))
    if (d) return d.nombre ? `${d.nombre} - ${d.ciudad}` : `${d.departamento} - ${d.ciudad}`
    if (rutaOriginal?.destino && parseInt(id) === rutaOriginal.idDestino) return `${rutaOriginal.destino.departamento} - ${rutaOriginal.destino.ciudad}`
    return '—'
}

// Paradas intermedias del corredor, ya ordenadas por el backend (ruta.paradas viene
// ordenado por "orden" — ver INCLUDE_PARADAS en rutaService.js). No es un campo
// guardado aparte: solo se lee lo que ya trae la ruta.
export const resolveParadas = (ruta) => (ruta?.paradas || [])
    .filter(p => p.destino)
    .map(p => ({ idDestino: p.idDestino, ciudad: p.destino.ciudad, departamento: p.destino.departamento }))

// Departamentos que cruza la ruta — se deriva en el momento a partir del destino
// final y de las paradas intermedias, no es un campo propio (ver LOGICA.md, "Rutas
// con paradas"). Devuelve un array sin duplicados, en el orden en que aparecen.
export const resolveDepartamentos = (ruta) => {
    const departamentos = [
        ruta?.destino?.departamento,
        ...resolveParadas(ruta).map(p => p.departamento),
    ].filter(Boolean)
    return [...new Set(departamentos)]
}
