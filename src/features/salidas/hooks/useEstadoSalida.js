import { useState } from 'react'
import { getEncomiendas } from '../../ventas/services/ventaService.js'
import { getDisponibilidadSalida } from '../services/salidaService.js'
import { getGuiaPrincipal, formatFecha } from '../../../shared/utils/formatters.js'
import { getDocumentoVehiculoVencido, conductorLicenciaVigente } from '../../../shared/utils/vigenciaDocumentos.js'
import { getSalidaId } from '../utils/salidaResolvers.js'

// Adaptado de useEstadoRuta.js -- es la pieza de mayor riesgo de todo el módulo:
// detecta conflictos de disponibilidad de vehículo/conductor contra TODAS las
// salidas En Ruta (no solo la página cargada) y bloquea ventas sin fecha de entrega
// antes de permitir pasar una salida a "En Ruta".
// La etiqueta necesita la fecha además de origen/destino: dos salidas al mismo
// destino (ej. dos viajes a Montería en semanas distintas) se ven idénticas sin
// ella, y el usuario no puede saber CUÁL de las dos es la que está en conflicto.
const etiquetaSalidaConflicto = (s) =>
  s.origen ? `${s.origen} → ${s.destino?.municipio || 'Sin destino'} · ${formatFecha(s.fechaSalida)}` : `#${s.idSalida}`

