import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ClienteProvider } from './Context/ClienteContext.jsx'
import { AnticipoExcedenteProvider } from './Context/AnticipoExcedenteContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { TransporteProvider } from './Context/TransporteContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TransporteProvider>
          <ClienteProvider>
            <AnticipoExcedenteProvider>
              <App />
            </AnticipoExcedenteProvider>
          </ClienteProvider>
        </TransporteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
