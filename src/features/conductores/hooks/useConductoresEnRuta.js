import { useState, useEffect } from 'react'
import * as rutaService from '../../rutas/services/rutaService.js'

const useConductoresEnRuta = (conductores, usuario) => {
    const [conductoresEnRutaIds, setConductoresEnRutaIds] = useState(new Set())

    useEffect(() => {
        if (!usuario) return
        rutaService.getRutas({ estado: 'En Ruta', habilitado: 'true', limit: 100 })
            .then(res => setConductoresEnRutaIds(new Set((res?.data || []).flatMap(r => (r.paresVehiculoConductor || []).map(p => p.idConductor)))))
            .catch(() => { })
    }, [usuario])

    const conductoresConEstado = conductores.map(c => ({
        ...c,
        estadoEfectivo: conductoresEnRutaIds.has(c.idConductor) ? 'en_ruta' : 'disponible',
    }))

    return { conductoresEnRutaIds, conductoresConEstado }
}

export default useConductoresEnRuta
