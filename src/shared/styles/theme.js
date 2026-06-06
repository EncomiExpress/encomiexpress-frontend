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
      primaryDark:   '#C62828',
      primaryDarker: '#B71C1C',
      activeBg:      'rgba(229,115,115,0.15)',
      activeGrad:    'rgba(229,115,115,0.08)',  // complemento cálido para gradiente activo
      hoverBg:       'rgba(255,255,255,0.06)',  // hover blanco muy tenue
      hoverIcon:     '#FFCDD2',
      hoverText:     '#FFFFFF',
      gradientNav:   'linear-gradient(90deg, #b91c1c, #E57373, #b91c1c)',
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
      primary:       '#4FC3F7',
      primaryLight:  '#B3E5FC',
      primaryDark:   '#0288D1',
      primaryDarker: '#01579B',
      activeBg:      'rgba(79,195,247,0.15)',
      activeGrad:    'rgba(79,195,247,0.08)',
      hoverBg:       'rgba(255,255,255,0.06)',
      hoverIcon:     '#B3E5FC',
      hoverText:     '#FFFFFF',
      gradientNav:   'linear-gradient(90deg, #0288D1, #4FC3F7, #0288D1)',
    },
  },
}

// ─────────────────────────────────────────────
//  Construcción de paletas MUI
// ─────────────────────────────────────────────

const buildLightPalette = (t) => ({
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
    anticipoEntregado:    { bg: '#E3F2FD', color: '#1565C0' },
    anticipoLegalizacion: { bg: '#FFF8E1', color: '#F57F17' },
    anticipoLegalizado:   { bg: '#E8F5E9', color: '#2E7D32' },
    anticipoExcedente:    { bg: '#FFF3E0', color: '#E65100' },
    anticipoCerrado:      { bg: '#F3E5F5', color: '#6A1B9A' },
    rutaProgramada:   { bg: '#E0E7FF', color: '#3730A3' },
    rutaEnCurso:      { bg: '#DBEAFE', color: '#1E40AF' },
    rutaCompletada:   { bg: '#D1FAE5', color: '#065F46' },
    rutaCancelada:    { bg: '#FEE2E2', color: '#991B1B' },
    ventaPendiente:   { bg: '#FEF3C7', color: '#92400E' },
    ventaEnRecogida:  { bg: '#DBEAFE', color: '#1E40AF' },
    ventaProgramada:  { bg: '#E0E7FF', color: '#3730A3' },
    ventaEnTransito:  { bg: '#CFFAFE', color: '#155E75' },
    ventaEntregada:   { bg: '#D1FAE5', color: '#065F46' },
    ventaDevuelta:    { bg: '#FEE2E2', color: '#991B1B' },
    ventaEntregadaAlt: { bg: '#E8F5E9', color: '#2E7D32' },
    ventaDevueltaAlt:  { bg: '#FFF4E5', color: '#BF360C' },
    excedentePositivo: { bg: '#E8F5E9', border: '#A5D6A7' },
    excedenteNegativo: { bg: '#FFF3F3', border: '#FFCDD2' },
    pagado:           { bg: '#D1FAE5', color: '#065F46' },
    pendientePago:    { bg: '#FEE2E2', color: '#991B1B' },
    conductorActivo:  '#2E7D32',
    conductorInactivo: '#ef4444',
    conductorVencido:  '#ef4444',
    neutral:          { bg: '#F3F4F6', color: '#6B7280' },
    neutralAlt:       { bg: '#F5F5F5', color: '#757575' },
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
    secondary: '#A0A0A0',
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
    anticipoEntregado:    { bg: '#0D2B4E', color: '#90CAF9' },
    anticipoLegalizacion: { bg: '#4E3100', color: '#FFB74D' },
    anticipoLegalizado:   { bg: '#1B5E20', color: '#4CAF50' },
    anticipoExcedente:    { bg: '#4E1F00', color: '#FFB74D' },
    anticipoCerrado:      { bg: '#2D1458', color: '#CE93D8' },
    rutaProgramada:   { bg: '#1A1250', color: '#B39DDB' },
    rutaEnCurso:      { bg: '#0D2B4E', color: '#90CAF9' },
    rutaCompletada:   { bg: '#1B5E20', color: '#4CAF50' },
    rutaCancelada:    { bg: '#4A1515', color: '#EF5350' },
    ventaPendiente:   { bg: '#4E3100', color: '#FFB74D' },
    ventaEnRecogida:  { bg: '#0D2B4E', color: '#90CAF9' },
    ventaProgramada:  { bg: '#1A1250', color: '#B39DDB' },
    ventaEnTransito:  { bg: '#003D47', color: '#4DD0E1' },
    ventaEntregada:   { bg: '#1B5E20', color: '#4CAF50' },
    ventaDevuelta:    { bg: '#4A1515', color: '#EF5350' },
    ventaEntregadaAlt: { bg: '#1B5E20', color: '#4CAF50' },
    ventaDevueltaAlt:  { bg: '#4E1A00', color: '#FF8A80' },
    excedentePositivo: { bg: '#1B5E20', border: '#4CAF50' },
    excedenteNegativo: { bg: '#4A1515', border: '#EF5350' },
    pagado:           { bg: '#1B5E20', color: '#4CAF50' },
    pendientePago:    { bg: '#4A1515', color: '#EF5350' },
    conductorActivo:  '#4CAF50',
    conductorInactivo: '#EF5350',
    conductorVencido:  '#EF5350',
    neutral:          { bg: '#2A2A2A', color: '#AAAAAA' },
    neutralAlt:       { bg: '#333333', color: '#999999' },
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

const lightPalette = buildLightPalette(tokens.red.light)
const darkPalette  = buildDarkPalette(tokens.red.dark)

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