// ─────────────────────────────────────────────
//  TOKENS BASE — paleta azul (único color de marca).
//  Tiene su versión light y dark.
//  El rojo se retiró como paleta seleccionable: el cliente lo asoció a
//  errores y pidió reservarlo estrictamente para indicadores semánticos
//  negativos (ver shared/utils/estadoColors.js y theme/palette.js status.*).
// ─────────────────────────────────────────────

export const tokens = {
  light: {
    primary:       '#1A2E6E',
    primaryLight:  '#E8EEFF',
    primaryDark:   '#0f1c45',
    primaryDarker: '#091236',
    activeBg:      'rgba(26,46,110,0.12)',
    // Complemento no-semántico (verde-azulado) para el gradiente activo del
    // sidebar/topnav y la barra superior — antes era el rojo de la paleta
    // retirada; se evita rojo/verde a propósito (reservados para status).
    activeGrad:    'rgba(13,148,136,0.08)',
    hoverBg:       'rgba(0,0,0,0.04)',
    hoverIcon:     '#0f1c45',
    hoverText:     '#091236',
    gradientNav:   'linear-gradient(90deg, #0d9488, #1A2E6E, #0d9488)',
  },
  dark: {
    // Desaturado a ~69% (antes 91%) para igualar la suavidad que tenía la
    // antigua paleta roja en modo oscuro — sin esto el azul se sentía mucho
    // más eléctrico.
    primary:       '#64BBE2',
    primaryLight:  '#BCE2F3',
    primaryDark:   '#257EAE',
    primaryDarker: '#155587',
    activeBg:      'rgba(100,187,226,0.15)',
    activeGrad:    'rgba(100,187,226,0.08)',
    hoverBg:       'rgba(255,255,255,0.06)',
    hoverIcon:     '#BCE2F3',
    hoverText:     '#FFFFFF',
    gradientNav:   'linear-gradient(90deg, #2dd4bf, #64BBE2, #2dd4bf)',
  },
}
