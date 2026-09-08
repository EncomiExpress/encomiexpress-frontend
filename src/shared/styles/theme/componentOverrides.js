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
      // Scrollbar delgado y discreto en toda la app (Firefox + Chromium), en vez del
      // nativo del navegador que se veía grueso y muy llamativo — mismo criterio de
      // color que ya usaba el scrollbar del Sidebar (colors.divider).
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${pal.border.hover} transparent`,
      },
      '*::-webkit-scrollbar': {
        width: 8,
        height: 8,
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: pal.border.hover,
        borderRadius: 8,
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: pal.text.secondary,
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
  MuiTableCell: {
    styleOverrides: {
      // Por defecto MUI no usa palette.divider tal cual: aclara el color en modo claro
      // y lo OSCURECE en modo oscuro (darken ~68%), lo que sobre un fondo ya oscuro
      // volvía la línea divisoria entre filas prácticamente invisible. Se fuerza el
      // mismo divider del tema en los dos modos, igual que ya hacía getThStyle()
      // (DataTable.jsx) para el encabezado.
      root: {
        borderBottom: `1px solid ${pal.divider}`,
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
