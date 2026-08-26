import { useState, useEffect } from 'react'
import * as ventaService from '../../ventas/services/ventaService.js'

// Cuántos paquetes tiene asignados cada par vehículo+conductor de la ruta elegida — solo
// para avisar (no bloquear) si el par elegido para el anticipo va a salir vacío.
export function usePaquetesPorPar(idRuta) {
    const [paquetesPorPar, setPaquetesPorPar] = useState({})

    useEffect(() => {
        if (!idRuta) {
            setPaquetesPorPar({})
            return
        }
        let cancelado = false
        ventaService.getEncomiendas(undefined, { idRuta, limit: 100 })
            .then(res => {
                if (cancelado) return
                const conteo = (res?.data || [])
                    .flatMap(v => v.paquetes || [])
                    .reduce((acc, p) => {
                        acc[p.idRutaVehiculoConductor] = (acc[p.idRutaVehiculoConductor] || 0) + 1
                        return acc
                    }, {})
                setPaquetesPorPar(conteo)
            })
            .catch(() => setPaquetesPorPar({}))
        return () => { cancelado = true }
    }, [idRuta])

    return paquetesPorPar
}
