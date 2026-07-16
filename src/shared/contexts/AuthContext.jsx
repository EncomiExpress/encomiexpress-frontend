import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../config/api.js'
import { STORAGE_KEYS } from '../config/storageKeys.js'
import * as rolService from '../services/rolService'
import * as usuarioService from '../services/usuarioService'
import { fetchWithAuth, getToken } from '../services/authService.js'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const ROLES = {
  ADMIN: { id: 1, nombre: 'admin' },
  USUARIO: { id: 2, nombre: 'usuario' },
  CONDUCTOR: { id: 3, nombre: 'conductor' },
}

export const MODULOS = {
  DASHBOARD:    { nombre: 'Dashboard',    listar: null,                  permisos: ['ver_dashboard'] },
  ROLES:        { nombre: 'Roles',        listar: 'listar_rol',          permisos: ['registrar_rol', 'consultar_rol', 'actualizar_rol', 'inhabilitar_rol'] },
  USUARIOS:     { nombre: 'Usuarios',     listar: 'listar_usuario',      permisos: ['registrar_usuario', 'consultar_usuario', 'actualizar_usuario', 'inhabilitar_usuario'] },
  PROPIETARIOS: { nombre: 'Propietarios', listar: 'listar_propietario',  permisos: ['registrar_propietario', 'consultar_propietario', 'actualizar_propietario', 'inhabilitar_propietario'] },
  CONDUCTORES:  { nombre: 'Conductores',  listar: 'listar_conductor',    permisos: ['registrar_conductor', 'consultar_conductor', 'actualizar_conductor', 'inhabilitar_conductor'] },
  VEHICULOS:    { nombre: 'Vehículos',    listar: 'listar_vehiculo',     permisos: ['registrar_vehiculo', 'consultar_vehiculo', 'actualizar_vehiculo', 'inhabilitar_vehiculo'] },
  DESTINOS:     { nombre: 'Destinos',     listar: 'listar_destino',      permisos: ['registrar_destino', 'consultar_destino', 'actualizar_destino', 'inhabilitar_destino'] },
  RUTAS:        { nombre: 'Rutas',        listar: 'listar_ruta',         permisos: ['registrar_ruta', 'consultar_ruta', 'actualizar_ruta', 'inhabilitar_ruta'] },
  ANTICIPOS:    { nombre: 'Anticipos',    listar: 'listar_anticipo',     permisos: ['registrar_anticipo', 'consultar_anticipo', 'actualizar_anticipo', 'inhabilitar_anticipo'] },
  CLIENTES:     { nombre: 'Clientes',     listar: 'listar_cliente',      permisos: ['registrar_cliente', 'consultar_cliente', 'actualizar_cliente', 'inhabilitar_cliente'] },
  VENTAS:       { nombre: 'Ventas',       listar: 'listar_venta',        permisos: ['registrar_venta', 'consultar_venta', 'actualizar_venta', 'inhabilitar_venta'] },
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
  LISTAR_VENTA: 'listar_venta',
  REGISTRAR_VENTA: 'registrar_venta',
  ACTUALIZAR_VENTA: 'actualizar_venta',
  CONSULTAR_VENTA: 'consultar_venta',
  LISTAR_PROPIETARIO: 'listar_propietario',
  REGISTRAR_PROPIETARIO: 'registrar_propietario',
  ACTUALIZAR_PROPIETARIO: 'actualizar_propietario',
  CONSULTAR_PROPIETARIO: 'consultar_propietario',
  INHABILITAR_PROPIETARIO: 'inhabilitar_propietario',
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
  INHABILITAR_CONDUCTOR: 'inhabilitar_conductor',
  INHABILITAR_VEHICULO: 'inhabilitar_vehiculo',
  INHABILITAR_DESTINO: 'inhabilitar_destino',
  INHABILITAR_RUTA: 'inhabilitar_ruta',
  INHABILITAR_ANTICIPO: 'inhabilitar_anticipo',
  INHABILITAR_VENTA: 'inhabilitar_venta',
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
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
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
      const tokenGuardado = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const usuarioGuardado = localStorage.getItem(STORAGE_KEYS.USUARIO)

      if (!tokenGuardado || !usuarioGuardado) {
        setLoading(false)
        return
      }

      try {
        // fetchWithAuth intenta renovar con el refresh token (24h) si el access
        // token (1h) ya venció, igual que en cualquier petición normal de la app —
        // antes esto usaba fetch() directo y desloguéaba apenas pasaba 1h, sin
        // aprovechar las 24h reales de la sesión.
        const profileData = await fetchWithAuth('/auth/profile')

        if (profileData.success && profileData.data) {
          const perfilFresco = profileData.data
          const rolNombre = typeof perfilFresco.rol === 'string'
            ? perfilFresco.rol
            : perfilFresco.rol?.nombre || null
          const usuarioActualizado = { ...perfilFresco, rol: rolNombre ? { nombre: rolNombre } : null }
          setToken(getToken())
          setUsuario(usuarioActualizado)
          localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioActualizado))
        } else {
          setToken(tokenGuardado)
          setUsuario(JSON.parse(usuarioGuardado))
        }
      } catch (err) {
        if (err.status === 401) {
          // fetchWithAuth ya intentó el refresh y también falló (pasaron las
          // 24h reales) — ahí sí, sesión expirada de verdad.
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USUARIO)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          setSessionExpired(true)
        } else {
          // Error de red u otro problema del servidor — mantener sesión local
          // para no desloguear sin razón.
          setToken(tokenGuardado)
          setUsuario(JSON.parse(usuarioGuardado))
        }
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
      localStorage.setItem(STORAGE_KEYS.TOKEN, tokenNuevo)
      localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioNormalizado))
      if (refreshTokenNuevo) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshTokenNuevo)
      setUsuario(usuarioNormalizado)

      return { success: true, usuario: usuarioNormalizado }
    } catch {
      return { success: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USUARIO)
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

  const actualizarRolBackend = async (id, nombre, descripcion, permisos, habilitado) => {
    try {
      const data = await rolService.updateRol(id, nombre, descripcion, permisos, habilitado)
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

  const ignorarRegistroUsuario = async (id) => {
    try {
      const data = await usuarioService.ignorarRegistroUsuario(id)
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
      ignorarRegistroUsuario,
      ROLES,
      MODULOS,
      PERMISOS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}