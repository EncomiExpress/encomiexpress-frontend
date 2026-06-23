import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import LayoutAdmin from './shared/components/LayoutAdmin.jsx'
import { useAuth } from './shared/contexts/AuthContext.jsx'
import { PERMISOS } from './shared/contexts/AuthContext.jsx'
import SessionExpiredDialog from './shared/components/SessionExpiredDialog.jsx'

// Página pública principal
import Home from './shared/components/Home.jsx'

// Auth
import Login from './features/auth/Login.jsx'
import Register from './features/auth/Register.jsx'

// Dashboard
import Dashboard from './features/dashboard/Dashboard.jsx'

// Cliente
import RegistrarCliente from './features/clientes/RegistrarCliente.jsx'
import ListarCliente from './features/clientes/ListarCliente.jsx'
import ActualizarCliente from './features/clientes/ActualizarCliente.jsx'

// Anticipos
import RegistrarAnticipoExcedente from './features/anticipos/RegistrarAnticipoExcedente.jsx'
import ListarAnticipoExcedente from './features/anticipos/ListarAnticipoExcedente.jsx'
import ActualizarAnticipoExcedente from './features/anticipos/ActualizarAnticipoExcedente.jsx'

// Usuarios
import ListarUsuario from './features/usuarios/ListarUsuario.jsx'
import RegistrarUsuario from './features/usuarios/RegistrarUsuario.jsx'
import ActualizarUsuario from './features/usuarios/ActualizarUsuario.jsx'

// Roles
import RegistrarRol from './features/roles/RegistrarRol.jsx'
import ActualizarRol from './features/roles/ActualizarRol.jsx'
import ListarRol from './features/roles/ListarRol.jsx'

// Vehículos
import RegistrarVehiculo from './features/vehiculos/RegistrarVehiculo.jsx'
import ActualizarVehiculo from './features/vehiculos/ActualizarVehiculo.jsx'
import ListarVehiculo from './features/vehiculos/ListarVehiculo.jsx'

// Transporte - Propietarios
import ListarPropietario from './features/propietarios/ListarPropietario.jsx'
import RegistrarPropietario from './features/propietarios/RegistrarPropietario.jsx'
import ActualizarPropietario from './features/propietarios/ActualizarPropietario.jsx'

// Transporte - Conductores
import ListarConductor from './features/conductores/ListarConductor.jsx'
import RegistrarConductor from './features/conductores/RegistrarConductor.jsx'
import ActualizarConductor from './features/conductores/ActualizarConductor.jsx'

// Transporte - Destinos
import ListarDestino from './features/destinos/ListarDestino.jsx'
import RegistrarDestino from './features/destinos/RegistrarDestino.jsx'
import ActualizarDestino from './features/destinos/ActualizarDestino.jsx'

// Transporte - Rutas Programación
import ListarRutaProgramacion from './features/rutas/ListarRutaProgramacion.jsx'
import RegistrarRutaProgramacion from './features/rutas/RegistrarRutaProgramacion.jsx'
import ActualizarRutaProgramacion from './features/rutas/ActualizarRutaProgramacion.jsx'

// Ventas
import RegistrarVenta from './features/ventas/RegistrarVenta.jsx'
import ListarVenta from './features/ventas/ListarVenta.jsx'
import ActualizarVenta from './features/ventas/ActualizarVenta.jsx'

