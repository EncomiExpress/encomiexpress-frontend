import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../config/api.js'
import { STORAGE_KEYS } from '../config/storageKeys.js'
import { PERMISOS } from '../config/permisos.js'
import * as rolService from '../services/rolService'
import * as usuarioService from '../../features/usuarios/services/usuarioService.js'
import { fetchWithAuth, getToken } from '../services/authService.js'
import { getErrorMessage } from '../utils/errorMessage.js'

export { PERMISOS }

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// IDs reales de la tabla `rol` (init.sql): admin=1, conductor=2, distribuidor=3,
// operador_sede=4. `conductor` y `distribuidor` son solo-móvil (sin permisos
// granulares); el login web los rechaza (ver login() más abajo). `operador_sede`
// SÍ es panel web, con un panel recortado (ver LOGICA.md, "Sedes remotas").
// Único consumidor de esta constante: ActualizarUsuario.jsx, y solo como
// fallback si el usuario no trajera idRol.
// `codigo` es el identificador estable (Rol.codigo en el backend) — nunca
// cambia aunque se renombre el rol. `nombre` es el valor de fábrica, solo
// útil como texto por defecto; no lo uses para comparar.
export const ROLES = {
  ADMIN: { id: 1, nombre: 'admin', codigo: 'admin' },
  CONDUCTOR: { id: 2, nombre: 'conductor', codigo: 'conductor' },
  DISTRIBUIDOR: { id: 3, nombre: 'distribuidor', codigo: 'distribuidor' },
  OPERADOR_SEDE: { id: 4, nombre: 'operador_sede', codigo: 'operador_sede' },
}

