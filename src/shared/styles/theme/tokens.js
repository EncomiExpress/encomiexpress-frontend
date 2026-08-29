// ─────────────────────────────────────────────
//  TOKENS BASE — dos sabores: rojo y azul
//  Cada una tiene su versión light y dark.
//  Cuando implementes la selección dinámica,
//  pasa { palette: 'red'|'blue', mode: 'light'|'dark' }
//  a getTheme() y listo.
// ─────────────────────────────────────────────

export const tokens = {
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
