import { Select, MenuItem, FormControl } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

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

const FilterSelect = ({ theme, value, onChange, placeholder, options }) => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
            displayEmpty
            value={value}
            onChange={onChange}
            renderValue={v => v || placeholder}
            IconComponent={KeyboardArrowDownOutlinedIcon}
            sx={selectSx(theme, value)}
            MenuProps={getFilterMenuProps(theme)}>
            <MenuItem value="">Todos</MenuItem>
            {options.map(op => (
                <MenuItem key={op} value={op}>
                    {op}
                    {value === op && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
)

const FiltroVenta = ({
    theme,
    filtroEstadoEncomienda, setFiltroEstadoEncomienda, estadosEncomienda,
    filtroMetodoPago, setFiltroMetodoPago, metodosPago,
    filtroPago, setFiltroPago, estadosPago,
    setPage,
}) => (
    <>
        <FilterSelect
            theme={theme}
            value={filtroEstadoEncomienda}
            onChange={e => { setFiltroEstadoEncomienda(e.target.value); setPage(1) }}
            placeholder="Estado"
            options={estadosEncomienda}
        />
        <FilterSelect
            theme={theme}
            value={filtroMetodoPago}
            onChange={e => { setFiltroMetodoPago(e.target.value); setPage(1) }}
            placeholder="Método pago"
            options={metodosPago}
        />
        <FilterSelect
            theme={theme}
            value={filtroPago}
            onChange={e => { setFiltroPago(e.target.value); setPage(1) }}
            placeholder="Pago"
            options={estadosPago}
        />
    </>
)

export default FiltroVenta
