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

    const ejecutarCambioEstado = async (id, nuevoEstado) => {
        try {
            await updateEstado(id, nuevoEstado)
            // updateEstado del contexto solo parcha el campo "estado" en memoria — los
            // indicadores "pendienteLegalizacion"/"paquetesPendientes" salen de una
            // consulta agregada aparte (rutaService.getAll) y quedarían desactualizados
            // (ej. al pasar a "En Ruta" recién ahí nace el anticipo "En Legalización" y
            // los paquetes "Por entregar", pero la fila seguiría mostrando el selector
            // normal hasta el próximo refresco). Se refresca la lista completa para que
            // el selector dividido de bloqueo aparezca de inmediato si corresponde.
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
                        mensaje: 'ya está asignado a la ruta', mensajeFin: 'que se encuentra En Ruta.',
                        rutaConflicto: { idRuta: conflictoVehiculo.idRuta, label: conflictoVehiculo.origen ? `${conflictoVehiculo.origen} → ${conflictoVehiculo.destino?.ciudad || 'Sin destino'}` : `#${conflictoVehiculo.idRuta}` },
                    })
                }

                if (conflictoConductor) {
                    conductorBlocked = true
                    const nombre = par.conductor?.nombre ? `${par.conductor.nombre} ${par.conductor.apellido || ''}`.trim() : 'Conductor'
                    entidades.push({
                        tipo: 'conductor', etiqueta: nombre, estado: par.conductor?.estado || 'en_ruta', id: par.conductor?.idConductor,
                        mensaje: 'ya está asignado a la ruta', mensajeFin: 'que se encuentra En Ruta.',
                        rutaConflicto: { idRuta: conflictoConductor.idRuta, label: conflictoConductor.origen ? `${conflictoConductor.origen} → ${conflictoConductor.destino?.ciudad || 'Sin destino'}` : `#${conflictoConductor.idRuta}` },
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
                const ventasSinFecha = (ventasRes?.data || []).filter(v => v.estado !== 'Cancelada' && !v.fechaEstimadaEntrega)
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
                // igual revalida MISSING_DELIVERY_DATE al confirmar.
                showToast(err.message || 'No se pudo verificar las fechas de entrega, se validará al confirmar.', 'warning')
            }
        }

        const INFO_ESTADOS = {
            'Programada': 'Las ventas seguirán asociadas bajo esta ruta. Deberá registrar un nuevo anticipo para el conductor si es necesario.',
            'Completada': 'El vehículo y el conductor quedarán disponibles y las ventas asociadas pasarán a "Entregada".',
            'Cancelada': 'El vehículo y el conductor quedarán disponibles, el anticipo pasará a "Excedente pendiente" y las ventas asociadas quedarán pendientes de reasignación a otra ruta.',
        }
        const info = INFO_ESTADOS[nuevoEstado] || ''
        setConfirmEstado({ open: true, id, nuevoEstado, info, ruta: rutaActual, pares: paresResueltos })
    }

    return { confirmEstado, setConfirmEstado, alertaBloqueo, setAlertaBloqueo, handleEstadoChange, ejecutarCambioEstado }
}
