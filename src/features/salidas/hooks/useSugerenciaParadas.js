import { useState, useEffect } from 'react'
import { getSalidas } from '../services/salidaService.js'

// Sugiere las paradas intermedias más repetidas entre las salidas anteriores hacia
// el mismo destino final -- para no volver a armarlas a mano cada vez que se
// programa una salida hacia un municipio que ya se recorre seguido (ej. Medellín ->
// Caucasia casi siempre pasa por Zaragoza y El Bagre). El backend sigue aceptando
// `idDestino` como filtro de /salidas (lo traduce a una subconsulta contra la
// plantilla, ver buildRutaWhere en salidaProgramadaService.js), así que no hace
// falta filtrar por idRuta -- varias plantillas hacia el mismo destino comparten
// historial de paradas. Solo cuenta un patrón de paradas REAL (no vacío) y que se
// repita al menos 2 veces.
//
// idSalidaExcluir (opcional, solo Actualizar): la propia salida que se está editando
// no debe contar como "histórico" de sí misma.
//
// DECISIÓN: las paradas ahora son propias de CADA par vehículo+conductor (no un
// array a nivel de la salida completa) -- para no complicar el patrón histórico con
// "¿de cuál par de cada salida pasada?", el conteo solo mira el recorrido del
// PRIMER par de cada salida anterior (paresVehiculoConductor[0].paradas), igual
// criterio que ya usa el wizard para decidir a qué par ofrecerle la sugerencia
// (ver RegistrarSalidaProgramada.jsx).
export const useSugerenciaParadas = (idDestino, { idSalidaExcluir } = {}) => {
    const [sugerencia, setSugerencia] = useState(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicio de estado al perder el destino, mismo patrón que otros efectos de fetch en el proyecto
        if (!idDestino) { setSugerencia(null); return }
        let cancelado = false
        getSalidas({ idDestino, limit: 100 })
            .then(res => {
                if (cancelado) return
                const salidas = (res?.data || []).filter(s => s.idSalida !== idSalidaExcluir)
                const conteo = new Map()
                for (const s of salidas) {
                    const paradas = (s.paresVehiculoConductor?.[0]?.paradas || []).filter(p => p.destino)
                    if (paradas.length === 0) continue
                    const key = paradas.map(p => p.idDestino).join(',')
                    if (!conteo.has(key)) {
                        conteo.set(key, {
                            ids: paradas.map(p => p.idDestino),
                            municipios: paradas.map(p => p.destino.municipio),
                            count: 0,
                        })
                    }
                    conteo.get(key).count += 1
                }
                const [mejor] = [...conteo.values()].sort((a, b) => b.count - a.count)
                setSugerencia(mejor && mejor.count >= 2 ? mejor : null)
            })
            .catch(() => { if (!cancelado) setSugerencia(null) })
        return () => { cancelado = true }
    }, [idDestino, idSalidaExcluir])

    return sugerencia // null | { ids: [idDestino, ...], municipios: [nombre, ...], count }
}

export default useSugerenciaParadas
