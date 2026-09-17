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

export const useDisponibilidadPares = ({ idVehiculos = [], idConductores = [], fechaSalida, fechaLlegadaEstimada, idSalidaExcluir, refrescarKey }) => {
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
        if (!fechaSalida) return { idVehiculosOcupados, idConductoresOcupados }

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
        return { idVehiculosOcupados, idConductoresOcupados }
    }, [ocupaciones, fechaSalida, fechaLlegadaEstimada])
}
