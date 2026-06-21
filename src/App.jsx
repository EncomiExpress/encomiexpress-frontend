import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './shared/contexts/AuthContext'
import { ClienteProvider } from './shared/contexts/ClienteContext'
import { AnticipoExcedenteProvider } from './shared/contexts/AnticipoExcedenteContext'
import { VehiculoProvider } from './shared/contexts/VehiculoContext'
import { PropietarioProvider } from './shared/contexts/PropietarioContext'
import { ConductorProvider } from './shared/contexts/ConductorContext'
import { DestinoProvider } from './shared/contexts/DestinoContext'
import { RutaProgramacionProvider } from './shared/contexts/RutaProgramacionContext'
import { VentaProvider } from './shared/contexts/VentaContext'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehiculoProvider>
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
        </VehiculoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App