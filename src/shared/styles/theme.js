import { createTheme } from '@mui/material/styles'

const lightPalette = {
  primary: {
    main: '#CC1818',
    light: '#FFE8E8',
    dark: '#b91c1c',
    darker: '#a01212',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1A2E6E',
    light: '#2a3f8f',
    dark: '#0f1c45',
    contrastText: '#ffffff',
  },
  background: {
    default: '#F5F6FA',
    paper: '#ffffff',
    subtle: '#F9F9F9',
    muted: '#F8F9FA',
    faint: '#FAFAFA',
    input: '#f5f5f5',
  },
  text: {
    primary: '#1a0e0c',
    secondary: '#8A94A6',
    disabled: '#9E9E9E',
    hint: '#9C4040',
    dark: '#212121',
    medium: '#2D3748',
    muted2: '#6b7280',
    icon: '#8b8382',
    iconHover: '#483c3a',
    nav: '#4a3f3c',
    navHover: '#1a0e0c',
  },
  divider: '#E0E0E0',
  border: {
    default: '#E0E0E0',
    hover: '#BDBDBD',
    focused: '#E57373',
    light: '#e2e8f0',
    faint: '#f0f0f0',
  },
  status: {
    active: { bg: '#DCFCE7', color: '#16A34A' },
    inactive: { bg: '#F3F4F6', color: '#9CA3AF' },
    activeText: '#10b981',
    inactiveText: '#dc2626',
    enabled: { bg: '#FFCDD2', color: '#C62828' },
    disabled2: { bg: '#E0E0E0', color: '#9CA3AF' },
    success: { bg: '#E8F5E9', color: '#2E7D32' },
    successDark: { bg: '#D1FAE5', color: '#065F46' },
    warning: { bg: '#FFF8E1', color: '#F57F17' },
    warningLight: { bg: '#FEF3C7', color: '#92400E' },
    warningAmber: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#FEE2E2', color: '#991B1B' },
    errorLight: { bg: '#FFF3F3', color: '#C62828' },
    errorPrimary: { bg: '#FFCDD2', color: '#C62828' },
    errorBg: '#FFECEC',
    info: { bg: '#E3F2FD', color: '#1565C0' },
    infoBlue: { bg: '#DBEAFE', color: '#1E40AF' },
    purple: { bg: '#F3E5F5', color: '#6A1B9A' },
    anticipoEntregado: { bg: '#E3F2FD', color: '#1565C0' },
    anticipoLegalizacion: { bg: '#FFF8E1', color: '#F57F17' },
    anticipoLegalizado: { bg: '#E8F5E9', color: '#2E7D32' },
    anticipoExcedente: { bg: '#FFF3E0', color: '#E65100' },
    anticipoCerrado: { bg: '#F3E5F5', color: '#6A1B9A' },
    rutaProgramada: { bg: '#E0E7FF', color: '#3730A3' },
    rutaEnCurso: { bg: '#DBEAFE', color: '#1E40AF' },
    rutaCompletada: { bg: '#D1FAE5', color: '#065F46' },
    rutaCancelada: { bg: '#FEE2E2', color: '#991B1B' },
    ventaPendiente: { bg: '#FEF3C7', color: '#92400E' },
    ventaEnRecogida: { bg: '#DBEAFE', color: '#1E40AF' },
    ventaProgramada: { bg: '#E0E7FF', color: '#3730A3' },
    ventaEnTransito: { bg: '#CFFAFE', color: '#155E75' },
    ventaEntregada: { bg: '#D1FAE5', color: '#065F46' },
    ventaDevuelta: { bg: '#FEE2E2', color: '#991B1B' },
    ventaEntregadaAlt: { bg: '#E8F5E9', color: '#2E7D32' },
    ventaDevueltaAlt: { bg: '#FFF4E5', color: '#BF360C' },
    excedentePositivo: { bg: '#E8F5E9', border: '#A5D6A7' },
    excedenteNegativo: { bg: '#FFF3F3', border: '#FFCDD2' },
    pagado: { bg: '#D1FAE5', color: '#065F46' },
    pendientePago: { bg: '#FEE2E2', color: '#991B1B' },
    conductorActivo: '#2E7D32',
    conductorInactivo: '#ef4444',
    conductorVencido: '#ef4444',
    neutral: { bg: '#F3F4F6', color: '#6B7280' },
    neutralAlt: { bg: '#F5F5F5', color: '#757575' },
  },
  avatarDefault: { bg: '#FFCDD2', color: '#C62828' },
  avatarDisabled: { bg: '#E0E0E0', color: '#9E9E9E' },
  avatarDefault: { bg: '#FFCDD2', color: '#C62828' },
  avatarDisabled: { bg: '#E0E0E0', color: '#9E9E9E' },
  gradient: {
    primary: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
    primaryHover: 'linear-gradient(135deg, #a81212 0%, #CC1818 100%)',
    navbar: 'linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)',
    hero: 'linear-gradient(135deg, #f5f5f5 0%, #1a2e6e 50%)',
  },
}

