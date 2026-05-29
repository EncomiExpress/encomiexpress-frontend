import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { getTheme } from './shared/styles/theme.js'
import { ThemeModeProvider, useDarkMode } from './shared/contexts/ThemeContext.jsx'

const ThemedApp = () => {
  const { darkMode } = useDarkMode()
  const theme = createTheme(getTheme(darkMode ? 'dark' : 'light'))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  </StrictMode>,
)