export function useEstadoSalida({ salidasProgramadas, getVehiculos, getConductores, fetchVehiculos, fetchConductores, updateEstado, refetch, showToast }) {
    const [confirmEstado, setConfirmEstado] = useState({ open: false, id: null, nuevoEstado: null, info: '', salida: null, pares: [] })
    const [alertaBloqueo, setAlertaBloqueo] = useState({ open: false, tipo: 'conflicto', titulo: '', entidades: [] })

    const ejecutarCambioEstado = async (id, nuevoEstado, extra = {}) => {
        try {
            await updateEstado(id, nuevoEstado, extra)
            // updateEstado del contexto solo parcha el campo "estado" en memoria — el
            // indicador "paquetesPendientes" sale de una consulta agregada aparte
            // (salidaProgramadaService.getAll) y quedaría desactualizado. Se refresca la
            // lista completa para que el selector dividido de bloqueo aparezca de inmediato.
            refetch()
            showToast(`Estado actualizado a "${nuevoEstado}".`, 'success')
        } catch (err) {
            if (err.errorCode === 'MISSING_DELIVERY_DATE') {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'ventas',
                    titulo: 'No se puede iniciar la salida',
                    entidades: err.details || [],
                })
                return
            }
            if (err.errorCode === 'VEHICULO_SIN_CARGA') {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'carga',
                    titulo: 'No se puede iniciar la salida',
                    mensaje: 'Todos los vehículos del convoy deben llevar carga. Sin paquetes:',
                    entidades: (err.details || []).map(d => ({ label: d.descripcion })),
                })
                return
            }
            showToast(err.message || 'Error al actualizar estado', 'error')
        }
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        const salidaActual = salidasProgramadas.find(s => getSalidaId(s) === id)
        const paresActual = salidaActual?.paresVehiculoConductor || []

        let disponibilidad = []
        if (nuevoEstado === 'En Ruta') {
            // Refresca vehículos/conductores y consulta disponibilidad real contra TODAS
            // las salidas En Ruta — este chequeo no debe limitarse a `salidasProgramadas`
            // (acotada por la paginación de la tabla).
            const idVehiculos = paresActual.map(p => p.idVehiculo).filter(Boolean)
            const idConductores = paresActual.map(p => p.idConductor).filter(Boolean)
            try {
                const [, , disp] = await Promise.all([
                    fetchVehiculos(),
                    fetchConductores(),
                    getDisponibilidadSalida({ idVehiculos, idConductores, idSalidaExcluir: id }).then(res => res.data || []),
                ])
                disponibilidad = disp
            } catch (err) {
                // Si el chequeo previo falla (ej. sin conexión), no se bloquea el flujo —
                // el backend igual revalida VEHICLE_IN_USE/CONDUCTOR_IN_USE al confirmar.
                showToast(err.message || 'No se pudo verificar disponibilidad, se validará al confirmar.', 'warning')
            }
        }

        // Vehículo/conductor "en vivo" desde los contextos (recién refrescados arriba
        // si el nuevo estado es En Ruta), con respaldo a los datos de la propia salida.
        const paresResueltos = paresActual.map(par => ({
            idSalidaVehiculoConductor: par.idSalidaVehiculoConductor,
            idVehiculo: par.idVehiculo,
            idConductor: par.idConductor,
            vehiculo: getVehiculos().find(v => v.idVehiculo === par.idVehiculo) || (par.vehiculo ? { ...par.vehiculo } : null),
            conductor: getConductores().find(c => c.idConductor === par.idConductor) || (par.conductor?.usuario ? { idConductor: par.idConductor, ...par.conductor.usuario } : null),
        }))

        if (nuevoEstado === 'En Ruta') {
            const entidades = []
            let vehiculoBlocked = false
            let conductorBlocked = false

            for (const par of paresResueltos) {
                const conflictoVehiculo = disponibilidad.find(d => d.idVehiculo === par.idVehiculo && d.estado === 'En Ruta')
                const conflictoConductor = disponibilidad.find(d => d.idConductor === par.idConductor && d.estado === 'En Ruta')
                // Mismo orden que valida el backend al pasar a "En Ruta" (ver LOGICA.md,
                // tabla de transiciones): 1. vehículo ocupado, 2. conductor ocupado, 3.
                // documentos/licencia vigentes -- revalidados acá también, no solo al
                // elegir el par en el wizard, por si vencieron mientras la salida seguía
                // Programada.
                const documentoVencido = par.vehiculo ? getDocumentoVehiculoVencido(par.vehiculo) : null
                const licenciaVencida = par.conductor && !conductorLicenciaVigente(par.conductor.categoriasLicencia)

                if (par.vehiculo?.estado === 'Mantenimiento') {
                    vehiculoBlocked = true
                    entidades.push({ tipo: 'vehiculo', etiqueta: par.vehiculo.placa || '', estado: par.vehiculo.estado, id: par.vehiculo.idVehiculo, mensaje: 'está en Mantenimiento y no puede asignarse a una salida En Ruta.', salidaConflicto: null })
                } else if (conflictoVehiculo) {
                    vehiculoBlocked = true
                    entidades.push({
                        tipo: 'vehiculo', etiqueta: par.vehiculo?.placa || '', estado: par.vehiculo?.estado, id: par.vehiculo?.idVehiculo,
                        mensaje: 'está en curso con la salida',
                        salidaConflicto: { idSalida: conflictoVehiculo.idSalida, idRuta: conflictoVehiculo.idRuta, label: etiquetaSalidaConflicto(conflictoVehiculo) },
                    })
                } else if (documentoVencido) {
                    vehiculoBlocked = true
                    entidades.push({ tipo: 'vehiculo', etiqueta: par.vehiculo?.placa || '', estado: par.vehiculo?.estado, id: par.vehiculo?.idVehiculo, mensaje: `tiene el ${documentoVencido} vencido y no puede asignarse a una salida En Ruta.`, salidaConflicto: null })
                }

                if (conflictoConductor) {
                    conductorBlocked = true
                    const nombre = par.conductor?.nombre ? `${par.conductor.nombre} ${par.conductor.apellido || ''}`.trim() : 'Conductor'
                    entidades.push({
                        tipo: 'conductor', etiqueta: nombre, estado: par.conductor?.estado || 'en_ruta', id: par.conductor?.idConductor,
                        mensaje: 'está en curso con la salida',
                        salidaConflicto: { idSalida: conflictoConductor.idSalida, idRuta: conflictoConductor.idRuta, label: etiquetaSalidaConflicto(conflictoConductor) },
                    })
                } else if (licenciaVencida) {
                    conductorBlocked = true
                    const nombre = par.conductor?.nombre ? `${par.conductor.nombre} ${par.conductor.apellido || ''}`.trim() : 'Conductor'
                    entidades.push({ tipo: 'conductor', etiqueta: nombre, estado: par.conductor?.estado, id: par.conductor?.idConductor, mensaje: 'tiene la licencia de conducción vencida y no puede asignarse a una salida En Ruta.', salidaConflicto: null })
                }
            }

            if (entidades.length > 0) {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'conflicto',
                    titulo: vehiculoBlocked && conductorBlocked
                        ? 'Vehículo y conductor no disponibles'
                        : vehiculoBlocked ? 'Vehículo no disponible'
                        : 'Conductor no disponible',
                    entidades,
                })
                return
            }

            // Mismo chequeo que hace el backend al confirmar (updateEstado) — se
            // adelanta acá para no dejar que el modal normal de "cambiar a En Ruta" se
            // muestre primero y recién al confirmar salga este bloqueo.
            try {
                const ventasRes = await getEncomiendas(undefined, { idSalida: id, habilitado: 'true', limit: 1000 })
                const ventas = (ventasRes?.data || []).filter(v => v.estado !== 'Cancelada')

                // Pre-chequeos que replican al backend. Un viaje de regreso ya NO está
                // exento (2026-09-17) -- ver el mismo comentario en updateEstado
                // (salidaProgramadaService.js): ahora sí hay forma de cargarle
                // encomiendas, así que le aplica la misma regla de "no salir vacío".
                // (1) Sin ninguna encomienda.
                if (ventas.length === 0) {
                    setAlertaBloqueo({ open: true, tipo: 'carga', titulo: 'No se puede iniciar la salida',
                        mensaje: 'Esta salida no tiene ninguna encomienda asignada. Registra al menos una antes de ponerla En Ruta.', entidades: [] })
                    return
                }
                // (2) Algún vehículo del convoy sin carga.
                const paqPorPar = {}
                ventas.forEach(v => (v.paquetes || []).forEach(p => { paqPorPar[p.idSalidaVehiculoConductor] = (paqPorPar[p.idSalidaVehiculoConductor] || 0) + 1 }))
                const paresVacios = (salidaActual.paresVehiculoConductor || []).filter(par => !(paqPorPar[par.idSalidaVehiculoConductor] > 0))
                if (paresVacios.length > 0) {
                    setAlertaBloqueo({ open: true, tipo: 'carga', titulo: 'No se puede iniciar la salida',
                        mensaje: 'Todos los vehículos del convoy deben llevar carga. Sin paquetes:',
                        entidades: paresVacios.map(par => ({ label: `${par.vehiculo?.placa || 'Vehículo'} — sin paquetes` })) })
                    return
                }

                const ventasSinFecha = ventas.filter(v => !v.fechaEstimadaEntrega)
                if (ventasSinFecha.length > 0) {
                    setAlertaBloqueo({
                        open: true,
                        tipo: 'ventas',
                        titulo: 'No se puede iniciar la salida',
                        entidades: ventasSinFecha.map(v => ({ id: v.idEncomiendaVenta, guia: getGuiaPrincipal(v) })),
                    })
                    return
                }
            } catch (err) {
                showToast(err.message || 'No se pudo verificar la salida, se validará al confirmar.', 'warning')
            }
        }

        // "Completada": el vehículo/conductor SIEMPRE quedan con estado "Disponible" en
        // BD, pero solo quedan realmente libres para cualquier salida nueva si esta era
        // un viaje de regreso (idSalidaIda) — si no, quedan marcados "fuera de base" en
        // el destino de la salida (idDestinoActual).
        const infoCompletada = salidaActual?.idSalidaIda
            ? 'El vehículo y el conductor volvieron a base: quedan disponibles para salidas nuevas. Las ventas con todos los paquetes entregados pasarán a "Entregada"; las que sigan en distribución continuarán su curso.'
            : `El vehículo y el conductor quedan marcados en ${salidaActual?.ruta?.destino?.municipio || 'el destino de esta salida'}: no se les podrá asignar una salida nueva desde Medellín hasta programarles el regreso. Las ventas con todos los paquetes entregados pasarán a "Entregada"; las que sigan en distribución continuarán su curso.`

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta salida. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': infoCompletada,
            'Cancelada': 'El vehículo y el conductor quedarán disponibles y el anticipo pasará a "Excedente pendiente". Las ventas que aún no llegaban a ninguna sede vuelven a "Programada" para reasignarlas.',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, salida: salidaActual, pares: paresResueltos })
    }

    return { confirmEstado, setConfirmEstado, alertaBloqueo, setAlertaBloqueo, handleEstadoChange, ejecutarCambioEstado }
}
