import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const API_URL = 'http://localhost:3000/api' // ← ajusta si tu URL es diferente

export const ROLES = {
  ADMIN: { id: 1, nombre: 'admin' },
  USUARIO: { id: 2, nombre: 'usuario' },
  CONDUCTOR: { id: 3, nombre: 'conductor' },
}

export const MODULOS = {
  DASHBOARD: { nombre: 'Dashboard', permisos: ['ver_dashboard'] },
  USUARIOS: { nombre: 'Usuarios', permisos: ['listar_usuario', 'registrar_usuario', 'consultar_usuario', 'actualizar_usuario', 'inhabilitar_usuario'] },
  ROLES: { nombre: 'Roles', permisos: ['listar_rol', 'registrar_rol', 'consultar_rol', 'actualizar_rol', 'inhabilitar_rol'] },
  CLIENTES: { nombre: 'Clientes', permisos: ['listar_cliente', 'registrar_cliente', 'consultar_cliente', 'actualizar_cliente', 'inhabilitar_cliente'] },
  VEHICULOS: { nombre: 'Vehículos', permisos: ['listar_vehiculo', 'registrar_vehiculo', 'consultar_vehiculo', 'actualizar_vehiculo'] },
  CONDUCTORES: { nombre: 'Conductores', permisos: ['listar_conductor', 'registrar_conductor', 'consultar_conductor', 'actualizar_conductor'] },
  DESTINOS: { nombre: 'Destinos', permisos: ['listar_destino', 'registrar_destino', 'consultar_destino', 'actualizar_destino'] },
  RUTAS: { nombre: 'Rutas', permisos: ['listar_ruta', 'registrar_ruta', 'consultar_ruta', 'actualizar_ruta'] },
  RUTAS_PROGRAMACION: { nombre: 'Rutas Programación', permisos: ['listar_ruta_programacion', 'registrar_ruta_programacion', 'consultar_ruta_programacion', 'actualizar_ruta_programacion'] },
  ANTICIPOS: { nombre: 'Anticipos', permisos: ['listar_anticipo', 'registrar_anticipo', 'consultar_anticipo', 'actualizar_anticipo'] },
  VENTAS: { nombre: 'Ventas', permisos: ['listar_encomienda', 'registrar_encomienda', 'consultar_encomienda', 'actualizar_encomienda'] },
  ENCOMIENDAS: { nombre: 'Encomiendas', permisos: ['listar_encomienda', 'registrar_encomienda', 'consultar_encomienda', 'actualizar_encomienda'] },
  TRANSPORTE: { nombre: 'Transporte', permisos: ['gestion_transporte'] },
}

