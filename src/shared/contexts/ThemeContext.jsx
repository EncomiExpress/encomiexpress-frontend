import { createContext, useContext, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from '../styles/theme.js'
import { STORAGE_KEYS } from '../config/storageKeys.js'

const DarkModeContext = createContext()

export const ThemeProviderWrapper = ({ children }) => {
  const [darkMode,   setDarkMode]   = useState(() => localStorage.getItem(STORAGE_KEYS.DARK_MODE)   === 'true')
  const [navLayout,  setNavLayoutState] = useState(() => localStorage.getItem(STORAGE_KEYS.NAV_LAYOUT) || 'sidebar')

  const toggleDarkMode = () =>
    setDarkMode(prev => {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, !prev)
      return !prev
    })

  const setNavLayout = (layout) => {
    localStorage.setItem(STORAGE_KEYS.NAV_LAYOUT, layout)
    setNavLayoutState(layout)
  }

  const theme = useMemo(
    () => getTheme(darkMode ? 'dark' : 'light'),
    [darkMode]
  )

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, navLayout, setNavLayout }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)
