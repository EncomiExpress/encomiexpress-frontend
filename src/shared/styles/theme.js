import { createTheme } from '@mui/material/styles'

// ─────────────────────────────────────────────
//  PALETAS BASE — dos sabores: rojo y azul
//  Cada una tiene su versión light y dark.
//  Cuando implementes la selección dinámica,
//  pasa { palette: 'red'|'blue', mode: 'light'|'dark' }
//  a getTheme() y listo.
// ─────────────────────────────────────────────

const tokens = {
  red: {
    light: {
      primary:       '#CC1818',
      primaryLight:  '#FFE8E8',
      primaryDark:   '#b91c1c',
      primaryDarker: '#a01212',
      activeBg:      'rgba(204,24,24,0.08)',
      activeGrad:    'rgba(26,46,110,0.12)',   // complemento neutro para gradiente activo
      hoverBg:       'rgba(0,0,0,0.04)',        // hover neutro gris
      hoverIcon:     '#483c3a',
      hoverText:     '#1a0e0c',
      gradientNav:   'linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)',
    },
    dark: {
      primary:       '#E57373',
      primaryLight:  '#FFCDD2',
      // Red 700 (no 800): mismo salto de tono que usa el azul entre primary y primaryDark.
      primaryDark:   '#D32F2F',
      primaryDarker: '#B71C1C',
      activeBg:      'rgba(229,115,115,0.15)',
      activeGrad:    'rgba(229,115,115,0.08)',  // complemento cálido para gradiente activo
      hoverBg:       'rgba(255,255,255,0.06)',  // hover blanco muy tenue
      hoverIcon:     '#FFCDD2',
      hoverText:     '#FFFFFF',
      gradientNav:   'linear-gradient(90deg, #4FC3F7, #E57373, #4FC3F7)',
    },
  },
  blue: {
    light: {
      primary:       '#1A2E6E',
      primaryLight:  '#E8EEFF',
      primaryDark:   '#0f1c45',
      primaryDarker: '#091236',
      activeBg:      'rgba(26,46,110,0.12)',
      activeGrad:    'rgba(204,24,24,0.08)',
      hoverBg:       'rgba(0,0,0,0.04)',
      hoverIcon:     '#0f1c45',
      hoverText:     '#091236',
      gradientNav:   'linear-gradient(90deg, #CC1818, #1A2E6E, #CC1818)',
    },
    dark: {
      // Desaturado a ~69% (antes 91%) para igualar la suavidad del rojo en modo
      // oscuro — sin esto el azul se sentía mucho más eléctrico que el rojo.
      primary:       '#64BBE2',
      primaryLight:  '#BCE2F3',
      primaryDark:   '#257EAE',
      primaryDarker: '#155587',
      activeBg:      'rgba(100,187,226,0.15)',
      activeGrad:    'rgba(100,187,226,0.08)',
      hoverBg:       'rgba(255,255,255,0.06)',
      hoverIcon:     '#BCE2F3',
      hoverText:     '#FFFFFF',
      gradientNav:   'linear-gradient(90deg, #E57373, #64BBE2, #E57373)',
    },
  },
}

// ─────────────────────────────────────────────
//  Construcción de paletas MUI
// ─────────────────────────────────────────────

