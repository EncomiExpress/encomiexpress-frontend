import { Select, MenuItem, FormControl, Tooltip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { filterSelectSx } from '../style/filterSelectStyles.js'

const ESTADOS_RUTA = ['Programada', 'En Ruta', 'Completada', 'Cancelada']
// No es un estado real de la ruta — es un pseudo-filtro (el backend lo traduce a
// "Completada + sin regreso enlazado + convoy fuera de base"). Ver LOGICA.md,
// "Rutas — filtro 'Regreso pendiente'".
const ESTADO_REGRESO_PENDIENTE = 'Regreso pendiente'
// Tampoco es un estado real — toda ruta que ES un viaje de regreso (idRutaIda no
// nulo), mismo criterio que ya pinta el chip "Viaje de regreso" del listado.
const ESTADO_VIAJE_REGRESO = 'Viaje de regreso'

const MESES = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
]

const getFilterMenuProps = (theme) => ({
    slotProps: {
        paper: {
            sx: {
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                    fontSize: '0.82rem',
                    py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const FiltroRuta = ({
    theme,
    filtroEstadoRuta, setFiltroEstadoRuta,
    filtroAnio, setFiltroAnio,
    filtroMes, setFiltroMes,
    aniosDisponibles, setPage,
}) => {
    const filterMenuProps = getFilterMenuProps(theme)

    return (
        <>
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                    displayEmpty
                    value={filtroEstadoRuta}
                    onChange={e => { setFiltroEstadoRuta(e.target.value); setPage(1) }}
                    renderValue={v => v || 'Estado'}
                    IconComponent={KeyboardArrowDownOutlinedIcon}
                    sx={filterSelectSx(theme, !!filtroEstadoRuta)}
                    MenuProps={filterMenuProps}>
                    <MenuItem value="">Todos</MenuItem>
                    {ESTADOS_RUTA.map(e => (
                        <MenuItem key={e} value={e}>
                            {e}
                            {filtroEstadoRuta === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                        </MenuItem>
                    ))}
                    <MenuItem value={ESTADO_REGRESO_PENDIENTE}
                        sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                        {ESTADO_REGRESO_PENDIENTE}
                        {filtroEstadoRuta === ESTADO_REGRESO_PENDIENTE && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                    </MenuItem>
                    <MenuItem value={ESTADO_VIAJE_REGRESO}>
                        {ESTADO_VIAJE_REGRESO}
                        {filtroEstadoRuta === ESTADO_VIAJE_REGRESO && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                    </MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                    value={filtroAnio}
                    onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                    displayEmpty
                    renderValue={v => v || 'Año'}
                    IconComponent={KeyboardArrowDownOutlinedIcon}
                    sx={filterSelectSx(theme, !!filtroAnio)}
                    MenuProps={filterMenuProps}>
                    <MenuItem value="">Año</MenuItem>
                    {aniosDisponibles.map(anio => (
                        <MenuItem key={anio} value={String(anio)}>
                            {anio}
                            {filtroAnio === String(anio) && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Tooltip title={filtroAnio ? '' : 'Primero elige un año'}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filtroMes}
                        onChange={(e) => { setFiltroMes(e.target.value); setPage(1) }}
                        displayEmpty
                        disabled={!filtroAnio}
                        renderValue={v => v ? (MESES.find(m => m.value === v)?.label || v) : (filtroAnio ? 'Todos' : 'Mes')}
                        IconComponent={KeyboardArrowDownOutlinedIcon}
                        sx={filterSelectSx(theme, !!filtroMes)}
                        MenuProps={filterMenuProps}>
                        <MenuItem value="">{filtroAnio ? 'Todos' : 'Mes'}</MenuItem>
                        {MESES.map(m => (
                            <MenuItem key={m.value} value={m.value}>
                                {m.label}
                                {filtroMes === m.value && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Tooltip>
        </>
    )
}

export default FiltroRuta
