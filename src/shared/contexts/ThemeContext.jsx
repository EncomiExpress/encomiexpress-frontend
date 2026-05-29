import { createContext, useContext, useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'

const ThemeContext = createContext()

export const useDarkMode = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useDarkMode must be used within ThemeProvider')
  return context
}

export const ThemeModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext