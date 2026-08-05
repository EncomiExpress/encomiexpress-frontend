export const formFieldStyles = (theme) => ({
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
