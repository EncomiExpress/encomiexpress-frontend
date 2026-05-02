import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import LayoutAdmin from '../components/LayoutAdmin.jsx'
import { useAuth } from '../Context/AuthContext.jsx'
import { PERMISOS } from '../Context/AuthContext.jsx'

// Páginas públicas
import Home from '../Pages/Home.jsx'
import Login from '../Pages/Auth/Login.jsx'
import Register from '../Pages/Auth/Register.jsx'

// Páginas privadas - Dashboard
import Dashboard from '../Pages/Dashboard/Dashboard.jsx'

// Cliente
import RegistrarCliente from '../Pages/Cliente/RegistrarCliente.jsx'
import ListarCliente from '../Pages/Cliente/ListarCliente.jsx'
import ActualizarCliente from '../Pages/Cliente/ActualizarCliente.jsx'

// Anticipos
import RegistrarAnticipoExcedente from '../Pages/AnticipoExcedente/RegistrarAnticipoExcedente.jsx'
import ListarAnticipoExcedente from '../Pages/AnticipoExcedente/ListarAnticipoExcedente.jsx'
import ActualizarAnticipoExcedente from '../Pages/AnticipoExcedente/ActualizarAnticipoExcedente.jsx'

// Usuarios
import ListarUsuario from '../Pages/Usuario/ListarUsuario.jsx'
import RegistrarUsuario from '../Pages/Usuario/RegistrarUsuario.jsx'
import ActualizarUsuario from '../Pages/Usuario/ActualizarUsuario.jsx'

// Roles
import RegistrarRol from '../Pages/Rol/RegistrarRol.jsx'
import ActualizarRol from '../Pages/Rol/ActualizarRol.jsx'
import ListarRol from '../Pages/Rol/ListarRol.jsx'

// Vehículos
import RegistrarVehiculo from '../Pages/Vehiculo/RegistrarVehiculo.jsx'
import ActualizarVehiculo from '../Pages/Vehiculo/ActualizarVehiculo.jsx'
import ListarVehiculo from '../Pages/Vehiculo/ListarVehiculo.jsx'

// Propietarios
import ListarPropietario from '../Pages/Propietario/ListarPropietario.jsx'
import RegistrarPropietario from '../Pages/Propietario/RegistrarPropietario.jsx'
import ActualizarPropietario from '../Pages/Propietario/ActualizarPropietario.jsx'

// Conductores
import ListarConductor from '../Pages/Conductor/ListarConductor.jsx'
import RegistrarConductor from '../Pages/Conductor/RegistrarConductor.jsx'
import ActualizarConductor from '../Pages/Conductor/ActualizarConductor.jsx'

// Destinos
import ListarDestino from '../Pages/Destino/ListarDestino.jsx'
import RegistrarDestino from '../Pages/Destino/RegistrarDestino.jsx'
import ActualizarDestino from '../Pages/Destino/ActualizarDestino.jsx'

// Rutas Programación
import ListarRutaProgramacion from '../Pages/RutaProgramacion/ListarRutaProgramacion.jsx'
import RegistrarRutaProgramacion from '../Pages/RutaProgramacion/RegistrarRutaProgramacion.jsx'
import ActualizarRutaProgramacion from '../Pages/RutaProgramacion/ActualizarRutaProgramacion.jsx'

// Ventas
import RegistrarVenta from '../Pages/Venta/RegistrarVenta.jsx'
import ListarVenta from '../Pages/Venta/ListarVenta.jsx'
import ActualizarVenta from '../Pages/Venta/ActualizarVenta.jsx'

// Componente wrapper para rutas privadas con LayoutAdmin
const PrivateRoute = ({ children, permisosRequeridos = [] }) => {
  const { usuario, tieneAlgunPermiso } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (permisosRequeridos.length > 0 && !tieneAlgunPermiso(permisosRequeridos)) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3,
        textAlign: 'center'
      }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </Box>
    )
  }

  return <LayoutAdmin>{children}</LayoutAdmin>
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz con layout público (Home) */}
      <Route path="/" element={<Layout><Home /></Layout>} />

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
      <Route path="/transporte/conductores" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ListarConductor /></PrivateRoute>} />
      <Route path="/transporte/conductores/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><RegistrarConductor /></PrivateRoute>} />
      <Route path="/transporte/conductores/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ActualizarConductor /></PrivateRoute>} />

      {/* Transporte - Destinos */}
      <Route path="/transporte/destinos" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ListarDestino /></PrivateRoute>} />
      <Route path="/transporte/destinos/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><RegistrarDestino /></PrivateRoute>} />
      <Route path="/transporte/destinos/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ActualizarDestino /></PrivateRoute>} />

      {/* Transporte - Rutas */}
      <Route path="/transporte/rutas" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ListarRutaProgramacion /></PrivateRoute>} />
      <Route path="/transporte/rutas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><RegistrarRutaProgramacion /></PrivateRoute>} />
      <Route path="/transporte/rutas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.GESTION_TRANSPORTE]}><ActualizarRutaProgramacion /></PrivateRoute>} />

      {/* Ventas */}
      <Route path="/ventas/listar" element={<PrivateRoute permisosRequeridos={[PERMISOS.LISTAR_VENTA]}><ListarVenta /></PrivateRoute>} />
      <Route path="/ventas/registrar" element={<PrivateRoute permisosRequeridos={[PERMISOS.REGISTRAR_VENTA]}><RegistrarVenta /></PrivateRoute>} />
      <Route path="/ventas/actualizar/:id" element={<PrivateRoute permisosRequeridos={[PERMISOS.ACTUALIZAR_VENTA]}><ActualizarVenta /></PrivateRoute>} />

      {/* Encomiendas (placeholder - pendiente por implementar) */}
      <Route path="/encomiendas/registrar" element={<div>Registrar Encomienda - En desarrollo</div>} />
      <Route path="/encomiendas/listar" element={<div>Listar Encomiendas - En desarrollo</div>} />

      {/* Cualquier ruta no reconocida redirige al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes