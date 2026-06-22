import { createContext, useContext, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from '../styles/theme.js'
import { STORAGE_KEYS } from '../config/storageKeys.js'

const DarkModeContext = createContext()

export const ThemeProviderWrapper = ({ children }) => {
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem(STORAGE_KEYS.DARK_MODE)    === 'true')
  const [paletteKey,  setPaletteKey]  = useState(() => localStorage.getItem(STORAGE_KEYS.PALETTE_KEY)  || 'red')

  const toggleDarkMode = () =>
    setDarkMode(prev => {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, !prev)
      return !prev
    })

  const togglePalette = (newPalette) =>
  setPaletteKey(prev => {
    const next = newPalette || (prev === 'red' ? 'blue' : 'red')
    localStorage.setItem(STORAGE_KEYS.PALETTE_KEY, next)
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