export const PERMISOS = {
  LISTAR_CLIENTE: 'listar_cliente',
  REGISTRAR_CLIENTE: 'registrar_cliente',
  ACTUALIZAR_CLIENTE: 'actualizar_cliente',
  CONSULTAR_CLIENTE: 'consultar_cliente',
  INHABILITAR_CLIENTE: 'inhabilitar_cliente',
  LISTAR_ANTICIPO: 'listar_anticipo',
  REGISTRAR_ANTICIPO: 'registrar_anticipo',
  ACTUALIZAR_ANTICIPO: 'actualizar_anticipo',
  CONSULTAR_ANTICIPO: 'consultar_anticipo',
  LISTAR_USUARIO: 'listar_usuario',
  REGISTRAR_USUARIO: 'registrar_usuario',
  ACTUALIZAR_USUARIO: 'actualizar_usuario',
  CONSULTAR_USUARIO: 'consultar_usuario',
  INHABILITAR_USUARIO: 'inhabilitar_usuario',
  LISTAR_ROL: 'listar_rol',
  REGISTRAR_ROL: 'registrar_rol',
  ACTUALIZAR_ROL: 'actualizar_rol',
  CONSULTAR_ROL: 'consultar_rol',
  INHABILITAR_ROL: 'inhabilitar_rol',
  LISTAR_VEHICULO: 'listar_vehiculo',
  REGISTRAR_VEHICULO: 'registrar_vehiculo',
  ACTUALIZAR_VEHICULO: 'actualizar_vehiculo',
  CONSULTAR_VEHICULO: 'consultar_vehiculo',
  GESTION_TRANSPORTE: 'gestion_transporte',
  LISTAR_VENTA: 'listar_encomienda',
  REGISTRAR_VENTA: 'registrar_encomienda',
  ACTUALIZAR_VENTA: 'actualizar_encomienda',
  CONSULTAR_VENTA: 'consultar_encomienda',
  LISTAR_ENCOMIENDA: 'listar_encomienda',
  REGISTRAR_ENCOMIENDA: 'registrar_encomienda',
  ACTUALIZAR_ENCOMIENDA: 'actualizar_encomienda',
  CONSULTAR_ENCOMIENDA: 'consultar_encomienda',
  LISTAR_CONDUCTOR: 'listar_conductor',
  REGISTRAR_CONDUCTOR: 'registrar_conductor',
  ACTUALIZAR_CONDUCTOR: 'actualizar_conductor',
  CONSULTAR_CONDUCTOR: 'consultar_conductor',
  LISTAR_DESTINO: 'listar_destino',
  REGISTRAR_DESTINO: 'registrar_destino',
  ACTUALIZAR_DESTINO: 'actualizar_destino',
  CONSULTAR_DESTINO: 'consultar_destino',
  LISTAR_RUTA: 'listar_ruta',
  REGISTRAR_RUTA: 'registrar_ruta',
  ACTUALIZAR_RUTA: 'actualizar_ruta',
  CONSULTAR_RUTA: 'consultar_ruta',
  LISTAR_RUTA_PROGRAMACION: 'listar_ruta_programacion',
  REGISTRAR_RUTA_PROGRAMACION: 'registrar_ruta_programacion',
  ACTUALIZAR_RUTA_PROGRAMACION: 'actualizar_ruta_programacion',
  CONSULTAR_RUTA_PROGRAMACION: 'consultar_ruta_programacion',
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('✅ AuthProvider montado')

  // Al iniciar, restaurar sesión desde localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return { success: false, mensaje: data.message || 'Credenciales inválidas' }
      }

      const { token: tokenNuevo, usuario } = data.data

      // Normalizar rol: el backend puede devolver string u objeto { nombre, idRol }
      const rolNombre = typeof usuario.rol === 'string'
        ? usuario.rol
        : usuario.rol?.nombre || null

      const usuarioNormalizado = {
        ...usuario,
        rol: rolNombre ? { nombre: rolNombre } : null
      }

      setToken(tokenNuevo)
      localStorage.setItem('token', tokenNuevo)
      localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado))
      setUsuario(usuarioNormalizado)

      return { success: true, usuario: usuarioNormalizado }
    } catch (err) {
      console.error('Error en login:', err)
      return { success: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const tienePermiso = (permiso) => {
    console.log('verificando permiso:', permiso, '| permisos del usuario:', usuario?.permisos)
    if (!usuario?.permisos) return false
    return usuario.permisos.includes(permiso)
  }

  const tieneAlgunPermiso = (permisos = []) => permisos.some(p => tienePermiso(p))
  const tieneTodosLosPermisos = (permisos = []) => permisos.every(p => tienePermiso(p))

  const registrarUsuario = async (usuarioData) => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(usuarioData)
      })
      const data = await res.json()
      return { success: res.ok, data: data.data, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const recuperarPassword = async () => ({ success: true })

  // Backend real
  const getUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return { success: res.ok, data: data.data || [] }
    } catch {
      return { success: false, data: [] }
    }
  }

  const getRolesBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const roles = (data.data || []).map(rol => ({
        ...rol,
        id: rol.id ?? rol.idRol,
        permisosIds: (rol.permisosIds || rol.permisos || []).map(id => Number(id))
      }))
      return { success: res.ok, data: roles }
    } catch {
      return { success: false, data: [] }
    }
  }

  const getPermisosBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/permisos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return { success: res.ok, data: data.data || [] }
    } catch {
      return { success: false, data: [] }
    }
  }

  const registrarRol = async (nombre, permisos, descripcion) => {
    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, descripcion, permisos })
      })
      const data = await res.json()
      return { success: res.ok, data: data.data, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const actualizarRolBackend = async (id, nombre, permisos, habilitado) => {
    try {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, permisos, habilitado })
      })
      const data = await res.json()
      return { success: res.ok, data: data.data, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const toggleHabilitadoRol = async (id) => {
    try {
      const res = await fetch(`${API_URL}/roles/${id}/toggle-habilitado`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return { success: res.ok, message: data.message, data: data.data }
    } catch (error) {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const eliminarRolBackend = async (id) => {
    try {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return { success: res.ok, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const actualizarUsuario = async (id, usuarioData) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(usuarioData)
      })
      const data = await res.json()
      return { success: res.ok, data: data.data, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  const habilitarInhabilitarUsuario = async (id) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/toggle-habilitado`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return { success: res.ok, message: data.message }
    } catch {
      return { success: false, message: 'Error de conexión' }
    }
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      login,
      logout,
      tienePermiso,
      tieneAlgunPermiso,
      tieneTodosLosPermisos,
      registrarUsuario,
      recuperarPassword,
      getRolesBackend,
      getPermisosBackend,
      getUsuarios,
      registrarRol,
      actualizarRolBackend,
      toggleHabilitadoRol,
      eliminarRolBackend,
      actualizarUsuario,
      habilitarInhabilitarUsuario,
      ROLES,
      MODULOS,
      PERMISOS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}