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
  const pal = mode === 'dark' ? buildDarkPalette(t) : buildLightPalette(t)

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