// Componente wrapper para rutas privadas con LayoutAdmin
const PrivateRoute = ({ children, permisosRequeridos = [] }) => {
  const { usuario, loading, tieneAlgunPermiso } = useAuth()

  // Esperar a que AuthContext restaure la sesión desde localStorage
  if (loading) {
    return null
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (permisosRequeridos.length > 0 && !tieneAlgunPermiso(permisosRequeridos)) {
    return <Navigate to="/login" replace />
  }

  return <LayoutAdmin>{children}</LayoutAdmin>
}

const AppRoutes = () => {
  return (
    <>
    <SessionExpiredDialog />
    <Routes>
      {/* Ruta raíz con Home directamente */}
      <Route path="/" element={<Home />} />

      {/* Login y Register sin layout público */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Clientes */}
      <Route path="/clientes/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_CLIENTE]}><ListarCliente /></PrivateRoute>} />
      <Route path="/clientes/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_CLIENTE]}><RegistrarCliente /></PrivateRoute>} />
      <Route path="/clientes/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_CLIENTE]}><ActualizarCliente /></PrivateRoute>} />

      {/* Anticipos */}
      <Route path="/anticipos/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_ANTICIPO]}><ListarAnticipoExcedente /></PrivateRoute>} />
      <Route path="/anticipos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_ANTICIPO]}><RegistrarAnticipoExcedente /></PrivateRoute>} />
      <Route path="/anticipos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_ANTICIPO]}><ActualizarAnticipoExcedente /></PrivateRoute>} />

      {/* Usuarios */}
      <Route path="/usuarios/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_USUARIO]}><ListarUsuario /></PrivateRoute>} />
      <Route path="/usuarios/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_USUARIO]}><RegistrarUsuario /></PrivateRoute>} />
      <Route path="/usuarios/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_USUARIO]}><ActualizarUsuario /></PrivateRoute>} />

      {/* Roles */}
      <Route path="/roles/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_ROL]}><ListarRol /></PrivateRoute>} />
      <Route path="/roles/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_ROL]}><RegistrarRol /></PrivateRoute>} />
      <Route path="/roles/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_ROL]}><ActualizarRol /></PrivateRoute>} />

      {/* Vehículos */}
      <Route path="/vehiculos/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VEHICULO]}><ListarVehiculo /></PrivateRoute>} />
      <Route path="/vehiculos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_VEHICULO]}><RegistrarVehiculo /></PrivateRoute>} />
      <Route path="/vehiculos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_VEHICULO]}><ActualizarVehiculo /></PrivateRoute>} />

       {/* Transporte - Propietarios */}
       <Route path="/transporte/propietarios" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ListarPropietario /></PrivateRoute>} />
       <Route path="/transporte/propietarios/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><RegistrarPropietario /></PrivateRoute>} />
       <Route path="/transporte/propietarios/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ActualizarPropietario /></PrivateRoute>} />

       {/* Transporte - Conductores */}
       <Route path="/transporte/conductores" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_CONDUCTOR]}><ListarConductor /></PrivateRoute>} />
       <Route path="/transporte/conductores/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_CONDUCTOR]}><RegistrarConductor /></PrivateRoute>} />
       <Route path="/transporte/conductores/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_CONDUCTOR]}><ActualizarConductor /></PrivateRoute>} />

       {/* Transporte - Destinos */}
       <Route path="/transporte/destinos" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_DESTINO]}><ListarDestino /></PrivateRoute>} />
       <Route path="/transporte/destinos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_DESTINO]}><RegistrarDestino /></PrivateRoute>} />
       <Route path="/transporte/destinos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_DESTINO]}><ActualizarDestino /></PrivateRoute>} />

       {/* Transporte - Rutas */}
       <Route path="/transporte/rutas" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_RUTA]}><ListarRutaProgramacion /></PrivateRoute>} />
       <Route path="/transporte/rutas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_RUTA]}><RegistrarRutaProgramacion /></PrivateRoute>} />
       <Route path="/transporte/rutas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_RUTA]}><ActualizarRutaProgramacion /></PrivateRoute>} />

      {/* Ventas */}
      <Route path="/ventas/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VENTA]}><ListarVenta /></PrivateRoute>} />
      <Route path="/ventas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_VENTA]}><RegistrarVenta /></PrivateRoute>} />
      <Route path="/ventas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_VENTA]}><ActualizarVenta /></PrivateRoute>} />

      {/* Cualquier ruta no reconocida redirige al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default AppRoutes