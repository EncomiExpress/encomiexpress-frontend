export const formFieldStyles = (theme) => ({
  // Deja que el campo se encoja bajo el ancho de su contenido cuando vive en un grid
  // o flex (columnas 1fr): sin esto, el valor seleccionado de un <Select> con etiqueta
  // larga (ej. "Permiso por Protección Temporal (PPT)") ensancha su columna y aplasta
  // las demás. Con minWidth 0, MUI recorta ese texto con "…".
  minWidth: 0,
  '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.input} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
  // Los placeholders de ejemplo ("Ej: ...") por defecto se veían casi tan oscuros
  // como un valor ya escrito — parecía que el campo ya estaba lleno. Se baja la
  // opacidad para que se note claramente que es solo un ejemplo, no un valor real.
  '& input::placeholder, & textarea::placeholder': { opacity: '0.25 !important' },
})
