import { useEffect, useMemo, useState } from 'react'
import { getDisponibilidadSalida } from '../../features/salidas/services/salidaService.js'
import { sumarDias, DIAS_MARGEN_ENTRE_RUTAS } from '../utils/horarioLaboral.js'

// Para el paso "Vehículo y Conductor": dado un rango de fechas YA elegido (a
// diferencia de useDisponibilidadRuta, que arma el calendario ANTES de saber
// fecha/hora), devuelve qué vehículos/conductores de la lista candidata están
// realmente ocupados en ese rango -- para no dejarlos elegir en el Autocomplete
// y descubrir el choque recién al guardar. Misma fórmula que
// validarChoqueVehiculoConductor (backend, salidaProgramadaService.js):
// dos salidas se solapan si candidatoSalida < otraLlegada+GAP Y
// otraSalida < candidatoLlegada+GAP.
const GAP_TRANSICION = DIAS_MARGEN_ENTRE_RUTAS

// Misma proyección que validarUbicacionParaRuta (backend, salidaProgramadaService.js,
// 2026-09-17): de las ocupaciones de un vehículo/conductor que arrancan ANTES que la
// candidata, la más tardía -- si esa no es un regreso (sin idSalidaIda), ese
// vehículo/conductor va a estar fuera de Medellín justo cuando la candidata necesite
// arrancar, aunque hoy mismo (idDestinoActual) todavía no lo esté porque esa otra
// salida ni siquiera arrancó.
const masTardiaAntesDe = (ocupaciones, idKey, fechaSalida, horaSalida) => {
    const porId = new Map()
    const horaB = horaSalida || '00:00'
    for (const o of ocupaciones) {
        const id = o[idKey]
        if (!id) continue
        const horaO = o.horaSalida || '00:00'
        const esAntes = o.fechaSalida < fechaSalida || (o.fechaSalida === fechaSalida && horaO < horaB)
        if (!esAntes) continue
        const actual = porId.get(id)
        const horaActual = actual ? (actual.horaSalida || '00:00') : null
        if (!actual || o.fechaSalida > actual.fechaSalida || (o.fechaSalida === actual.fechaSalida && horaO > horaActual)) {
            porId.set(id, o)
        }
    }
    return porId
}

export const useDisponibilidadPares = ({ idVehiculos = [], idConductores = [], fechaSalida, horaSalida, fechaLlegadaEstimada, idSalidaExcluir, refrescarKey }) => {
    const [ocupaciones, setOcupaciones] = useState([])

    useEffect(() => {
        if (!fechaSalida || (idVehiculos.length === 0 && idConductores.length === 0)) {
            setOcupaciones([])
            return
        }
        let cancelado = false
        getDisponibilidadSalida({ idVehiculos, idConductores, idSalidaExcluir })
            .then(res => { if (!cancelado) setOcupaciones(res?.data || []) })
            .catch(() => { if (!cancelado) setOcupaciones([]) })
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idVehiculos.join(','), idConductores.join(','), fechaSalida, idSalidaExcluir, refrescarKey])

    return useMemo(() => {
        const idVehiculosOcupados = new Set()
        const idConductoresOcupados = new Set()
        const idVehiculosProyectadosFuera = new Set()
        const idConductoresProyectadosFuera = new Set()
        if (!fechaSalida) return { idVehiculosOcupados, idConductoresOcupados, idVehiculosProyectadosFuera, idConductoresProyectadosFuera }

        const llegadaCandidata = fechaLlegadaEstimada || fechaSalida
        for (const o of ocupaciones) {
            const otraLlegada = o.fechaLlegadaEstimada || o.fechaSalida
            const chocaPorInicioB = fechaSalida < sumarDias(otraLlegada, GAP_TRANSICION)
            const chocaPorInicioOtra = o.fechaSalida < sumarDias(llegadaCandidata, GAP_TRANSICION)
            if (chocaPorInicioB && chocaPorInicioOtra) {
                if (o.idVehiculo) idVehiculosOcupados.add(o.idVehiculo)
                if (o.idConductor) idConductoresOcupados.add(o.idConductor)
            }
        }

        const ultimaVehiculoAntes = masTardiaAntesDe(ocupaciones, 'idVehiculo', fechaSalida, horaSalida)
        const ultimaConductorAntes = masTardiaAntesDe(ocupaciones, 'idConductor', fechaSalida, horaSalida)
        for (const [id, o] of ultimaVehiculoAntes) if (!o.idSalidaIda) idVehiculosProyectadosFuera.add(id)
        for (const [id, o] of ultimaConductorAntes) if (!o.idSalidaIda) idConductoresProyectadosFuera.add(id)

        return { idVehiculosOcupados, idConductoresOcupados, idVehiculosProyectadosFuera, idConductoresProyectadosFuera }
    }, [ocupaciones, fechaSalida, horaSalida, fechaLlegadaEstimada])
}
