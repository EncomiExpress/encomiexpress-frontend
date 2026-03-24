import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Box, Button, Typography, Grid, Card, CardContent } from '@mui/material'
import Layout from './Components/Layout'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Home from './Pages/Home'
import ProtectedRoute from './routes/ProtectedRoute'
import Dashboard from './Pages/Dashboard'
import RegistrarCliente from './Pages/Cliente/RegistrarCliente'
import ListarCliente from './Pages/Cliente/ListarCliente'
import ActualizarCliente from './Pages/Cliente/ActualizarCliente'
import RegistrarAnticipoExcedente from './Pages/AnticipoExcedente/RegistrarAnticipoExcedente'
import ListarAnticipoExcedente from './Pages/AnticipoExcedente/ListarAnticipoExcedente'
import ActualizarAnticipoExcedente from './Pages/AnticipoExcedente/ActualizarAnticipoExcedente'
import ListarUsuario from './Pages/Usuario/ListarUsuario'
import RegistrarUsuario from './Pages/Usuario/RegistrarUsuario'
import RegistrarVehiculo from './Pages/Vehiculo/RegistrarVehiculo'
import ListarVehiculo from './Pages/Vehiculo/ListarVehiculo'
import RegistrarRol from './Pages/Rol/RegistrarRol'
import ListarRol from './Pages/Rol/ListarRol'
import ListarPropietario from './Pages/Propietario/ListarPropietario'
import RegistrarPropietario from './Pages/Propietario/RegistrarPropietario'
import ActualizarPropietario from './Pages/Propietario/ActualizarPropietario'
import ListarConductor from './Pages/Conductor/ListarConductor'
import RegistrarConductor from './Pages/Conductor/RegistrarConductor'
import ActualizarConductor from './Pages/Conductor/ActualizarConductor'
import ListarDestino from './Pages/Destino/ListarDestino'
import RegistrarDestino from './Pages/Destino/RegistrarDestino'
import ActualizarDestino from './Pages/Destino/ActualizarDestino'
import ListarRutaProgramacion from './Pages/RutaProgramacion/ListarRutaProgramacion'
import RegistrarRutaProgramacion from './Pages/RutaProgramacion/RegistrarRutaProgramacion'
import ActualizarRutaProgramacion from './Pages/RutaProgramacion/ActualizarRutaProgramacion'
import { PERMISOS } from './Context/AuthContext'

const Rutas = () => {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Ruta pública de registro */}
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute permisosRequeridos={[]} redirectTo="/login">
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Clientes */}
      <Route
        path="/clientes/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_CLIENTE]} requiereTodos={false}>
            <Layout><RegistrarCliente /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_CLIENTE]} requiereTodos={false}>
            <Layout><ListarCliente /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_CLIENTE]} requiereTodos={false}>
            <Layout><ActualizarCliente /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Anticipos y Excedentes */}
      <Route
        path="/anticipos/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_ANTICIPO]} requiereTodos={false}>
            <Layout><RegistrarAnticipoExcedente /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/anticipos/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_ANTICIPO]} requiereTodos={false}>
            <Layout><ListarAnticipoExcedente /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/anticipos/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_ANTICIPO]} requiereTodos={false}>
            <Layout><ActualizarAnticipoExcedente /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Usuarios */}
      <Route
        path="/usuarios/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_USUARIO]} requiereTodos={false}>
            <Layout><ListarUsuario /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_USUARIO]} requiereTodos={false}>
            <Layout><RegistrarUsuario /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Roles */}
      <Route
        path="/roles/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_ROL]} requiereTodos={false}>
            <Layout><RegistrarRol /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_ROL]} requiereTodos={false}>
            <Layout><ListarRol /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Vehiculo */}
      <Route
        path="/vehiculos/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_VEHICULO]} requiereTodos={false}>
            <Layout><ListarVehiculo /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehiculos/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_VEHICULO]} requiereTodos={false}>
            <Layout><RegistrarVehiculo /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Propietarios */}
      <Route
        path="/transporte/propietarios"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ListarPropietario /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/propietarios/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><RegistrarPropietario /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/propietarios/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ActualizarPropietario /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Conductores */}
      <Route
        path="/transporte/conductores"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ListarConductor /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/conductores/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><RegistrarConductor /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/conductores/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ActualizarConductor /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Destinos */}
      <Route
        path="/transporte/destinos"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ListarDestino /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/destinos/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><RegistrarDestino /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/destinos/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ActualizarDestino /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Programación de Rutas */}
      <Route
        path="/transporte/rutas"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ListarRutaProgramacion /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/rutas/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><RegistrarRutaProgramacion /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/rutas/actualizar/:id"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiereTodos={false}>
            <Layout><ActualizarRutaProgramacion /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Encomiendas */}
      <Route
        path="/encomiendas/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_ENCOMIENDA]} requiereTodos={false}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Registrar Encomienda</h2>
                <p>Formulario de registro de encomiendas.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/encomiendas/listar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.LISTAR_ENCOMIENDA]} requiereTodos={false}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Listar Encomiendas</h2>
                <p>Listado de encomiendas.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Ventas */}
      <Route
        path="/ventas/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_VENTA]} requiereTodos={false}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Nueva Venta</h2>
                <p>Formulario de nueva venta.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ventas/listar"
        element={
          <ProtectedRoute permisosRequeridos={[]} requiresTodos={false}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Historial de Ventas</h2>
                <p>Listado de ventas realizadas.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Rutas de Transporte */}
      <Route
        path="/transporte/registrar"
        element={
          <ProtectedRoute permisosRequeridos={[PERMISOS.REGISTRAR_TRANSPORTE]} requiereTodos={false}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Registrar Transporte</h2>
                <p>Formulario de registro de transporte.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporte/listar"
        element={
          <ProtectedRoute permisosRequeridos={[]}>
            <Layout>
              <div style={{ padding: 20 }}>
                <h2>Listar Transporte</h2>
                <p>Listado de transporte.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Ruta por defecto - redirigir al dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default Rutas
