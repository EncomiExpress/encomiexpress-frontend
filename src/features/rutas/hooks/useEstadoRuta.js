import { useState } from 'react'
import { getEncomiendas } from '../../ventas/services/ventaService.js'
import { getDisponibilidadRuta } from '../services/rutaService.js'
import { getGuiaPrincipal } from '../../../shared/utils/formatters.js'
import { getRutaId } from '../utils/rutaResolvers.js'

// Extracción tal cual (sin refactorizar la lógica) del flujo de cambio de estado de
// ListarRutaProgramacion.jsx -- es la pieza de mayor riesgo de todo el módulo: detecta
// conflictos de disponibilidad de vehículo/conductor contra TODAS las rutas En Ruta
// (no solo la página cargada) y bloquea ventas sin fecha de entrega antes de permitir
// pasar una ruta a "En Ruta".
export function useEstadoRuta({ rutasProgramadas, getVehiculos, getConductores, fetchVehiculos, fetchConductores, updateEstado, refetch, showToast }) {
    const [confirmEstado, setConfirmEstado] = useState({ open: false, id: null, nuevoEstado: null, info: '', ruta: null, pares: [] })
    const [alertaBloqueo, setAlertaBloqueo] = useState({ open: false, tipo: 'conflicto', titulo: '', entidades: [] })

    const ejecutarCambioEstado = async (id, nuevoEstado, extra = {}) => {
        try {
            await updateEstado(id, nuevoEstado, extra)
            // updateEstado del contexto solo parcha el campo "estado" en memoria — el
            // indicador "paquetesPendientes" sale de una consulta agregada aparte
            // (rutaService.getAll) y quedaría desactualizado (ej. al pasar a "En Ruta"
            // recién ahí nacen los paquetes "Por entregar", pero la fila seguiría
            // mostrando el selector normal hasta el próximo refresco). Se refresca la
            // lista completa para que el selector dividido de bloqueo aparezca de
            // inmediato si corresponde.
            refetch()
            showToast(`Estado actualizado a "${nuevoEstado}".`, 'success')
        } catch (err) {
            if (err.errorCode === 'MISSING_DELIVERY_DATE') {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'ventas',
                    titulo: 'No se puede iniciar la ruta',
                    entidades: err.details || [],
                })
                return
            }
            if (err.errorCode === 'SEDE_SIN_CARGA' || err.errorCode === 'VEHICULO_SIN_CARGA') {
                setAlertaBloqueo({
                    open: true,
                    tipo: 'carga',
                    titulo: 'No se puede iniciar la ruta',
                    mensaje: err.errorCode === 'SEDE_SIN_CARGA'
                        ? 'Cada parada y el destino final deben tener al menos una encomienda asignada. Sin paquetes:'
                        : 'Todos los vehículos del convoy deben llevar carga. Sin paquetes:',
                    entidades: (err.details || []).map(d => ({ label: d.descripcion })),
                })
                return
            }
            showToast(err.message || 'Error al actualizar estado', 'error')
        }
    }

    const handleEstadoChange = async (id, nuevoEstado) => {
        const rutaActual = rutasProgramadas.find(r => getRutaId(r) === id)
        const paresActual = rutaActual?.paresVehiculoConductor || []

        let disponibilidad = []
        if (nuevoEstado === 'En Ruta') {
            // Refresca vehículos/conductores y consulta disponibilidad real contra TODAS
            // las rutas En Ruta — antes este chequeo solo miraba `rutasProgramadas`
            // (limitada por la paginación de la tabla) y podía dejar pasar conflictos
            // reales que estuvieran fuera de la página cargada.
            const idVehiculos = paresActual.map(p => p.idVehiculo).filter(Boolean)
            const idConductores = paresActual.map(p => p.idConductor).filter(Boolean)
            try {
                const [, , disp] = await Promise.all([
                    fetchVehiculos(),
                    fetchConductores(),
                    getDisponibilidadRuta({ idVehiculos, idConductores, idRutaExcluir: id }).then(res => res.data || []),
                ])
                disponibilidad = disp
            } catch (err) {
                // Si el chequeo previo falla (ej. sin conexión), no se bloquea el flujo —
                // el backend igual revalida VEHICLE_IN_USE/CONDUCTOR_IN_USE al confirmar.
                showToast(err.message || 'No se pudo verificar disponibilidad, se validará al confirmar.', 'warning')
            }
        }

        // Vehículo/conductor "en vivo" desde los contextos (recién refrescados arriba
        // si el nuevo estado es En Ruta), con respaldo a los datos de la propia ruta.
        const paresResueltos = paresActual.map(par => ({
            idRutaVehiculoConductor: par.idRutaVehiculoConductor,
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

                if (par.vehiculo?.estado === 'Mantenimiento') {
                    vehiculoBlocked = true
                    entidades.push({ tipo: 'vehiculo', etiqueta: par.vehiculo.placa || '', estado: par.vehiculo.estado, id: par.vehiculo.idVehiculo, mensaje: 'está en Mantenimiento y no puede asignarse a una ruta En Ruta.', rutaConflicto: null })
                } else if (conflictoVehiculo) {
                    vehiculoBlocked = true
                    entidades.push({
                        tipo: 'vehiculo', etiqueta: par.vehiculo?.placa || '', estado: par.vehiculo?.estado, id: par.vehiculo?.idVehiculo,
                        // "ya está asignado a la ruta X que se encuentra En Ruta" daba a entender
                        // que el problema era la asignación en sí (obvio, claro que está asignado)
                        // en vez de decir lo que de verdad importa: que ya está ocupado ahora mismo
                        // con otro viaje. Mismo criterio que el mensaje del backend
                        // (rutaService.updateEstado, VEHICLE_IN_USE/CONDUCTOR_IN_USE).
                        mensaje: 'está en curso con la ruta',
                        rutaConflicto: { idRuta: conflictoVehiculo.idRuta, label: conflictoVehiculo.origen ? `${conflictoVehiculo.origen} → ${conflictoVehiculo.destino?.municipio || 'Sin destino'}` : `#${conflictoVehiculo.idRuta}` },
                    })
                }

                if (conflictoConductor) {
                    conductorBlocked = true
                    const nombre = par.conductor?.nombre ? `${par.conductor.nombre} ${par.conductor.apellido || ''}`.trim() : 'Conductor'
                    entidades.push({
                        tipo: 'conductor', etiqueta: nombre, estado: par.conductor?.estado || 'en_ruta', id: par.conductor?.idConductor,
                        mensaje: 'está en curso con la ruta',
                        rutaConflicto: { idRuta: conflictoConductor.idRuta, label: conflictoConductor.origen ? `${conflictoConductor.origen} → ${conflictoConductor.destino?.municipio || 'Sin destino'}` : `#${conflictoConductor.idRuta}` },
                    })
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
            // adelanta acá para no dejar que el modal normal de "cambiar a En Ruta"
            // (que ya dice que vehículo/conductor pasarán a ocupados, dando a entender
            // que todo está bien) se muestre primero y recién al confirmar salga este
            // bloqueo. Si algo bloquea, se avisa antes de llegar a ese modal.
            try {
                const ventasRes = await getEncomiendas(undefined, { idRuta: id, habilitado: 'true', limit: 1000 })
                const ventas = (ventasRes?.data || []).filter(v => v.estado !== 'Cancelada')

                // Pre-chequeos que replican al backend — así se abre el modal de
                // BLOQUEO en vez del de confirmación (que da a entender que todo va
                // bien). No aplica a un viaje de regreso (puede ir vacío).
                if (!rutaActual?.idRutaIda) {
                    // (1) Sin ninguna encomienda.
                    if (ventas.length === 0) {
                        setAlertaBloqueo({ open: true, tipo: 'carga', titulo: 'No se puede iniciar la ruta',
                            mensaje: 'Esta ruta no tiene ninguna encomienda asignada. Registra al menos una antes de ponerla En Ruta.', entidades: [] })
                        return
                    }
                    // (2) Alguna sede del recorrido (parada o destino final) sin carga.
                    const sedesConCarga = new Set(
                        ventas.filter(v => (v.paquetes || []).length > 0).map(v => v.destinatario?.idDestino).filter(Boolean)
                    )
                    const sedesRuta = [
                        ...(rutaActual.paradas || []).map(p => ({ id: p.idDestino, label: p.destino?.municipio || 'Parada' })),
                        { id: rutaActual.idDestino, label: rutaActual.destino?.municipio || 'Destino final' },
                    ]
                    const sedesVacias = sedesRuta.filter(s => s.id && !sedesConCarga.has(s.id))
                    if (sedesVacias.length > 0) {
                        setAlertaBloqueo({ open: true, tipo: 'carga', titulo: 'No se puede iniciar la ruta',
                            mensaje: 'Cada parada y el destino final deben tener al menos una encomienda asignada. Sin paquetes:',
                            entidades: sedesVacias.map(s => ({ label: `${s.label} — sin paquetes` })) })
                        return
                    }
                    // (3) Algún vehículo del convoy sin carga.
                    const paqPorPar = {}
                    ventas.forEach(v => (v.paquetes || []).forEach(p => { paqPorPar[p.idRutaVehiculoConductor] = (paqPorPar[p.idRutaVehiculoConductor] || 0) + 1 }))
                    const paresVacios = (rutaActual.paresVehiculoConductor || []).filter(par => !(paqPorPar[par.idRutaVehiculoConductor] > 0))
                    if (paresVacios.length > 0) {
                        setAlertaBloqueo({ open: true, tipo: 'carga', titulo: 'No se puede iniciar la ruta',
                            mensaje: 'Todos los vehículos del convoy deben llevar carga. Sin paquetes:',
                            entidades: paresVacios.map(par => ({ label: `${par.vehiculo?.placa || 'Vehículo'} — sin paquetes` })) })
                        return
                    }
                }

                const ventasSinFecha = ventas.filter(v => !v.fechaEstimadaEntrega)
                if (ventasSinFecha.length > 0) {
                    setAlertaBloqueo({
                        open: true,
                        tipo: 'ventas',
                        titulo: 'No se puede iniciar la ruta',
                        entidades: ventasSinFecha.map(v => ({ id: v.idEncomiendaVenta, guia: getGuiaPrincipal(v) })),
                    })
                    return
                }
            } catch (err) {
                // Si el chequeo previo falla, no se bloquea el flujo — el backend
                // igual revalida al confirmar.
                showToast(err.message || 'No se pudo verificar la ruta, se validará al confirmar.', 'warning')
            }
        }

        // "Completada": el vehículo/conductor SIEMPRE quedan con estado "Disponible"
        // en BD (rutaService.updateEstado), pero solo quedan realmente libres para
        // cualquier ruta nueva si esta era un viaje de regreso (idRutaIda) — si no,
        // quedan marcados "fuera de base" en el destino de la ruta (idDestinoActual)
        // y validarUbicacionParaRuta bloquea asignarlos a una ruta nueva desde
        // Medellín hasta que se les programe el regreso. Ver LOGICA.md, "Rutas —
        // origen y fuera de base".
        const infoCompletada = rutaActual?.idRutaIda
            ? 'El vehículo y el conductor volvieron a base: quedan disponibles para rutas nuevas. Las ventas con todos los paquetes entregados pasarán a "Entregada"; las que sigan en distribución continuarán su curso.'
            : `El vehículo y el conductor quedan marcados en ${rutaActual?.destino?.municipio || 'el destino de esta ruta'}: no se les podrá asignar una ruta nueva desde Medellín hasta programarles el regreso. Las ventas con todos los paquetes entregados pasarán a "Entregada"; las que sigan en distribución continuarán su curso.`

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta ruta. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': infoCompletada,
            'Cancelada': 'El vehículo y el conductor quedarán disponibles y el anticipo pasará a "Excedente pendiente". Las ventas que aún no llegaban a ninguna sede vuelven a "Programada" para reasignarlas.',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, ruta: rutaActual, pares: paresResueltos })
    }

    return { confirmEstado, setConfirmEstado, alertaBloqueo, setAlertaBloqueo, handleEstadoChange, ejecutarCambioEstado }
}
