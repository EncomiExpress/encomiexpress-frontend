import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './shared/contexts/ToastContext'
import { AuthProvider } from './shared/contexts/AuthContext'
import { ConfiguracionProvider } from './shared/contexts/ConfiguracionContext'
import { ClienteProvider } from './features/clientes/context/ClienteContext'
import { AnticipoExcedenteProvider } from './features/anticipos/context/AnticipoExcedenteContext'
import { VehiculoProvider } from './features/vehiculos/context/VehiculoContext'
import { PropietarioProvider } from './features/propietarios/context/PropietarioContext'
import { ConductorProvider } from './features/conductores/context/ConductorContext'
import { DestinoProvider } from './features/destinos/context/DestinoContext'
import { RutaProgramacionProvider } from './features/rutas/context/RutaProgramacionContext'
import { VentaProvider } from './features/ventas/context/VentaContext'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <VehiculoProvider>
            <PropietarioProvider>
              <ConductorProvider>
                <DestinoProvider>
                  <ConfiguracionProvider>
                    <RutaProgramacionProvider>
                      <ClienteProvider>
                        <VentaProvider>
                          <AnticipoExcedenteProvider>
                            <AppRoutes />
                          </AnticipoExcedenteProvider>
                        </VentaProvider>
                      </ClienteProvider>
                    </RutaProgramacionProvider>
                  </ConfiguracionProvider>
                </DestinoProvider>
              </ConductorProvider>
            </PropietarioProvider>
          </VehiculoProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App