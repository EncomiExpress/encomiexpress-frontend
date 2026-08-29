// overflowHidden: solo ActualizarAnticipoExcedente agrega minWidth:0/overflow:hidden a su
// card de confirmación (evita que el contenido largo la desborde) -- diferencia real
// preexistente entre ambos wizards, no un descuido.
export const cardSx = (theme, { overflowHidden = false } = {}) => ({
    flex: 1, borderRadius: 2, p: 2.5,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    ...(overflowHidden ? { minWidth: 0, overflow: 'hidden' } : {}),
})
