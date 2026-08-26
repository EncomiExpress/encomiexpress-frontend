import { useEffect, useMemo, useState } from 'react'
import { getDisponibilidadRuta } from '../../features/rutas/services/rutaService.js'
import { formatFecha } from '../utils/formatters'
import { MIN_DIAS_SALIDA_LLEGADA, DIAS_MARGEN_ENTRE_RUTAS } from '../utils/horarioLaboral'

// Mismo margen que GAP_TRANSICION en rutaService.js (backend) — un vehículo o
// conductor que ya tiene otra ruta activa necesita este margen entre el final de esa
// ruta y el inicio de la nueva. Se recalcula acá para poder pintar los días
// bloqueados de una vez, sin esperar a que el usuario intente guardar.
const GAP_TRANSICION = DIAS_MARGEN_ENTRE_RUTAS

const pad2 = (n) => String(n).padStart(2, '0')
const toISO = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const parseISO = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

// Fetch + cálculo de disponibilidad de vehículo/conductor para CalendarioDisponibilidad,
// separado del render del grid. Para cada día ocupado, arma los motivos (qué
// vehículo/conductor y de qué ruta) que apliquen a los pares actuales — un mismo día
// puede tener varios motivos si hay varios pares o varias rutas cerca. La fórmula de
// choque es la misma que validarChoqueVehiculoConductor en el backend: dos rutas
// chocan si candidatoSalida < otraLlegada+GAP  Y  otraSalida < candidatoLlegada+GAP.
//
// Modo 'salida': la candidata todavía no tiene fecha de llegada, así que un día S
// se bloquea si, incluso con la llegada MÁS OPTIMISTA posible (S+MIN_DIAS_SALIDA_
// LLEGADA), la ruta ya chocaría contra esta ocupación — si ni la ventana más corta
// posible se salva, ninguna llegada más tardía lo hará tampoco.
//
// Modo 'llegada': la salida YA está fija (fechaReferencia) — el choque con esta
// ocupación entonces depende solo de si esa salida ya "resulta temprana" respecto
// al regreso de la otra ruta (primera condición, fija, no depende del día L que se
// esté evaluando); si es así, TODA fecha de llegada posterior a (otraSalida-GAP)
// queda bloqueada — no es una ventana acotada como en modo 'salida', es un bloqueo
// "de ahí en adelante" (se corta en el propio horizonte máximo del calendario).
//
// (fechaLlegadaEstimada puede venir null en rutas antiguas creadas antes de esta
// migración: se trata como ocupación de un solo día, igual que en el backend.)
export const useDisponibilidadRuta = ({ pares = [], idRutaExcluir, refrescarKey, modo = 'salida', fechaReferencia, maxDate }) => {
    const [ocupaciones, setOcupaciones] = useState([])
    const [loading, setLoading] = useState(false)

    const paresCompletos = useMemo(
        () => pares.filter(p => p.idVehiculo && p.idConductor),
        [pares]
    )
    const idVehiculos = useMemo(() => [...new Set(paresCompletos.map(p => parseInt(p.idVehiculo)))], [paresCompletos])
    const idConductores = useMemo(() => [...new Set(paresCompletos.map(p => parseInt(p.idConductor)))], [paresCompletos])

    useEffect(() => {
        if (idVehiculos.length === 0 && idConductores.length === 0) {
            setOcupaciones([])
            return
        }
        let cancelado = false
        setLoading(true)
        getDisponibilidadRuta({ idVehiculos, idConductores, idRutaExcluir })
            .then(res => { if (!cancelado) setOcupaciones(res?.data || []) })
            .catch(() => { if (!cancelado) setOcupaciones([]) })
            .finally(() => { if (!cancelado) setLoading(false) })
        return () => { cancelado = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idVehiculos.join(','), idConductores.join(','), idRutaExcluir, refrescarKey])

    const motivosPorDia = useMemo(() => {
        const mapa = new Map()
        if (modo === 'llegada' && !fechaReferencia) return mapa
        for (const o of ocupaciones) {
            const otraLlegada = o.fechaLlegadaEstimada || o.fechaSalida
            const motivos = []
            if (idVehiculos.includes(o.idVehiculo)) motivos.push(`Vehículo ${o.placa || '—'}`)
            if (idConductores.includes(o.idConductor)) motivos.push(`Conductor ${o.conductorNombre || '—'}`)
            if (motivos.length === 0) continue
            const rango = o.fechaLlegadaEstimada
                ? `del ${formatFecha(o.fechaSalida)} al ${formatFecha(o.fechaLlegadaEstimada)}`
                : `sale el ${formatFecha(o.fechaSalida)}`
            const rutaTexto = o.origen ? `${o.origen} → ${o.destino?.ciudad || 'Sin destino'}` : 'otra ruta'
            const texto = `${motivos.join(' y ')} ocupado — ${rutaTexto}, ${rango}`

            let desde, hasta
            if (modo === 'llegada') {
                const chocaPorSalidaTemprana = parseISO(fechaReferencia).getTime() < parseISO(otraLlegada).getTime() + GAP_TRANSICION * 86400000
                if (!chocaPorSalidaTemprana) continue
                desde = parseISO(o.fechaSalida).getTime() - (GAP_TRANSICION - 1) * 86400000
                hasta = maxDate ? parseISO(maxDate).getTime() : desde + 365 * 86400000
            } else {
                desde = parseISO(o.fechaSalida).getTime() - (MIN_DIAS_SALIDA_LLEGADA + GAP_TRANSICION - 1) * 86400000
                hasta = parseISO(otraLlegada).getTime() + (GAP_TRANSICION - 1) * 86400000
            }
            for (let t = desde; t <= hasta; t += 86400000) {
                const iso = toISO(new Date(t))
                if (!mapa.has(iso)) mapa.set(iso, [])
                mapa.get(iso).push(texto)
            }
        }
        return mapa
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ocupaciones, idVehiculos.join(','), idConductores.join(','), modo, fechaReferencia, maxDate])

    return { motivosPorDia, loading, idVehiculos, idConductores }
}