export const MODULOS = {
  DASHBOARD:    { nombre: 'Dashboard',    listar: null,                  permisos: ['ver_dashboard'] },
  MOVIL:        { nombre: 'App Móvil',    listar: null,                  permisos: ['acceder_app_movil'] },
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
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
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
      const tokenGuardado = sessionStorage.getItem(STORAGE_KEYS.TOKEN)
      const usuarioGuardado = sessionStorage.getItem(STORAGE_KEYS.USUARIO)

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
          // `codigo` es el identificador estable del rol (ver Rol.codigo en el
          // backend) — todo lo que decide comportamiento (redirecciones, sidebar,
          // exclusiones) compara contra esto, nunca contra `nombre` (editable
          // libremente). Ver LOGICA.md, "Rol: nombre editable vs codigo".
          const rolCodigo = perfilFresco.rolCodigo ?? null
          const usuarioActualizado = { ...perfilFresco, rol: rolNombre ? { nombre: rolNombre, codigo: rolCodigo } : null }
          setToken(getToken())
          setUsuario(usuarioActualizado)
          sessionStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioActualizado))
        } else {
          setToken(tokenGuardado)
          setUsuario(JSON.parse(usuarioGuardado))
        }
      } catch (err) {
        if (err.status === 401) {
          // fetchWithAuth ya intentó el refresh y también falló (pasaron las
          // 24h reales) — ahí sí, sesión expirada de verdad.
          sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
          sessionStorage.removeItem(STORAGE_KEYS.USUARIO)
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
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
      // Identificador estable del rol — ver nota en validateSession() arriba.
      const rolCodigo = usuario.rolCodigo ?? null

      // Antes esto comparaba el nombre del rol a mano (['conductor','distribuidor']).
      // Ahora es dinámico: un rol sin NINGÚN permiso de panel web (los 50
      // verbo_entidad + ver_dashboard — 'acceder_app_movil' no cuenta, es el único
      // que no es de panel web) no tiene nada que hacer acá, sin importar su
      // nombre. Así, un rol futuro creado solo para la app móvil queda bloqueado
      // del panel automáticamente, sin tocar este archivo — y un rol mixto que sí
      // tenga algún permiso de panel web (ej. admin, que también tiene
      // 'acceder_app_movil') nunca queda bloqueado por error. Ver LOGICA.md,
      // "Permiso acceder_app_movil".
      const permisosWeb = (usuario.permisos || []).filter(p => p !== 'acceder_app_movil')
      if (permisosWeb.length === 0) {
        return { success: false, mensaje: 'Esta cuenta es solo para la aplicación móvil de EncomiExpress.' }
      }

      const usuarioNormalizado = {
        ...usuario,
        rol: rolNombre ? { nombre: rolNombre, codigo: rolCodigo } : null
      }

      setSessionExpired(false)
      setToken(tokenNuevo)
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, tokenNuevo)
      sessionStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioNormalizado))
      if (refreshTokenNuevo) sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshTokenNuevo)
      setUsuario(usuarioNormalizado)

      return { success: true, usuario: usuarioNormalizado }
    } catch {
      return { success: false, mensaje: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.USUARIO)
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

  const getUsuarios = useCallback(async (params = {}, signal) => {
    try {
      const data = await usuarioService.getUsuarios(params, signal)
      return { success: true, data: data.data || [], total: data.total ?? (data.data || []).length }
    } catch (err) {
      // AbortError es una cancelación deliberada (ver ListarUsuario.jsx) — no es un
      // error real, se relanza tal cual para que el catch de useEntityCrud la ignore
      // en vez de tratarla como un fallo silencioso que vaciara la tabla sin avisar.
      if (err?.name === 'AbortError') throw err
      return { success: false, data: [], total: 0, message: err.message || 'Error al cargar usuarios' }
    }
  }, [])

  const getRolesBackend = useCallback(async (params = {}, signal) => {
    try {
      const data = await rolService.getRoles(params, signal)
      const roles = (data.data || []).map(rol => ({
        ...rol,
        id: rol.id ?? rol.idRol,
        permisosIds: (rol.permisosIds || rol.permisos || []).map(id => Number(id))
      }))
      return { success: true, data: roles, total: data.total ?? roles.length }
    } catch (err) {
      // Mismo criterio que getUsuarios: un AbortError es una cancelación deliberada
      // (ver ListarRol.jsx), no un error real — se relanza para que el catch de
      // useEntityCrud la ignore en vez de tratarla como un fallo silencioso que
      // vaciara la tabla sin avisar.
      if (err?.name === 'AbortError') throw err
      return { success: false, data: [], total: 0, message: err.message || 'Error al cargar roles' }
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
      // getErrorMessage arma "campo: mensaje" a partir de err.details (que
      // fetchWithAuth sí adjunta) -- antes se descartaba acá y solo quedaba el
      // mensaje genérico de arriba ("Errores de validación"), sin decir cuál
      // campo ni por qué.
      return { success: false, message: getErrorMessage(err, 'Error de conexión') }
    }
  }

  const actualizarRolBackend = async (id, nombre, descripcion, permisos, habilitado) => {
    try {
      const data = await rolService.updateRol(id, nombre, descripcion, permisos, habilitado)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: getErrorMessage(err, 'Error de conexión') }
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

  const actualizarUsuario = async (id, usuarioData) => {
    try {
      const data = await usuarioService.updateUsuario(id, usuarioData)
      return { success: true, data: data.data, message: data.message }
    } catch (err) {
      return { success: false, message: err.message || 'Error de conexión' }
    }
  }

  const habilitarInhabilitarUsuario = async (id) => {
    // A propósito NO se atrapa el error acá — fetchWithAuth ya lanza un Error con
    // el mensaje real del backend (ej. los 6 guardias de toggleHabilitado, ver
    // LOGICA.md "Inhabilitar (toggle-habilitado)"). Quien llama (useUsuarioAcciones)
    // necesita ese throw para distinguir éxito de bloqueo — antes se atrapaba acá y
    // se devolvía {success:false} silenciosamente, y como nadie revisaba ese
    // `.success`, CUALQUIER bloqueo (admin id=1, último admin, conductor con rutas
    // activas, cliente con encomiendas activas, y ahora también el choque de
    // correo/documento al rehabilitar) terminaba mostrando igual el toast de éxito.
    const data = await usuarioService.toggleHabilitadoUsuario(id)
    return { success: true, message: data.message }
  }

  // Sede activa del usuario (operador_sede) — null para roles sin sede propia
  // (admin) o mientras la sesión sigue cargando. Ver LOGICA.md, "Sedes remotas".
  const sedeActual = usuario?.sede ?? null

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      sessionExpired,
      sedeActual,
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