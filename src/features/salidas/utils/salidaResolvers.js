import { getDocumentoVehiculoVencido, conductorLicenciaVigente } from '../../../shared/utils/vigenciaDocumentos.js'
import { hoyISO } from '../../../shared/utils/horarioLaboral.js'
import { getRutaLabel } from '../../rutas/utils/rutaResolvers.js'

export const getSalidaId = (salida) => salida.idSalida

// Mismo criterio que yaDebioSalir() (jobs/autoIniciarRutas.js) y motivoSalidaVencida()
// (salidaProgramadaService.js, updateEstado/toggleHabilitado) del backend — se
// duplica acá para avisar en el frontend ANTES de chocar con el backend (menú de
// estado, modal de habilitar/inhabilitar). Distingue el motivo ('fecha' vs. 'hora')
// para un aviso más útil: "hora" solo aplica cuando la fecha sigue siendo hoy pero
// la hora de salida ya pasó.
export const motivoSalidaVencida = (salida) => {
    if (!salida?.fechaSalida || !salida?.horaSalida) return 'fecha'
    if (salida.fechaSalida < hoyISO()) return 'fecha'
    if (salida.fechaSalida > hoyISO()) return null
    const hora = new Date(`${salida.fechaSalida}T${salida.horaSalida}-05:00`)
    return (isNaN(hora.getTime()) || hora <= new Date()) ? 'hora' : null
}

// Une lo que necesitan ListarSalidaProgramada.jsx (vehiculoInhabilitado/conductorInhabilitado,
// para el chip "Reasignar vehículo/conductor") y ModalConsultarSalidaProgramada.jsx
// (idVehiculo/idConductor, para el onClick "abrir en otra pestaña") en un solo resultado
// superconjunto -- cada consumidor usa solo los campos que le aplican.
export const resolvePares = (salida, { getVehiculos, getConductores }) => (salida.paresVehiculoConductor || []).map(par => {
    const vehiculoCtx = getVehiculos().find(v => v.idVehiculo === par.idVehiculo)
    const conductorCtx = getConductores().find(c => c.idConductor === par.idConductor)
    return {
        idSalidaVehiculoConductor: par.idSalidaVehiculoConductor,
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
        // invisible mientras la salida sigue Programada.
        documentoVencido: par.vehiculo ? getDocumentoVehiculoVencido(par.vehiculo) : null,
        licenciaVencida: par.conductor ? !conductorLicenciaVigente(par.conductor.categoriasLicencia) : false,
    }
})

// El destino final ya no es un campo directo de la Salida — se hereda de su Ruta
// (plantilla): `salida.ruta.idDestino` / `salida.ruta.destino` (alias del backend,
// ver models/index.js: SalidaProgramada.belongsTo(Ruta, { as: 'ruta' }),
// Ruta.belongsTo(Destino, { as: 'destino' })). Este helper centraliza esa lectura
// anidada para que el resto de la feature no tenga que repetirla.
const getRutaTemplate = (salida) => salida?.ruta || null

// preferNombre: ListarSalidaProgramada.jsx prefiere el nombre propio del destino si lo
// tiene; ModalConsultarSalidaProgramada.jsx siempre mostraba "municipio, departamento"
// incluso cuando el destino tenía nombre -- diferencia real preexistente entre ambos,
// preservada acá en vez de unificada (igual que en el viejo rutaResolvers.js).
export const resolveDestino = (salida, destinos, { preferNombre = false } = {}) => {
    const ruta = getRutaTemplate(salida)
    if (ruta?.destino) return `${ruta.destino.municipio}, ${ruta.destino.departamento}`
    const d = destinos.find(x => x.idDestino === ruta?.idDestino)
    if (!d) return 'N/A'
    return preferNombre ? (d.nombre || `${d.municipio}, ${d.departamento}`) : `${d.municipio}, ${d.departamento}`
}

// Igual que resolveDestino pero sin unir municipio/departamento en un solo string --
// lo necesita ModalConsultarSalidaProgramada.jsx para mostrar "Origen - Destino" en el
// título (con el municipio) y "Hacia {departamento}" aparte en el subtítulo.
export const resolveDestinoPartes = (salida, destinos) => {
    const ruta = getRutaTemplate(salida)
    const d = ruta?.destino || destinos.find(x => x.idDestino === ruta?.idDestino)
    return { municipio: d?.municipio || 'N/A', departamento: d?.departamento || 'N/A' }
}

// paresOriginales / salidaOriginal: solo los pasa ActualizarSalidaProgramada.jsx (el
// arreglo de pares ya guardados en la salida, o la salida original completa) -- sirven
// de respaldo cuando el vehículo/conductor/destino ya fue inhabilitado desde que se creó
// la salida y por eso no aparece en las listas de habilitados.

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

// Corredor ("Medellín → Destino") de la PLANTILLA elegida — usado por el paso
// "Elegir Ruta" del wizard y por la columna "Ruta" del listado. Sin nombre propio,
// ver rutas/utils/rutaResolvers.js.
export const resolveRutaLabel = (salida) => getRutaLabel(getRutaTemplate(salida))
export const getRutaTemplateIdDestino = (salida) => getRutaTemplate(salida)?.idDestino ?? null
