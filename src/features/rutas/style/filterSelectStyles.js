// Estilo repetido 3 veces en ListarRutaProgramacion.jsx para los Select de filtro
// (Estado/Año/Mes) -- activo: si el filtro tiene un valor elegido (texto primario) o
// sigue en su placeholder (texto secundario).
export const filterSelectSx = (theme, activo) => ({
    fontSize: '0.82rem', borderRadius: 4,
    color: activo ? theme.palette.text.primary : theme.palette.text.secondary,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '& .MuiSelect-icon': { color: theme.palette.text.secondary, fontSize: 18 },
    '& .MuiTouchRipple-root': { display: 'none' },
})
