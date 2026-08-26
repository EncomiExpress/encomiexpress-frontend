// Este módulo no usa wizard/Stepper (es un formulario de una sola pantalla), así que
// solo necesita los estilos de los dos botones del pie del diálogo.

// A diferencia de los demás módulos, el botón Cancelar aquí lleva borde y padding
// horizontal propio (no es un botón "de texto" plano).
export const cancelButtonSx = (theme) => ({
    textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    px: 2.5,
    '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
})

export const primaryButtonSx = (theme, { minWidth = 160 } = {}) => ({
    textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
    '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
})
