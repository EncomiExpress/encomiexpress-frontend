import { useState, useEffect } from 'react'
import { getRutas } from '../../rutas/services/rutaService.js'

// Consulta dedicada y fresca (no la lista paginada de Rutas, que puede no traer
// todas las rutas En Ruta). A diferencia de Conductor, Vehiculo sí tiene una vía
// para cambiar `estado` a mano ("Mantenimiento", ver useVehiculoColumns.jsx) sin
// pasar por la cascada de rutaService — este cruce en vivo evita que un vehículo
// se vea "Disponible"/"Mantenimiento" mientras en el servidor sigue en una ruta activa.
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
