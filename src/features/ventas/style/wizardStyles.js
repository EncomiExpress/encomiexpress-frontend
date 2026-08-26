export const cardSx = (theme) => ({
    flex: 1, minWidth: 0, borderRadius: 2, p: 2.5,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper, overflow: 'hidden',
})

export const stepperSx = (theme) => ({
    mb: 3, mt: 2,
    '& .MuiStepIcon-root': { color: theme.palette.divider },
    '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main },
    '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main },
    '& .MuiStepIcon-text': { fill: 'white', fontSize: '0.7rem', fontWeight: 700 },
    '& .MuiStepConnector-line': { borderColor: theme.palette.divider },
    '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
    '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.primary.main },
    '& .MuiStepLabel-label': { fontSize: '0.8rem', color: theme.palette.text.secondary, mt: 0.5 },
    '& .MuiStepLabel-label.Mui-active': { color: theme.palette.text.primary, fontWeight: 600 },
    '& .MuiStepLabel-label.Mui-completed': { color: theme.palette.primary.main, fontWeight: 500 },
})

export const backButtonSx = (theme) => ({
    textTransform: 'none', borderRadius: 2, borderColor: theme.palette.divider,
    color: theme.palette.text.primary, fontWeight: 500,
    '&:hover': { borderColor: theme.palette.divider, backgroundColor: theme.palette.background.subtle },
    '&.Mui-disabled': { borderColor: theme.palette.divider, color: theme.palette.text.secondary },
})

export const cancelButtonSx = (theme) => ({
    textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
    '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
})

// disabledHex: Registrar usa colores hex fijos para el estado deshabilitado; Actualizar
// usa tokens del theme -- diferencia real preexistente entre ambos wizards.
export const primaryButtonSx = (theme, { minWidth = 160, disabledHex = false } = {}) => ({
    textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
    '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
    '&.Mui-disabled': disabledHex
        ? { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
        : { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
})
