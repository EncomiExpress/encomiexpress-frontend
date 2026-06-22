import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../config/api.js'
import * as rolService from '../services/rolService'
import * as usuarioService from '../services/usuarioService'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

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
  const [sessionExpired, setSessionExpired] = useState(false)

  // Escuchar evento de sesión expirada mid-session (disparado por fetchWithAuth al recibir 401)
  useEffect(() => {
    const handleSessionExpired = () => {
      // Limpiar credenciales del storage pero mantener `usuario` en estado
      // para que SessionExpiredDialog distinga entre "nunca logueado" y "expirado en uso"
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setToken(null)
      setSessionExpired(true)
    }

    // Sincronizar estado cuando fetchWithAuth renueva el access token silenciosamente
    const handleTokenRefreshed = (e) => setToken(e.detail.token)

    window.addEventListener('encomi:session-expired', handleSessionExpired)
    window.addEventListener('encomi:token-refreshed', handleTokenRefreshed)
    return () => {
      window.removeEventListener('encomi:session-expired', handleSessionExpired)
      window.removeEventListener('encomi:token-refreshed', handleTokenRefreshed)
    }
  }, [])

  // Al iniciar, validar el token con el backend antes de restaurar la sesión
  useEffect(() => {
    const validateSession = async () => {
      const tokenGuardado = localStorage.getItem('token')
      const usuarioGuardado = localStorage.getItem('usuario')

      if (!tokenGuardado || !usuarioGuardado) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${tokenGuardado}` }
        })

        if (res.status === 401) {
          // Token expirado o inválido — limpiar sesión y marcar como expirada
          localStorage.removeItem('token')
          localStorage.removeItem('usuario')
          localStorage.removeItem('refreshToken')
          setSessionExpired(true)
          setLoading(false)
          return
        }

        if (!res.ok) {
          // Otro error del servidor — mantener sesión local (puede ser problema de red)
          setToken(tokenGuardado)
          setUsuario(JSON.parse(usuarioGuardado))
          setLoading(false)
          return
        }

        // Token válido — restaurar sesión
        setToken(tokenGuardado)
        setUsuario(JSON.parse(usuarioGuardado))
      } catch {
        // Error de red — restaurar sesión de todos modos para no desloguear sin razón
        setToken(tokenGuardado)
        setUsuario(JSON.parse(usuarioGuardado))
      }

      setLoading(false)
    }

    validateSession()
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

      const { token: tokenNuevo, refreshToken: refreshTokenNuevo, usuario } = data.data

      // Normalizar rol: el backend puede devolver string u objeto { nombre, idRol }
      const rolNombre = typeof usuario.rol === 'string'
        ? usuario.rol
        : usuario.rol?.nombre || null

      const usuarioNormalizado = {
        ...usuario,
        rol: rolNombre ? { nombre: rolNombre } : null
      }

      setSessionExpired(false)
      setToken(tokenNuevo)
      localStorage.setItem('token', tokenNuevo)
      localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado))
      if (refreshTokenNuevo) localStorage.setItem('refreshToken', refreshTokenNuevo)
      setUsuario(usuarioNormalizado)

      return { success: true, usuario: usuarioNormalizado }
    } catch (err) {
      console.error('Error en login:', err)
      return { success: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('usuario')
  }

  const tienePermiso = (permiso) => {
    if (!usuario?.permisos) return false
    return usuario.permisos.includes(permiso)
  }

  const tieneAlgunPermiso = (permisos = []) => permisos.some(p => tienePermiso(p))
  const tieneTodosLosPermisos = (permisos = []) => permisos.every(p => tienePermiso(p))

  const registrarUsuario = async (usuarioData) => {
    try {
      const data = await usuarioService.createUsuario(usuarioData)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const refreshAccessToken = async () => {
    const refreshTokenGuardado = localStorage.getItem('refreshToken')
    if (!refreshTokenGuardado) {
      logout()
      return { success: false }
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenGuardado })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        logout()
        return { success: false }
      }

      const { token: nuevoToken } = data.data
      setToken(nuevoToken)
      localStorage.setItem('token', nuevoToken)

      return { success: true }
    } catch {
      logout()
      return { success: false }
    }
  }

  const recuperarPassword = async () => ({ success: true })

  const getUsuarios = useCallback(async (params = {}) => {
    try {
      const data = await usuarioService.getUsuarios(params)
      return { success: true, data: data.data || [], total: data.total ?? (data.data || []).length }
    } catch {
      return { success: false, data: [], total: 0 }
    }
  }, [])

  const getRolesBackend = useCallback(async (params = {}) => {
    try {
      const data = await rolService.getRoles(params)
      const roles = (data.data || []).map(rol => ({
        ...rol,
        id: rol.id ?? rol.idRol,
        permisosIds: (rol.permisosIds || rol.permisos || []).map(id => Number(id))
      }))
      return { success: true, data: roles, total: data.total ?? roles.length }
    } catch {
      return { success: false, data: [], total: 0 }
    }
  }, [])

  const getPermisosBackend = useCallback(async () => {
    try {
      const data = await rolService.getPermisos()
      return { success: true, data: data.data || [] }
    } catch {
      return { success: false, data: [] }
    }
  }, [])

  const registrarRol = async (nombre, permisos, descripcion) => {
    try {
      const data = await rolService.createRol(nombre, descripcion, permisos)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const actualizarRolBackend = async (id, nombre, permisos, habilitado) => {
    try {
      const data = await rolService.updateRol(id, nombre, permisos, habilitado)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const toggleHabilitadoRol = async (id) => {
    try {
      const data = await rolService.toggleHabilitadoRol(id)
      return { success: true, message: data.message, data: data.data }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const eliminarRolBackend = async (id) => {
    try {
      const data = await rolService.deleteRol(id)
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const actualizarUsuario = async (id, usuarioData) => {
    try {
      const data = await usuarioService.updateUsuario(id, usuarioData)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const habilitarInhabilitarUsuario = async (id) => {
    try {
      const data = await usuarioService.toggleHabilitadoUsuario(id)
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      sessionExpired,
      login,
      logout,
      refreshAccessToken,
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