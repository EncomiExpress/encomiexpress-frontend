// ─────────────────────────────────────────────
//  Overrides de componentes MUI — dependen de la paleta ya
//  resuelta (pal) y del modo activo, para adaptar colores/estados.
// ─────────────────────────────────────────────

export const getComponentOverrides = (pal, mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      'input[type="date"]::-webkit-calendar-picker-indicator': {
        filter: mode === 'dark' ? 'invert(1)' : 'none',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      containedPrimary: {
        backgroundColor: pal.primary.main,
        '&:hover': {
          backgroundColor: pal.primary.dark,
          boxShadow: `0 6px 20px ${pal.primary.main}33`,
        },
        '&.Mui-disabled': {
          backgroundColor: pal.divider,
          color: pal.text.disabled,
        },
      },
    },
  },
  MuiStepIcon: {
    styleOverrides: {
      root: {
        color: pal.divider,
        '&.Mui-active':    { color: pal.primary.main },
        '&.Mui-completed': { color: pal.primary.main },
      },
      text: {
        fill: 'white',
        fontSize: '0.7rem',
        fontWeight: 700,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: {
        borderColor: pal.divider,
      },
      root: {
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: pal.border.hover,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: pal.primary.light,
          borderWidth: '1px',
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        '&.Mui-focused': { color: pal.primary.main },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        // MUI le suma a cualquier Paper con elevación (Dialog, Menu, Popover...) una
        // superposición blanca semitransparente en modo oscuro que se ve gris lavado —
        // se quita para que todos usen background.paper/background.default directamente.
        backgroundImage: 'none',
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: pal.primary.main,
        '&.Mui-checked':             { color: pal.primary.main },
        '&.MuiCheckbox-indeterminate': { color: pal.primary.main },
      },
    },
  },
})
