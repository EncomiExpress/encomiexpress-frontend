import { createContext, useContext, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from '../styles/theme.js'

const DarkModeContext = createContext()

export const ThemeProviderWrapper = ({ children }) => {
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('darkMode')    === 'true')
  const [paletteKey,  setPaletteKey]  = useState(() => localStorage.getItem('paletteKey')  || 'red')

  const toggleDarkMode = () =>
    setDarkMode(prev => {
      localStorage.setItem('darkMode', !prev)
      return !prev
    })

  const togglePalette = (newPalette) =>
  setPaletteKey(prev => {
    const next = newPalette || (prev === 'red' ? 'blue' : 'red')
    localStorage.setItem('paletteKey', next)
    return next
  })

  const theme = useMemo(
    () => getTheme(darkMode ? 'dark' : 'light', paletteKey),
    [darkMode, paletteKey]
  )

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, paletteKey, togglePalette }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)