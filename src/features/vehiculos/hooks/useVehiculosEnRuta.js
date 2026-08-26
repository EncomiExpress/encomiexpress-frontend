import { useState, useEffect } from 'react'
import { getRutas } from '../../rutas/services/rutaService.js'

// Consulta dedicada y fresca (no la lista paginada de Rutas, que puede no traer
// todas las rutas En Ruta) — mismo patrón que conductores/hooks/useConductoresEnRuta.js.
const useVehiculosEnRuta = (transportes, usuario) => {
    const [vehiculosOcupadosIds, setVehiculosOcupadosIds] = useState(new Set())

    useEffect(() => {
        if (!usuario) return
        getRutas({ estado: 'En Ruta', habilitado: 'true', limit: 100 })
            .then(res => setVehiculosOcupadosIds(new Set((res?.data || []).flatMap(r => (r.paresVehiculoConductor || []).map(p => p.idVehiculo)))))
            .catch(() => { })
    }, [usuario])

    const transportesConEstado = transportes.map(t => {
        const estaOcupado = vehiculosOcupadosIds.has(t.idVehiculo)
        return {
            ...t,
            estadoEfectivo: estaOcupado ? 'En Ruta' : t.estado,
        }
    })

    return { vehiculosOcupadosIds, transportesConEstado }
}

export default useVehiculosEnRuta
