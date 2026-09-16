import { useState, useEffect } from 'react'
import * as ventaService from '../../ventas/services/ventaService.js'

// Cuántos paquetes tiene asignados cada par vehículo+conductor de la salida elegida —
// solo para avisar (no bloquear) si el par elegido para el anticipo va a salir vacío.
//
// Devuelve también `loading`: cuando la salida tiene un solo vehículo/conductor,
// useAutoSeleccionParUnico() lo autoselecciona de inmediato (síncrono, mismo tick que el
// cambio de idSalida), pero este hook consulta getEncomiendas() de forma asíncrona --
// hasta que esa respuesta llega, paquetesPorPar sigue vacío (o con el conteo de la salida
// anterior), así que el aviso "este vehículo no tiene paquetes asignados" de
// PasoRutaVehiculo.jsx se encendía en falso por un instante para un vehículo que sí tenía
// paquetes, hasta que el fetch resolvía y lo apagaba. El caller debe esperar a
// `!loading` antes de decidir si mostrar ese aviso.
export function usePaquetesPorPar(idSalida) {
    const [paquetesPorPar, setPaquetesPorPar] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!idSalida) return
        let cancelado = false
        // Función interna en vez de llamar setState directo en el cuerpo del efecto --
        // mismo orden de ejecución, pero así el linter (react-hooks/set-state-in-effect)
        // no confunde el reseteo de loading previo al fetch con una mutación "impura".
        const cargarConteo = () => {
            setLoading(true)
            ventaService.getEncomiendas(undefined, { idSalida, limit: 100 })
                .then(res => {
                    if (cancelado) return
                    const conteo = (res?.data || [])
                        .flatMap(v => v.paquetes || [])
                        .reduce((acc, p) => {
                            acc[p.idSalidaVehiculoConductor] = (acc[p.idSalidaVehiculoConductor] || 0) + 1
                            return acc
                        }, {})
                    setPaquetesPorPar(conteo)
                })
                .catch(() => setPaquetesPorPar({}))
                .finally(() => { if (!cancelado) setLoading(false) })
        }
        cargarConteo()
        return () => { cancelado = true }
    }, [idSalida])

    // Sin salida elegida no hay nada que contar -- se deriva en vez de resetear el
    // estado con un setState síncrono dentro del efecto de arriba (evita un render en
    // cascada).
    if (!idSalida) return { paquetesPorPar: {}, loading: false }
    return { paquetesPorPar, loading }
}
