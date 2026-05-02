import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import { ClienteProvider } from './Context/ClienteContext'
import { AnticipoExcedenteProvider } from './Context/AnticipoExcedenteContext'
import { TransporteProvider } from './Context/TransporteContext'
import { PropietarioProvider } from './Context/PropietarioContext'
import { ConductorProvider } from './Context/ConductorContext'
import { DestinoProvider } from './Context/DestinoContext'
import { RutaProgramacionProvider } from './Context/RutaProgramacionContext'
import { VentaProvider } from './Context/VentaContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
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
                        <AppRoutes />
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
  )
}

export default App