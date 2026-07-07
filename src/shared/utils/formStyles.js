export const formFieldStyles = (theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${theme.palette.primary.activeBg}` },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1px' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.primary.light} inset`,
      WebkitTextFillColor: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
})
