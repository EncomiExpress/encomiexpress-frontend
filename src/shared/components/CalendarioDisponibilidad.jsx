import { useEffect, useMemo, useState } from 'react'
import { Box, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined'
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import { getDisponibilidadRuta } from '../services/rutaService'
import { formatFecha } from '../utils/formatters'
import { MIN_DIAS_SALIDA_LLEGADA, DIAS_MARGEN_ENTRE_RUTAS } from '../utils/horarioLaboral'

// Mismo margen que GAP_TRANSICION en rutaService.js (backend) — un vehículo o
// conductor que ya tiene otra ruta activa necesita este margen entre el final de esa
// ruta y el inicio de la nueva. Se recalcula acá para poder pintar los días
// bloqueados de una vez, sin esperar a que el usuario intente guardar.
const GAP_TRANSICION = DIAS_MARGEN_ENTRE_RUTAS

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const pad2 = (n) => String(n).padStart(2, '0')
const toISO = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const parseISO = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}
const diffDias = (isoA, isoB) => Math.round((parseISO(isoA) - parseISO(isoB)) / 86400000)

// Un vehículo/conductor ya tiene, ¿cómo se llama la parte visible del usuario para el label?

const CalendarioDisponibilidad = ({
    value,
    onChange,
    pares = [],
    idRutaExcluir,
    minDate,
    maxDate,
    label = 'Fecha de Salida',
    required = false,
    error,
    helperText,
    disabled = false,
    // 'salida': elige la fecha de salida de la ruta (llegada todavía no existe).
    // 'llegada': elige la fecha de llegada — requiere fechaReferencia (la salida ya
    // elegida) para poder calcular el choque real contra otras rutas.
    modo = 'salida',
    fechaReferencia,
    // Sin tiempo real (WebSockets) en este proyecto, la disponibilidad se trae una
    // sola vez y podría quedar desactualizada si alguien más registra otra ruta con
    // este mismo vehículo/conductor mientras el formulario sigue abierto. Cambiar este
    // valor (ej. un contador que el padre incrementa al volver a entrar al paso
    // "Horario") fuerza una nueva consulta aunque los pares no hayan cambiado.
    refrescarKey,
}) => {
    const theme = useTheme()
    const hoy = new Date()
    const [mesVisible, setMesVisible] = useState(() => {
        const base = value ? parseISO(value) : (minDate ? parseISO(minDate) : hoy)
        return new Date(base.getFullYear(), base.getMonth(), 1)
    })
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

    // Para cada día ocupado, arma los motivos (qué vehículo/conductor y de qué ruta)
    // que apliquen a los pares actuales — un mismo día puede tener varios motivos si
    // hay varios pares o varias rutas cerca. La fórmula de choque es la misma que
    // validarChoqueVehiculoConductor en el backend: dos rutas chocan si
    // candidatoSalida < otraLlegada+GAP  Y  otraSalida < candidatoLlegada+GAP.
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

    const minISO = minDate || toISO(hoy)
    const maxISO = maxDate || null

    const irMesAnterior = () => setMesVisible(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    const irMesSiguiente = () => setMesVisible(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

    const mesAnteriorDeshabilitado = useMemo(() => {
        const limite = parseISO(minISO)
        return mesVisible.getFullYear() === limite.getFullYear() && mesVisible.getMonth() === limite.getMonth()
            ? true
            : mesVisible < new Date(limite.getFullYear(), limite.getMonth(), 1)
    }, [mesVisible, minISO])

    const mesSiguienteDeshabilitado = useMemo(() => {
        if (!maxISO) return false
        const limite = parseISO(maxISO)
        return mesVisible >= new Date(limite.getFullYear(), limite.getMonth(), 1)
    }, [mesVisible, maxISO])

    // Grilla de 42 celdas (6 semanas) — días del mes anterior/siguiente quedan vacíos,
    // solo para mantener alineadas las columnas de día de semana.
    const celdas = useMemo(() => {
        const primerDia = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1)
        const inicioOffset = primerDia.getDay()
        const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate()
        const arr = []
        for (let i = 0; i < inicioOffset; i++) arr.push(null)
        for (let d = 1; d <= diasEnMes; d++) arr.push(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), d))
        while (arr.length % 7 !== 0) arr.push(null)
        return arr
    }, [mesVisible])

    const cardSx = {
        border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
        borderRadius: 2,
        p: 1.25,
        backgroundColor: theme.palette.background.paper,
    }

    return (
        <Box sx={{ width: 320 }}>
            {label && (
                <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary} sx={{ display: 'block', lineHeight: 1, mb: 0.75, ml: 0.5 }}>
                    {label}{required ? ' *' : ''}
                </Typography>
            )}
            <Box sx={{ ...cardSx, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <IconButton size="small" onClick={irMesAnterior} disabled={mesAnteriorDeshabilitado} sx={{ p: 0.5 }}>
                        <ChevronLeftOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" fontWeight={700}>
                        {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
                    </Typography>
                    <IconButton size="small" onClick={irMesSiguiente} disabled={mesSiguienteDeshabilitado} sx={{ p: 0.5 }}>
                        <ChevronRightOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, mb: 0.25 }}>
                    {DIAS_SEMANA.map(d => (
                        <Typography key={d} align="center" color={theme.palette.text.secondary} fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                            {d}
                        </Typography>
                    ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
                    {celdas.map((fecha, i) => {
                        if (!fecha) return <Box key={i} />
                        const iso = toISO(fecha)
                        const esPasado = iso < minISO
                        const esFuturoLejano = !!maxISO && iso > maxISO
                        // La empresa no atiende domingos — se trata como "cerrado" (gris, igual
                        // que un día pasado), no como "ocupado" (rojo): son conceptos distintos,
                        // uno es disponibilidad de vehículo/conductor y el otro es horario laboral.
                        const esDomingo = fecha.getDay() === 0
                        const motivos = motivosPorDia.get(iso)
                        const ocupado = !esPasado && !esFuturoLejano && !esDomingo && !!motivos
                        const cerrado = esPasado || esFuturoLejano || esDomingo
                        const bloqueado = cerrado || ocupado
                        const seleccionado = iso === value
                        const clicable = !bloqueado

                        const celda = (
                            <Box
                                onClick={() => clicable && onChange?.(iso)}
                                sx={{
                                    aspectRatio: '1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                    fontWeight: seleccionado ? 700 : 500,
                                    cursor: clicable ? 'pointer' : 'default',
                                    // "bloqueado" manda sobre "seleccionado" en los tres — si el día ya
                                    // elegido queda bloqueado al cambiar de vehículo/conductor (la fecha
                                    // ya no se limpia automáticamente), tiene que notarse en rojo sólido,
                                    // no verse igual que una selección normal.
                                    color: cerrado
                                        ? theme.palette.text.disabled
                                        : ocupado
                                            ? (seleccionado ? theme.palette.error.contrastText : theme.palette.error.main)
                                            : seleccionado
                                                ? theme.palette.primary.contrastText
                                                : theme.palette.text.primary,
                                    backgroundColor: cerrado
                                        ? 'transparent'
                                        : ocupado
                                            ? (seleccionado ? theme.palette.error.main : alpha(theme.palette.error.main, 0.12))
                                            : seleccionado
                                                ? theme.palette.primary.main
                                                : 'transparent',
                                    border: ocupado
                                        ? `1px solid ${alpha(theme.palette.error.main, seleccionado ? 0.9 : 0.4)}`
                                        : '1px solid transparent',
                                    '&:hover': clicable ? { backgroundColor: alpha(theme.palette.primary.main, 0.1) } : {},
                                }}
                            >
                                {fecha.getDate()}
                            </Box>
                        )

                        return (
                            <Box key={i}>
                                {esDomingo
                                    ? (
                                        <Tooltip title="Cerrado los domingos" arrow placement="top">
                                            {celda}
                                        </Tooltip>
                                    )
                                    : esFuturoLejano
                                        ? (
                                            <Tooltip title={`Fuera del horizonte de programación (máximo el ${formatFecha(maxISO)})`} arrow placement="top">
                                                {celda}
                                            </Tooltip>
                                        )
                                        : ocupado
                                            ? (
                                                <Tooltip title={motivos.join(' · ')} arrow placement="top">
                                                    {celda}
                                                </Tooltip>
                                            )
                                            : celda}
                            </Box>
                        )
                    })}
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                        <CircularProgress size={12} />
                        <Typography sx={{ fontSize: '0.65rem' }} color={theme.palette.text.secondary}>Consultando…</Typography>
                    </Box>
                )}

                {!loading && (idVehiculos.length > 0 || idConductores.length > 0) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: 0.5, backgroundColor: alpha(theme.palette.error.main, 0.12), border: `1px solid ${alpha(theme.palette.error.main, 0.4)}` }} />
                            <Typography sx={{ fontSize: '0.65rem' }} color={theme.palette.text.secondary}>Ocupado</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: 0.5, backgroundColor: theme.palette.primary.main }} />
                            <Typography sx={{ fontSize: '0.65rem' }} color={theme.palette.text.secondary}>Seleccionado</Typography>
                        </Box>
                    </Box>
                )}
            </Box>
            {(error || helperText) && (
                <Typography variant="caption" color={error ? 'error' : theme.palette.text.secondary} sx={{ display: 'block', mt: 0.5, ml: 0.5 }}>
                    {error || helperText}
                </Typography>
            )}
        </Box>
    )
}

export default CalendarioDisponibilidad
