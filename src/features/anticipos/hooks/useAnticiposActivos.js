import { useState, useEffect, useCallback } from 'react'
import * as anticipoService from '../services/anticipoService.js'

// Anticipos "activos" = habilitado:true + estado en {Entregado, En Legalización} — mismo
// criterio que usa anticipoService.js del backend (create()/update()) para decidir si un
// conductor "ya tiene anticipo" en una salida. Se usa para no ofrecer en el buscador de
// Registrar/Editar Anticipo una salida (o un par vehículo-conductor puntual) que el
// backend de todas formas iba a rechazar — antes solo se sabía al final, con el error
// 409 ya en el paso de Confirmación.
//
// Fetch propio (no el `anticipos` del contexto, que solo trae los 5 más recientes para
// otra pantalla) — se pide fresco cada vez que se abre el wizard, paginando si hace falta
// (el backend topa `limit` en 100 por página, ver anticipoExcedenteController.js).
//
// `excluirIdAnticipo`: en Editar, el propio anticipo que se está editando no debe contar
// contra sí mismo (mismo criterio que el backend con `idAnticipoExcedente: Op.ne` en
// update()) — si no, la salida/conductor de ESTE anticipo se autoexcluirían del selector.
export function useAnticiposActivos({ excluirIdAnticipo } = {}) {
    const [activos, setActivos] = useState([])
    const [loading, setLoading] = useState(true)

    // Expuesto como `refetchActivos` para que Registrar/Editar Anticipo lo vuelvan a
    // llamar cada vez que el wizard se abre (mismo patrón que `fetchRutasProgramadas`
    // para "rutas") -- sin esto, como esos wizards quedan montados de forma permanente
    // en ListarAnticipoExcedente.jsx (solo alternan `open`, nunca se remontan), esta
    // lista se traía una sola vez al cargar la página y nunca se refrescaba: un
    // anticipo recién registrado en esta misma sesión no bloqueaba su propio par en el
    // selector hasta recargar la página entera -- el backend lo rechazaba igual (409),
    // pero recién al final, en Confirmación, en vez de no ofrecerlo desde un principio.
    const cargarActivos = useCallback(async () => {
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
            setActivos(acumulado)
        } catch {
            setActivos([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        cargarActivos()
    }, [cargarActivos])

    const clave = (idSalida, idConductor) => `${idSalida}-${idConductor}`
    const activosPorRutaConductor = new Set(
        activos
            .filter(a => a.idAnticipoExcedente !== excluirIdAnticipo)
            .map(a => clave(a.idSalida, a.idConductor))
    )
    const tieneAnticipoActivo = (idSalida, idConductor) => activosPorRutaConductor.has(clave(idSalida, idConductor))

    // Oculta del buscador de Salida las que ya no tienen NINGÚN par disponible (todos sus
    // conductores ya tienen anticipo activo en ella). Si le queda al menos un par sin
    // anticipo, la salida se sigue mostrando normal.
    const filtrarRutasDisponibles = (salidas) => (salidas || []).filter(r =>
        (r.paresVehiculoConductor || []).some(p => !tieneAnticipoActivo(r.idSalida, p.idConductor))
    )

    // Del select de "Vehículo y conductor" de la salida ya elegida, solo los pares sin
    // anticipo activo — los que ya tienen uno no aparecen ahí, ni deshabilitados.
    const filtrarParesDisponibles = (pares, idSalida) => (pares || []).filter(p => !tieneAnticipoActivo(idSalida, p.idConductor))

    return { loading, tieneAnticipoActivo, filtrarRutasDisponibles, filtrarParesDisponibles, refetchActivos: cargarActivos }
}
