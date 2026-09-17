// ─────────────────────────────────────────────
//  Construcción de paletas MUI
// ─────────────────────────────────────────────

import { alpha } from '@mui/material/styles'

// Colores de acción estandarizados (botones, alertas, iconos) — mismo valor en
// claro/oscuro a propósito, tal cual los definió el cliente; no se desaturan
// para dark mode como primary (ver tokens.js) porque el cliente los dio como
// un único set fijo, no como paleta light/dark. `dim` es el fondo hover/chip
// (10% de opacidad) que acompaña a cada color en los botones tipo IconButton.
const ACTION = {
  success: '#10b981',
  danger:  '#CC1818',
  warning: '#f59e0b',
  neutral: '#64748b',
}

export const buildLightPalette = (t) => ({
  mode: 'light',
  primary: {
    main:          t.primary,
    light:         t.primaryLight,
    dark:          t.primaryDark,
    darker:        t.primaryDarker,
    dim:           alpha(t.primary, 0.1),
    contrastText:  '#ffffff',
    // Expone los tokens de sidebar para consumirlos en componentes
    activeBg:      t.activeBg,
    activeGrad:    t.activeGrad,
    hoverBg:       t.hoverBg,
    hoverIcon:     t.hoverIcon,
    hoverText:     t.hoverText,
  },
  // Éxito / confirmaciones (habilitar, aprobar, confirmar entrega) — botones e iconos.
  success: {
    main:          ACTION.success,
    dim:           alpha(ACTION.success, 0.1),
    contrastText:  '#ffffff',
  },
  // Acciones destructivas o irreversibles (eliminar, rechazar, anular, quitar) —
  // reemplaza el error.main por defecto de MUI por el rojo de marca (#CC1818),
  // el mismo que ya usan los correos transaccionales (config/email.js).
  error: {
    main:          ACTION.danger,
    dim:           alpha(ACTION.danger, 0.1),
    contrastText:  '#ffffff',
  },
  // Cambios de estado reversibles / precaución (inhabilitar).
  warning: {
    main:          ACTION.warning,
    dim:           alpha(ACTION.warning, 0.1),
    contrastText:  '#ffffff',
  },
  // Acciones neutrales (cancelar, cerrar, volver, limpiar filtros) — distinto de
  // `secondary` (que en esta paleta es a propósito el mismo azul que `primary`,
  // ver comentario más abajo), para no reintroducir rojo/otros tonos no-semánticos.
  neutral: {
    main:          ACTION.neutral,
    dark:          '#475569',
    dim:           alpha(ACTION.neutral, 0.1),
    contrastText:  '#ffffff',
  },
  secondary: {
    main:          '#1A2E6E',
    light:         '#2a3f8f',
    dark:          '#0f1c45',
    contrastText:  '#ffffff',
  },
  // Acento fijo, no-semántico (verde azulado) para contrastar con primary sin
  // recurrir a rojo/verde -- esos quedan reservados para status (ver
  // shared/utils/estadoColors.js y status.* más abajo). Antes este acento era
  // "el otro color de marca" de la paleta roja retirada.
  accent: {
    main:          '#0d9488',
    light:         '#CCFBF1',
    dark:          '#0f766e',
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

export const buildDarkPalette = (t) => ({
  mode: 'dark',
  primary: {
    main:          t.primary,
    light:         t.primaryLight,
    dark:          t.primaryDark,
    darker:        t.primaryDarker,
    dim:           alpha(t.primary, 0.1),
    contrastText:  '#ffffff',
    activeBg:      t.activeBg,
    activeGrad:    t.activeGrad,
    hoverBg:       t.hoverBg,
    hoverIcon:     t.hoverIcon,
    hoverText:     t.hoverText,
  },
  success: {
    main:          ACTION.success,
    dim:           alpha(ACTION.success, 0.1),
    contrastText:  '#ffffff',
  },
  error: {
    main:          ACTION.danger,
    dim:           alpha(ACTION.danger, 0.1),
    contrastText:  '#ffffff',
  },
  warning: {
    main:          ACTION.warning,
    dim:           alpha(ACTION.warning, 0.1),
    contrastText:  '#ffffff',
  },
  neutral: {
    main:          ACTION.neutral,
    dark:          '#475569',
    dim:           alpha(ACTION.neutral, 0.1),
    contrastText:  '#ffffff',
  },
  // Mismo azul de marca que primary (igual que en buildLightPalette, donde
  // secondary.main ya coincidía con primary.main) -- antes era un rojo fijo
  // que se colaba en piezas no semánticas como el chip de valor de un
  // anticipo o los polígonos decorativos de Login/ResetearPassword.
  secondary: {
    main:          t.primary,
    light:         t.primaryLight,
    dark:          t.primaryDark,
    contrastText:  '#ffffff',
  },
  // Ver comentario en buildLightPalette: acento fijo no-semántico.
  accent: {
    main:          '#2dd4bf',
    light:         '#99f6e4',
    dark:          '#14b8a6',
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