const darkPalette = {
  primary: {
    main: '#E57373',
    light: '#FFB3B3',
    dark: '#C62828',
    darker: '#B71C1C',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4FC3F7',
    light: '#81D4FA',
    dark: '#29B6F6',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    subtle: '#252525',
    muted: '#2A2A2A',
    faint: '#222222',
    input: '#2D2D2D',
  },
  text: {
    primary: '#E0E0E0',
    secondary: '#A0A0A0',
    disabled: '#707070',
    hint: '#B76E6E',
    dark: '#FFFFFF',
    medium: '#CCCCCC',
    muted2: '#AAAAAA',
    icon: '#A0A0A0',
    iconHover: '#4FC3F7',
    nav: '#E0E0E0',
    navHover: '#FFFFFF',
  },
  divider: '#444444',
  border: {
    default: '#444444',
    hover: '#555555',
    focused: '#E57373',
    light: '#333333',
    faint: '#2A2A2A',
  },
  status: {
    active: { bg: '#1B5E20', color: '#4CAF50' },
    inactive: { bg: '#424242', color: '#B0B0B0' },
    activeText: '#4CAF50',
    inactiveText: '#EF5350',
    enabled: { bg: '#B71C1C', color: '#EF5350' },
    disabled2: { bg: '#444444', color: '#909090' },
    success: { bg: '#1B5E20', color: '#4CAF50' },
    successDark: { bg: '#27AE60', color: '#4CAF50' },
    warning: { bg: '#F57C00', color: '#FFB74D' },
    warningLight: { bg: '#E65112', color: '#FFCC80' },
    warningAmber: { bg: '#E65112', color: '#FFCC80' },
    error: { bg: '#B71C1C', color: '#EF5350' },
    errorLight: { bg: '#FF8A80', color: '#EF5350' },
    errorPrimary: { bg: '#B71C1C', color: '#EF5350' },
    errorBg: '#4A1515',
    info: { bg: '#0277BD', color: '#4FC3F7' },
    infoBlue: { bg: '#1976D2', color: '#4FC3F7' },
    purple: { bg: '#4A148C', color: '#CE93D8' },
    anticipoEntregado: { bg: '#0277BD', color: '#4FC3F7' },
    anticipoLegalizacion: { bg: '#F57C00', color: '#FFB74D' },
    anticipoLegalizado: { bg: '#1B5E20', color: '#4CAF50' },
    anticipoExcedente: { bg: '#EF6C00', color: '#FFB74D' },
    anticipoCerrado: { bg: '#4A148C', color: '#CE93D8' },
    rutaProgramada: { bg: '#311B92', color: '#B388FF' },
    rutaEnCurso: { bg: '#1976D2', color: '#4FC3F7' },
    rutaCompletada: { bg: '#27AE60', color: '#4CAF50' },
    rutaCancelada: { bg: '#B71C1C', color: '#EF5350' },
    ventaPendiente: { bg: '#F57C00', color: '#FFB74D' },
    ventaEnRecogida: { bg: '#1976D2', color: '#4FC3F7' },
    ventaProgramada: { bg: '#311B92', color: '#B388FF' },
    ventaEnTransito: { bg: '#00838F', color: '#4DD0E1' },
    ventaEntregada: { bg: '#27AE60', color: '#4CAF50' },
    ventaDevuelta: { bg: '#B71C1C', color: '#EF5350' },
    ventaEntregadaAlt: { bg: '#1B5E20', color: '#4CAF50' },
    ventaDevueltaAlt: { bg: '#FF3D00', color: '#FF8A80' },
    excedentePositivo: { bg: '#1B5E20', border: '#4CAF50' },
    excedenteNegativo: { bg: '#B71C1C', border: '#EF5350' },
    pagado: { bg: '#27AE60', color: '#4CAF50' },
    pendientePago: { bg: '#B71C1C', color: '#EF5350' },
    conductorActivo: '#4CAF50',
    conductorInactivo: '#EF5350',
    conductorVencido: '#EF5350',
    neutral: { bg: '#424242', color: '#AAAAAA' },
    neutralAlt: { bg: '#333333', color: '#999999' },
  },
  avatarDefault: { bg: '#B71C1C', color: '#EF5350' },
  avatarDisabled: { bg: '#424242', color: '#9E9E9E' },
  avatarDefault: { bg: '#B71C1C', color: '#EF5350' },
  avatarDisabled: { bg: '#424242', color: '#9E9E9E' },
  gradient: {
    primary: 'linear-gradient(135deg, #E57373 0%, #EF5350 100%)',
    primaryHover: 'linear-gradient(135deg, #C62828 0%, #E57373 100%)',
    navbar: 'linear-gradient(90deg, #29B6F6, #E57373, #29B6F6)',
    hero: 'linear-gradient(135deg, #222222 0%, #29B6F6 50%)',
  },
}

export const getTheme = (mode = 'light') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: palette.primary.main,
            '&:hover': {
              backgroundColor: palette.primary.dark,
              boxShadow: '0 6px 20px rgba(229,115,115,0.2)',
            },
            '&.Mui-disabled': {
              backgroundColor: palette.divider,
              color: palette.text.disabled,
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: palette.divider,
            '&.Mui-active': { color: palette.primary.main },
            '&.Mui-completed': { color: palette.primary.main },
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
            borderColor: palette.divider,
          },
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.border.hover,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.primary.light,
              borderWidth: '1px',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': { color: palette.primary.main },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: palette.primary.main,
            '&.Mui-checked': { color: palette.primary.main },
            '&.MuiCheckbox-indeterminate': { color: palette.primary.main },
          },
        },
      },
    },
  })
}

export const lightTheme = getTheme('light')
export const darkTheme = getTheme('dark')

export default lightTheme