import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ClienteProvider } from './Context/ClienteContext.jsx'
import { AnticipoExcedenteProvider } from './Context/AnticipoExcedenteContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { TransporteProvider } from './Context/TransporteContext.jsx'
import { PropietarioProvider } from './Context/PropietarioContext.jsx'
import { ConductorProvider } from './Context/ConductorContext.jsx'
import { DestinoProvider } from './Context/DestinoContext.jsx'
import { RutaProgramacionProvider } from './Context/RutaProgramacionContext.jsx'
import { VentaProvider } from './Context/VentaContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TransporteProvider>
          <PropietarioProvider>
            <ConductorProvider>
              <DestinoProvider>
                <RutaProgramacionProvider>
                  <ClienteProvider>
                    <VentaProvider>
                      <AnticipoExcedenteProvider>
                        <App />
                      </AnticipoExcedenteProvider>
                    </VentaProvider>
                  </ClienteProvider>
                </RutaProgramacionProvider>
              </DestinoProvider>
            </ConductorProvider>
          </PropietarioProvider>
        </TransporteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
