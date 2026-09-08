import { useState, useEffect } from 'react'
import { getRutas } from '../services/rutaService.js'

// Sugiere las paradas intermedias más repetidas entre las rutas anteriores hacia
// el mismo destino final -- para no volver a armarlas a mano cada vez que se
// programa una ruta hacia un municipio que ya se recorre seguido (ej. Medellín ->
// Caucasia casi siempre pasa por Zaragoza y El Bagre). Solo cuenta un patrón de
// paradas REAL (no vacío): si lo más común hacia ese destino es "sin paradas", no
// hay nada que autocompletar y no se sugiere nada. Tampoco se sugiere un patrón
// que solo aparezca una vez en el histórico -- una sola coincidencia no alcanza
// para llamarlo "lo que más se usa".
//
// idRutaExcluir (opcional, solo Actualizar): la propia ruta que se está editando
// no debe contar como "histórico" de sí misma.
export const useSugerenciaParadas = (idDestino, { idRutaExcluir } = {}) => {
    const [sugerencia, setSugerencia] = useState(null)

    useEffect(() => {
        if (!idDestino) { setSugerencia(null); return }
        let cancelado = false
        getRutas({ idDestino, limit: 100 })
            .then(res => {
                if (cancelado) return
                const rutas = (res?.data || []).filter(r => (r.idRuta ?? r.idRutaProgramada) !== idRutaExcluir)
                const conteo = new Map()
                for (const r of rutas) {
                    const paradas = (r.paradas || []).filter(p => p.destino)
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
    }, [idDestino, idRutaExcluir])

    return sugerencia // null | { ids: [idDestino, ...], municipios: [nombre, ...], count }
}

export default useSugerenciaParadas
