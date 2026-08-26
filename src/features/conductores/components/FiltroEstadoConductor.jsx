import { Select, MenuItem, FormControl } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'

const ESTADOS_CONDUCTOR = ['Disponible', 'En Ruta']

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

const FiltroEstadoConductor = ({ theme, filtroEstado, setFiltroEstado, setPage }) => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
            displayEmpty
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPage(1) }}
            renderValue={v => v || 'Estado'}
            IconComponent={KeyboardArrowDownOutlinedIcon}
            sx={{
                fontSize: '0.82rem',
                borderRadius: 4,
                color: filtroEstado ? theme.palette.text.primary : theme.palette.text.secondary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
                '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
                '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
                '& .MuiTouchRipple-root': { display: 'none' },
            }}
            MenuProps={getFilterMenuProps(theme)}>
            <MenuItem value="">Todos</MenuItem>
            {ESTADOS_CONDUCTOR.map(e => (
                <MenuItem key={e} value={e}>
                    {e}
                    {filtroEstado === e && <CheckOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
)

export default FiltroEstadoConductor
