import { useState, useEffect } from 'react'
import * as anticipoService from '../services/anticipoService.js'

// Anticipos "activos" = habilitado:true + estado en {Entregado, En Legalización} — mismo
// criterio que usa anticipoService.js del backend (create()/update()) para decidir si un
// conductor "ya tiene anticipo" en una ruta. Se usa para no ofrecer en el buscador de
// Registrar/Editar Anticipo una ruta (o un par vehículo-conductor puntual) que el backend
// de todas formas iba a rechazar — antes solo se sabía al final, con el error 409 ya en
// el paso de Confirmación.
//
// Fetch propio (no el `anticipos` del contexto, que solo trae los 5 más recientes para
// otra pantalla) — se pide fresco cada vez que se abre el wizard, paginando si hace falta
// (el backend topa `limit` en 100 por página, ver anticipoExcedenteController.js).
//
// `excluirIdAnticipo`: en Editar, el propio anticipo que se está editando no debe contar
// contra sí mismo (mismo criterio que el backend con `idAnticipoExcedente: Op.ne` en
// update()) — si no, la ruta/conductor de ESTE anticipo se autoexcluirían del selector.
export function useAnticiposActivos({ excluirIdAnticipo } = {}) {
    const [activos, setActivos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelado = false
        const cargarTodo = async () => {
            setLoading(true)
            try {
                let pagina = 1
                let acumulado = []
                let total = Infinity
                while (acumulado.length < total) {
                    const res = await anticipoService.getAnticipos(undefined, {
                        estado: 'Entregado,En Legalización', habilitado: 'true', page: pagina, limit: 100,
                    })
                    const datos = res?.data || []
                    total = res?.total ?? datos.length
                    acumulado = acumulado.concat(datos)
                    if (datos.length === 0) break
                    pagina += 1
                }
                if (!cancelado) setActivos(acumulado)
            } catch {
                if (!cancelado) setActivos([])
            } finally {
                if (!cancelado) setLoading(false)
            }
        }
        cargarTodo()
        return () => { cancelado = true }
    }, [])

    const clave = (idRuta, idConductor) => `${idRuta}-${idConductor}`
    const activosPorRutaConductor = new Set(
        activos
            .filter(a => a.idAnticipoExcedente !== excluirIdAnticipo)
            .map(a => clave(a.idRuta, a.idConductor))
    )
    const tieneAnticipoActivo = (idRuta, idConductor) => activosPorRutaConductor.has(clave(idRuta, idConductor))

    // Oculta del buscador de Ruta las que ya no tienen NINGÚN par disponible (todos sus
    // conductores ya tienen anticipo activo en ella). Si le queda al menos un par sin
    // anticipo, la ruta se sigue mostrando normal.
    const filtrarRutasDisponibles = (rutas) => (rutas || []).filter(r =>
        (r.paresVehiculoConductor || []).some(p => !tieneAnticipoActivo(r.idRuta, p.idConductor))
    )

    // Del select de "Vehículo y conductor" de la ruta ya elegida, solo los pares sin
    // anticipo activo — los que ya tienen uno no aparecen ahí, ni deshabilitados.
    const filtrarParesDisponibles = (pares, idRuta) => (pares || []).filter(p => !tieneAnticipoActivo(idRuta, p.idConductor))

    return { loading, tieneAnticipoActivo, filtrarRutasDisponibles, filtrarParesDisponibles }
}
