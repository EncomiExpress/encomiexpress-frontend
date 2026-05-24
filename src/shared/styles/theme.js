import { createTheme } from '@mui/material/styles'

// ─── Paleta de colores del sistema ───────────────────────────────────────────
// Todos los colores de la aplicación están definidos aquí.
// Para cambiar la paleta o preparar dark mode, solo modifica este archivo.

const theme = createTheme({
  palette: {
    primary: {
      main: '#CC1818',       // Rojo principal
      light: '#FFE8E8',      // Rojo claro (fondos, chips)
      dark: '#b91c1c',       // Rojo oscuro (hover)
      darker: '#a01212',     // Rojo más oscuro (hover secundario)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1A2E6E',       // Azul oscuro (navbar, sidebar)
      light: '#2a3f8f',      // Azul claro
      dark: '#0f1c45',       // Azul muy oscuro
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F6FA',    // Fondo general de la app
      paper: '#ffffff',      // Tarjetas y superficies
      subtle: '#F9F9F9',     // Hover de filas, fondos suaves
      muted: '#F8F9FA',      // Encabezados de tabla, secciones
      faint: '#FAFAFA',      // Popover/drawer backgrounds
      input: '#f5f5f5',      // Fondo de inputs en Login/Register
    },
    text: {
      primary: '#1a0e0c',    // Texto principal
      secondary: '#8A94A6',  // Texto secundario / muted
      disabled: '#9E9E9E',
      hint: '#9C4040',       // Labels de campos en formularios
      dark: '#212121',       // Texto muy oscuro (headings)
      medium: '#2D3748',     // Texto medio
      muted2: '#6b7280',     // Texto gris neutro
      icon: '#8b8382',       // Iconos de inputs
      iconHover: '#483c3a',  // Iconos hover
      nav: '#4a3f3c',        // Texto navegación
      navHover: '#1a0e0c',   // Texto navegación hover
    },
    divider: '#E0E0E0',      // Bordes y divisores
    border: {
      default: '#E0E0E0',    // Bordes principales
      hover: '#BDBDBD',      // Bordes en hover
      focused: '#E57373',    // Bordes en foco (inputs)
      light: '#e2e8f0',      // Bordes muy suaves
      faint: '#f0f0f0',      // Bordes casi invisibles
    },

    // ── Colores de estado (para chips, badges y textos de estado) ──
    status: {
      // Estados activo/inactivo
      active: { bg: '#DCFCE7', color: '#16A34A' },
      inactive: { bg: '#F3F4F6', color: '#9CA3AF' },
      activeText: '#10b981',
      inactiveText: '#dc2626',

      // Habilitado/inhabilitado (toggle)
      enabled: { bg: '#FFCDD2', color: '#C62828' },
      disabled2: { bg: '#E0E0E0', color: '#9CA3AF' },

      // Colores de alerta semáforo
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

      // Estados específicos de anticipos
      anticipoEntregado: { bg: '#E3F2FD', color: '#1565C0' },
      anticipoLegalizacion: { bg: '#FFF8E1', color: '#F57F17' },
      anticipoLegalizado: { bg: '#E8F5E9', color: '#2E7D32' },
      anticipoExcedente: { bg: '#FFF3E0', color: '#E65100' },
      anticipoCerrado: { bg: '#F3E5F5', color: '#6A1B9A' },

      // Estados de rutas
      rutaProgramada: { bg: '#E0E7FF', color: '#3730A3' },
      rutaEnCurso: { bg: '#DBEAFE', color: '#1E40AF' },
      rutaCompletada: { bg: '#D1FAE5', color: '#065F46' },
      rutaCancelada: { bg: '#FEE2E2', color: '#991B1B' },

      // Estados de encomiendas/ventas
      ventaPendiente: { bg: '#FEF3C7', color: '#92400E' },
      ventaEnRecogida: { bg: '#DBEAFE', color: '#1E40AF' },
      ventaProgramada: { bg: '#E0E7FF', color: '#3730A3' },
      ventaEnTransito: { bg: '#CFFAFE', color: '#155E75' },
      ventaEntregada: { bg: '#D1FAE5', color: '#065F46' },
      ventaDevuelta: { bg: '#FEE2E2', color: '#991B1B' },
      ventaEntregadaAlt: { bg: '#E8F5E9', color: '#2E7D32' },
      ventaDevueltaAlt: { bg: '#FFF4E5', color: '#BF360C' },

      // Excedente positivo/negativo
      excedentePositivo: { bg: '#E8F5E9', border: '#A5D6A7' },
      excedenteNegativo: { bg: '#FFF3F3', border: '#FFCDD2' },

      // Pagado/pendiente de pago
      pagado: { bg: '#D1FAE5', color: '#065F46' },
      pendientePago: { bg: '#FEE2E2', color: '#991B1B' },

      // Colores de conductor
      conductorActivo: '#2E7D32',
      conductorInactivo: '#ef4444',
      conductorVencido: '#ef4444',

      // Colores neutros para defaults
      neutral: { bg: '#F3F4F6', color: '#6B7280' },
      neutralAlt: { bg: '#F5F5F5', color: '#757575' },
    },

    // ── Roles ──
    roles: {
      Administrador: { bg: '#FFCDD2', color: '#C62828' },
      Gerente: { bg: '#FFEBEE', color: '#D32F2F' },
      Vendedor: { bg: '#FFECB3', color: '#FFA000' },
      Conductor: { bg: '#F8BBD9', color: '#C2185B' },
      Auxiliar: { bg: '#FFE0B2', color: '#E65100' },
      default: { bg: '#F5F5F5', color: '#616161' },
    },

    // ── Gradientes (se usan como strings en sx) ──
    gradient: {
      primary: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
      primaryHover: 'linear-gradient(135deg, #a81212 0%, #CC1818 100%)',
      navbar: 'linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)',
      hero: 'linear-gradient(135deg, #f5f5f5 0%, #1a2e6e 50%)',
    },
  },

  // ── Tipografía ──
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },

  // ── Overrides globales de componentes MUI ──
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#CC1818',
          '&:hover': {
            backgroundColor: '#b91c1c',
            boxShadow: '0 6px 20px rgba(204,24,24,0.2)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#E0E0E0',
            color: '#9E9E9E',
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#E0E0E0',
          '&.Mui-active': { color: '#CC1818' },
          '&.Mui-completed': { color: '#CC1818' },
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
          borderColor: '#E0E0E0',
        },
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BDBDBD',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E57373',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: '#CC1818' },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#CC1818',
          '&.Mui-checked': { color: '#CC1818' },
          '&.MuiCheckbox-indeterminate': { color: '#CC1818' },
        },
      },
    },
  },
})

export default theme