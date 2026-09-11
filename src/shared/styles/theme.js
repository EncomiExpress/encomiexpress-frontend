import { createTheme } from '@mui/material/styles'
import { tokens } from './theme/tokens.js'
import { buildLightPalette, buildDarkPalette } from './theme/palette.js'
import { getComponentOverrides } from './theme/componentOverrides.js'

// ─────────────────────────────────────────────
//  getTheme — hoy acepta solo mode,
//  en el futuro aceptará también { palette: 'red'|'blue' }
// ─────────────────────────────────────────────

export const getTheme = (mode = 'light', paletteKey = 'red') => {
  const t   = tokens[paletteKey]?.[mode] ?? tokens.red[mode]
  // El otro color de marca (rojo↔azul) para el mismo modo -- se expone como
  // palette.accent, para acentos que necesitan contrastar con primary sin importar
  // cuál paleta esté activa (ej. el ícono de "Conductores Disponibles" del
  // Dashboard). No confundir con secondary, que es el navy fijo del Sidebar/
  // encabezados y no cambia con la paleta.
  const otroKey = paletteKey === 'blue' ? 'red' : 'blue'
  const otro = tokens[otroKey]?.[mode] ?? tokens.blue[mode]
  const pal = mode === 'dark' ? buildDarkPalette(t, otro) : buildLightPalette(t, otro)

  return createTheme({
    palette: pal,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: getComponentOverrides(pal, mode),
  })
}

export const lightTheme = getTheme('light')
export const darkTheme  = getTheme('dark')

export default lightTheme