const buildLightPalette = (t) => ({
  mode: 'light',
  primary: {
    main:          t.primary,
    light:         t.primaryLight,
    dark:          t.primaryDark,
    darker:        t.primaryDarker,
    contrastText:  '#ffffff',
    // Expone los tokens de sidebar para consumirlos en componentes
    activeBg:      t.activeBg,
    activeGrad:    t.activeGrad,
    hoverBg:       t.hoverBg,
    hoverIcon:     t.hoverIcon,
    hoverText:     t.hoverText,
  },
  secondary: {
    main:          '#1A2E6E',
    light:         '#2a3f8f',
    dark:          '#0f1c45',
    contrastText:  '#ffffff',
  },
  background: {
    default: '#F5F6FA',
    paper:   '#ffffff',
    subtle:  '#F9F9F9',
    muted:   '#F8F9FA',
    faint:   '#FAFAFA',
    input:   '#f5f5f5',
  },
  text: {
    primary:   '#1a0e0c',
    secondary: '#8A94A6',
    disabled:  '#9E9E9E',
    hint:      '#9C4040',
    dark:      '#212121',
    medium:    '#2D3748',
    muted2:    '#6b7280',
    icon:      '#8b8382',
    iconHover: t.hoverIcon,
    nav:       '#4a3f3c',
    navHover:  t.hoverText,
  },
  divider: '#E0E0E0',
  border: {
    default: '#E0E0E0',
    hover:   '#BDBDBD',
    focused: t.primary,
    light:   '#e2e8f0',
    faint:   '#f0f0f0',
  },
  status: {
    active:           { bg: '#DCFCE7', color: '#16A34A' },
    inactive:         { bg: '#F3F4F6', color: '#9CA3AF' },
    activeText:       '#10b981',
    inactiveText:     '#dc2626',
    enabled:          { bg: '#FFCDD2', color: '#C62828' },
    disabled2:        { bg: '#E0E0E0', color: '#9CA3AF' },
    success:          { bg: '#E8F5E9', color: '#2E7D32' },
    successDark:      { bg: '#D1FAE5', color: '#065F46' },
    warning:          { bg: '#FFF8E1', color: '#F57F17' },
    warningLight:     { bg: '#FEF3C7', color: '#92400E' },
    warningAmber:     { bg: '#fef3c7', color: '#92400e' },
    error:            { bg: '#FEE2E2', color: '#991B1B' },
    errorLight:       { bg: '#FFF3F3', color: '#C62828' },
    errorPrimary:     { bg: '#FFCDD2', color: '#C62828' },
    errorBg:          '#FFECEC',
    info:             { bg: '#E3F2FD', color: '#1565C0' },
    infoBlue:         { bg: '#DBEAFE', color: '#1E40AF' },
    purple:           { bg: '#F3E5F5', color: '#6A1B9A' },
  },
  avatarDefault:  { bg: `${t.primaryLight}`, color: `${t.primaryDark}` },
  avatarDisabled: { bg: '#E0E0E0', color: '#9E9E9E' },
  gradient: {
    primary:      `linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
    primaryHover: `linear-gradient(135deg, ${t.primaryDarker} 0%, ${t.primary} 100%)`,
    navbar:       t.gradientNav,
    hero:         `linear-gradient(135deg, #f5f5f5 0%, ${t.primaryDarker} 50%)`,
  },
})

const buildDarkPalette = (t) => ({
  mode: 'dark',
  primary: {
    main:          t.primary,
    light:         t.primaryLight,
    dark:          t.primaryDark,
    darker:        t.primaryDarker,
    contrastText:  '#ffffff',
    activeBg:      t.activeBg,
    activeGrad:    t.activeGrad,
    hoverBg:       t.hoverBg,
    hoverIcon:     t.hoverIcon,
    hoverText:     t.hoverText,
  },
  secondary: {
    main:          '#C62828',
    light:         '#E57373',
    dark:          '#B71C1C',
    contrastText:  '#ffffff',
  },
  background: {
    default: '#121212',
    paper:   '#1E1E1E',
    subtle:  '#252525',
    muted:   '#2A2A2A',
    faint:   '#222222',
    input:   '#2D2D2D',
  },
  text: {
    primary:   '#E0E0E0',
    secondary: '#B8B8B8',
    disabled:  '#707070',
    hint:      '#B76E6E',
    dark:      '#FFFFFF',
    medium:    '#CCCCCC',
    muted2:    '#AAAAAA',
    icon:      '#A0A0A0',
    iconHover: t.hoverIcon,
    nav:       '#E0E0E0',
    navHover:  t.hoverText,
  },
  divider: '#444444',
  border: {
    default: '#444444',
    hover:   '#555555',
    focused: t.primary,
    light:   '#333333',
    faint:   '#2A2A2A',
  },
  status: {
    active:           { bg: '#1B5E20', color: '#4CAF50' },
    inactive:         { bg: '#424242', color: '#B0B0B0' },
    activeText:       '#4CAF50',
    inactiveText:     '#EF5350',
    enabled:          { bg: '#B71C1C', color: '#EF5350' },
    disabled2:        { bg: '#444444', color: '#909090' },
    success:          { bg: '#1B5E20', color: '#4CAF50' },
    successDark:      { bg: '#1B5E20', color: '#4CAF50' },
    warning:          { bg: '#4E3100', color: '#FFB74D' },
    warningLight:     { bg: '#4E3100', color: '#FFCC80' },
    warningAmber:     { bg: '#4E3100', color: '#FFCC80' },
    error:            { bg: '#4A1515', color: '#EF5350' },
    errorLight:       { bg: '#4A1515', color: '#EF5350' },
    errorPrimary:     { bg: '#B71C1C', color: '#EF5350' },
    errorBg:          '#4A1515',
    info:             { bg: '#0D2B4E', color: '#90CAF9' },
    infoBlue:         { bg: '#0D2B4E', color: '#90CAF9' },
    purple:           { bg: '#2D1458', color: '#CE93D8' },
  },
  avatarDefault:  { bg: `${t.primaryLight}`, color: `${t.primaryDark}` },
  avatarDisabled: { bg: '#424242', color: '#9E9E9E' },
  gradient: {
    primary:      `linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
    primaryHover: `linear-gradient(135deg, ${t.primaryDarker} 0%, ${t.primary} 100%)`,
    navbar:       t.gradientNav,
    hero:         `linear-gradient(135deg, #222222 0%, ${t.primaryDarker} 50%)`,
  },
})

// ─────────────────────────────────────────────
//  Paletas concretas (las que se usan hoy)
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  getTheme — hoy acepta solo mode,
//  en el futuro aceptará también { palette: 'red'|'blue' }
// ─────────────────────────────────────────────

export const getTheme = (mode = 'light', paletteKey = 'red') => {
  const t   = tokens[paletteKey]?.[mode] ?? tokens.red[mode]
  const pal = mode === 'dark' ? buildDarkPalette(t) : buildLightPalette(t)

  return createTheme({
    palette: pal,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
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
    },
  })
}

export const lightTheme = getTheme('light')
export const darkTheme  = getTheme('dark')

export default lightTheme