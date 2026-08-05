import { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { generarSlotsHorario } from '../utils/horarioLaboral'

const pad2 = (n) => String(n).padStart(2, '0')
const parseHM = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
const formatHM = (total) => { const t = ((total % 1440) + 1440) % 1440; return `${pad2(Math.floor(t / 60))}:${pad2(t % 60)}` }

// Al pasarse de un extremo del horario laboral, salta directo al otro extremo (en vez
// de seguir sumando/restando sin límite, como haría un <input type="number"> normal) —
// ej. subir la hora estando en 19:00 (fin del horario) salta directo a 07:00 (inicio),
// no a 20:00. Mismo paso para hora (±60 min) y minuto (±1 min), ambos respetan el
// mismo rango del día elegido.
const step = (valorActual, deltaMin, rango) => {
    // Sin valor todavía: la primera flecha va directo al extremo correspondiente
    // (↑ al inicio del horario, ↓ al final), no a "inicio + un paso".
    if (!valorActual) return deltaMin > 0 ? rango.min : rango.max
    const minT = parseHM(rango.min)
    const maxT = parseHM(rango.max)
    const nuevo = parseHM(valorActual) + deltaMin
    if (nuevo > maxT) return rango.min
    if (nuevo < minT) return rango.max
    return formatHM(nuevo)
}

const soloDigitos2 = (v) => v.replace(/\D/g, '').slice(0, 2)

// Selector de hora que reemplaza el <input type="time"> nativo — el navegador no deja
// restringir qué horas aparecen en su selector, ni personalizar el comportamiento de
// las flechas del teclado (eso vive dentro del propio navegador, fuera del alcance de
// cualquier página web). Este componente vive 100% en la aplicación: al escribir se
// recorta al rango permitido al perder el foco, y las flechas ↑/↓ solo se mueven
// dentro del horario laboral del día ya elegido, saltando de un extremo al otro.
const SelectorHora = ({
    label,
    value,
    onChange,
    onBlur,
    rango,
    required = false,
    disabled = false,
    error,
    helperText,
}) => {
    const theme = useTheme()
    const [horaTexto, setHoraTexto] = useState('')
    const [minutoTexto, setMinutoTexto] = useState('')
    const [anchorMenu, setAnchorMenu] = useState(null)

    // El valor "de verdad" vive en el padre (value) — los textos locales solo existen
    // para poder mostrar un campo vacío mientras se escribe el segundo dígito, sin
    // forzar un valor a medio escribir hacia afuera. Se resincronizan cuando value
    // cambia desde afuera (elegir fecha, usar las flechas, limpiar el formulario).
    useEffect(() => {
        const [h, m] = value ? value.split(':') : ['', '']
        setHoraTexto(h || '')
        setMinutoTexto(m || '')
    }, [value])

    const inactivo = disabled || !rango

    const commit = (hTxt, mTxt) => {
        if (hTxt === '' && mTxt === '') { onChange(''); return }
        const h = Math.max(0, Math.min(23, parseInt(hTxt, 10) || 0))
        const m = Math.max(0, Math.min(59, parseInt(mTxt, 10) || 0))
        let nuevo = `${pad2(h)}:${pad2(m)}`
        if (rango) {
            const t = parseHM(nuevo)
            if (t < parseHM(rango.min)) nuevo = rango.min
            else if (t > parseHM(rango.max)) nuevo = rango.max
        }
        onChange(nuevo)
    }

    const manejarFlecha = (e, deltaMin) => {
        if (!rango) return
        e.preventDefault()
        onChange(step(value, deltaMin, rango))
    }

    const estiloInput = {
        width: 28,
        textAlign: 'center',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontFamily: 'inherit',
        padding: 0,
    }

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Typography variant="caption" fontWeight={600} color={theme.palette.text.secondary} sx={{ display: 'block', lineHeight: 1, mb: 0.75, ml: 0.5 }}>
                    {label}{required ? ' *' : ''}
                </Typography>
            )}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
                borderRadius: 2, px: 1.75, py: 1.55,
                backgroundColor: theme.palette.background.paper,
                opacity: inactivo ? 0.6 : 1,
                '&:focus-within': inactivo ? {} : { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}`, borderColor: theme.palette.primary.main },
            }}>
                <IconButton
                    size="small"
                    disabled={inactivo}
                    onClick={(e) => setAnchorMenu(e.currentTarget)}
                    sx={{ p: 0.25, flexShrink: 0 }}
                >
                    <ScheduleOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </IconButton>
                <Menu
                    anchorEl={anchorMenu}
                    open={!!anchorMenu}
                    onClose={() => setAnchorMenu(null)}
                    slotProps={{ paper: { sx: { maxHeight: 280 } } }}
                >
                    {rango && generarSlotsHorario(rango, 30).map(h => (
                        <MenuItem
                            key={h}
                            selected={h === value}
                            onClick={() => { onChange(h); setAnchorMenu(null) }}
                        >
                            {h}
                        </MenuItem>
                    ))}
                </Menu>
                <input
                    aria-label={`${label} — hora`}
                    inputMode="numeric"
                    value={horaTexto}
                    disabled={inactivo}
                    onChange={(e) => setHoraTexto(soloDigitos2(e.target.value))}
                    onBlur={() => { commit(horaTexto, minutoTexto); onBlur?.() }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') manejarFlecha(e, 60)
                        else if (e.key === 'ArrowDown') manejarFlecha(e, -60)
                    }}
                    placeholder="--"
                    style={estiloInput}
                />
                <Typography sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>:</Typography>
                <input
                    aria-label={`${label} — minuto`}
                    inputMode="numeric"
                    value={minutoTexto}
                    disabled={inactivo}
                    onChange={(e) => setMinutoTexto(soloDigitos2(e.target.value))}
                    onBlur={() => { commit(horaTexto, minutoTexto); onBlur?.() }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') manejarFlecha(e, 1)
                        else if (e.key === 'ArrowDown') manejarFlecha(e, -1)
                    }}
                    placeholder="--"
                    style={estiloInput}
                />
                {rango && (
                    <Typography sx={{ fontSize: '0.7rem', color: theme.palette.text.disabled, ml: 'auto' }}>
                        {rango.min}–{rango.max}
                    </Typography>
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

export default SelectorHora
