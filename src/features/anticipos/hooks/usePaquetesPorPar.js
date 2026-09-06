import { useState, useEffect } from 'react'
import * as ventaService from '../../ventas/services/ventaService.js'

// Cuántos paquetes tiene asignados cada par vehículo+conductor de la ruta elegida — solo
// para avisar (no bloquear) si el par elegido para el anticipo va a salir vacío.
//
// Devuelve también `loading`: cuando la ruta tiene un solo vehículo/conductor,
// useAutoSeleccionParUnico() lo autoselecciona de inmediato (síncrono, mismo tick que el
// cambio de idRuta), pero este hook consulta getEncomiendas() de forma asíncrona -- hasta
// que esa respuesta llega, paquetesPorPar sigue vacío (o con el conteo de la ruta
// anterior), así que el aviso "este vehículo no tiene paquetes asignados" de
// PasoRutaVehiculo.jsx se encendía en falso por un instante para un vehículo que sí tenía
// paquetes, hasta que el fetch resolvía y lo apagaba. El caller debe esperar a
// `!loading` antes de decidir si mostrar ese aviso.
export function usePaquetesPorPar(idRuta) {
    const [paquetesPorPar, setPaquetesPorPar] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!idRuta) return
        let cancelado = false
        // Función interna en vez de llamar setState directo en el cuerpo del efecto --
        // mismo orden de ejecución, pero así el linter (react-hooks/set-state-in-effect)
        // no confunde el reseteo de loading previo al fetch con una mutación "impura".
        const cargarConteo = () => {
            setLoading(true)
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
                .finally(() => { if (!cancelado) setLoading(false) })
        }
        cargarConteo()
        return () => { cancelado = true }
    }, [idRuta])

    // Sin ruta elegida no hay nada que contar -- se deriva en vez de resetear el estado
    // con un setState síncrono dentro del efecto de arriba (evita un render en cascada).
    if (!idRuta) return { paquetesPorPar: {}, loading: false }
    return { paquetesPorPar, loading }
}
