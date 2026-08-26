import { Select, MenuItem, FormControl, Tooltip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

const ESTADOS_ANTICIPO = ['Entregado', 'En Legalización', 'Excedente pendiente', 'Completado']

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
                    fontSize: '0.82rem', py: 0.9, px: 2,
                    display: 'flex', justifyContent: 'space-between', gap: 2,
                    '&:hover': { backgroundColor: theme.palette.primary.activeBg },
                    '&.Mui-selected': { backgroundColor: 'transparent', fontWeight: 600, color: theme.palette.text.primary },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.activeBg },
                },
            },
        },
    },
})

const selectSx = (theme, value) => ({
    fontSize: '0.82rem', borderRadius: 4,
    color: value ? theme.palette.text.primary : theme.palette.text.secondary,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
})

const FiltroAnticipo = ({
    theme,
    filtroEstadoAnticipo, setFiltroEstadoAnticipo,
    filtroAnio, setFiltroAnio,
    filtroMes, setFiltroMes,
    aniosDisponibles, setPage,
}) => {
    const filterMenuProps = getFilterMenuProps(theme)

    return (
        <>
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                    displayEmpty
                    value={filtroEstadoAnticipo}
                    onChange={e => { setFiltroEstadoAnticipo(e.target.value); setPage(1) }}
                    renderValue={v => v || 'Estado'}
                    IconComponent={KeyboardArrowDownOutlinedIcon}
                    sx={selectSx(theme, filtroEstadoAnticipo)}
                    MenuProps={filterMenuProps}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {ESTADOS_ANTICIPO.map(e => (
                        <MenuItem key={e} value={e}>
                            {e}
                            {filtroEstadoAnticipo === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                    value={filtroAnio}
                    onChange={(e) => { setFiltroAnio(e.target.value); setFiltroMes(''); setPage(1) }}
                    displayEmpty
                    renderValue={v => v || 'Año'}
                    IconComponent={KeyboardArrowDownOutlinedIcon}
                    sx={selectSx(theme, filtroAnio)}
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
                        sx={selectSx(theme, filtroMes)}
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

export default FiltroAnticipo
