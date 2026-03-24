import { createContext, useContext, useState, useEffect } from 'react'
<<<<<<< HEAD
import authService, { getUsuario, logout as authLogout, getAllUsuarios, actualizarUsuario as actualizarUsuarioService, inhabilidadUsuario as inhabilidadUsuarioService } from '../services/authService'
=======
import authService, { getUsuario, logout as authLogout, getAllUsuarios } from '../services/authService'
>>>>>>> 82ae9b43c01bc8d7146675f6787fd06d38c992fc

// ============================================
// DEFINICIONES DE PERMISOS (deben ir primero)
// ============================================

export const PERMISOS = {
  // Permisos de Registrar
  REGISTRAR_CLIENTE: 'registrar_cliente',
  REGISTRAR_ENCOMIENDA: 'registrar_encomienda',
  REGISTRAR_ANTICIPO: 'registrar_anticipo',
  REGISTRAR_VENTA: 'registrar_venta',
  REGISTRAR_USUARIO: 'registrar_usuario',
  REGISTRAR_ROL: 'registrar_rol',
  REGISTRAR_VEHICULO: 'registrar_vehiculo',
  REGISTRAR_RUTA: 'registrar_ruta',
  REGISTRAR_CONDUCTOR: 'registrar_conductor',
  REGISTRAR_DESTINO: 'registrar_destino',

  // Permisos de Listar
  LISTAR_CLIENTE: 'listar_cliente',
  LISTAR_ENCOMIENDA: 'listar_encomienda',
  LISTAR_ANTICIPO: 'listar_anticipo',
  LISTAR_VENTA: 'listar_venta',
  LISTAR_USUARIO: 'listar_usuario',
  LISTAR_ROL: 'listar_rol',
  LISTAR_VEHICULO: 'listar_vehiculo',
  LISTAR_CONDUCTOR: 'listar_conductor',
  LISTAR_DESTINO: 'listar_destino',
  LISTAR_RUTA: 'listar_ruta',

  // Permisos de Consultar
  CONSULTAR_CLIENTE: 'consultar_cliente',
  CONSULTAR_ENCOMIENDA: 'consultar_encomienda',
  CONSULTAR_VENTA: 'consultar_venta',
  CONSULTAR_USUARIO: 'consultar_usuario',
  CONSULTAR_ANTICIPO: 'consultar_anticipo',
  CONSULTAR_ROL: 'consultar_rol',
  CONSULTAR_VEHICULO: 'consultar_vehiculo',
  CONSULTAR_CONDUCTOR: 'consultar_conductor',
  CONSULTAR_DESTINO: 'consultar_destino',
  CONSULTAR_RUTA: 'consultar_ruta',

  // Permisos de Actualizar
  ACTUALIZAR_CLIENTE: 'actualizar_cliente',
  ACTUALIZAR_ENCOMIENDA: 'actualizar_encomienda',
  ACTUALIZAR_VENTA: 'actualizar_venta',
  ACTUALIZAR_USUARIO: 'actualizar_usuario',
  ACTUALIZAR_ANTICIPO: 'actualizar_anticipo',
  ACTUALIZAR_ROL: 'actualizar_rol',
  ACTUALIZAR_VEHICULO: 'actualizar_vehiculo',
  ACTUALIZAR_CONDUCTOR: 'actualizar_conductor',
  ACTUALIZAR_DESTINO: 'actualizar_destino',
  ACTUALIZAR_RUTA: 'actualizar_ruta',

  // Permisos de Inhabilitar
  INHABILITAR_CLIENTE: 'inhabilitar_cliente',
  INHABILITAR_USUARIO: 'inhabilitar_usuario',
  INHABILITAR_VENTA: 'inhabilitar_venta',
}

// Definición de módulos para asignación por módulos
export const MODULOS = {
  USUARIOS: {
    nombre: 'Usuarios',
    permisos: [
      PERMISOS.REGISTRAR_USUARIO,
      PERMISOS.LISTAR_USUARIO,
      PERMISOS.CONSULTAR_USUARIO,
      PERMISOS.ACTUALIZAR_USUARIO,
      PERMISOS.INHABILITAR_USUARIO,
    ]
  },
  ROLES: {
    nombre: 'Roles',
    permisos: [
      PERMISOS.REGISTRAR_ROL,
      PERMISOS.LISTAR_ROL,
      PERMISOS.CONSULTAR_ROL,
      PERMISOS.ACTUALIZAR_ROL,
    ]
  },
  CLIENTES: {
    nombre: 'Clientes',
    permisos: [
      PERMISOS.REGISTRAR_CLIENTE,
      PERMISOS.LISTAR_CLIENTE,
      PERMISOS.CONSULTAR_CLIENTE,
      PERMISOS.ACTUALIZAR_CLIENTE,
      PERMISOS.INHABILITAR_CLIENTE,
    ]
  },
  VEHICULOS: {
    nombre: 'Vehículos',
    permisos: [
      PERMISOS.REGISTRAR_VEHICULO,
      PERMISOS.LISTAR_VEHICULO,
      PERMISOS.CONSULTAR_VEHICULO,
      PERMISOS.ACTUALIZAR_VEHICULO,
    ]
  },
  CONDUCTORES: {
    nombre: 'Conductores',
    permisos: [
      PERMISOS.REGISTRAR_CONDUCTOR,
      PERMISOS.LISTAR_CONDUCTOR,
      PERMISOS.CONSULTAR_CONDUCTOR,
      PERMISOS.ACTUALIZAR_CONDUCTOR,
    ]
  },
  DESTINOS: {
    nombre: 'Destinos',
    permisos: [
      PERMISOS.REGISTRAR_DESTINO,
      PERMISOS.LISTAR_DESTINO,
      PERMISOS.CONSULTAR_DESTINO,
      PERMISOS.ACTUALIZAR_DESTINO,
    ]
  },
  RUTAS: {
    nombre: 'Rutas',
    permisos: [
      PERMISOS.REGISTRAR_RUTA,
      PERMISOS.LISTAR_RUTA,
      PERMISOS.CONSULTAR_RUTA,
      PERMISOS.ACTUALIZAR_RUTA,
    ]
  },
  ENCOMIENDAS: {
    nombre: 'Encomiendas',
    permisos: [
      PERMISOS.REGISTRAR_ENCOMIENDA,
      PERMISOS.LISTAR_ENCOMIENDA,
      PERMISOS.CONSULTAR_ENCOMIENDA,
      PERMISOS.ACTUALIZAR_ENCOMIENDA,
    ]
  },
  ANTICIPOS: {
    nombre: 'Anticipos',
    permisos: [
      PERMISOS.REGISTRAR_ANTICIPO,
      PERMISOS.LISTAR_ANTICIPO,
      PERMISOS.CONSULTAR_ANTICIPO,
      PERMISOS.ACTUALIZAR_ANTICIPO,
    ]
  },
  VENTAS: {
    nombre: 'Ventas',
    permisos: [
      PERMISOS.REGISTRAR_VENTA,
    ]
  },
}

// ============================================
// MAPEOS DE PERMISOS Y ROLES (después de PERMISOS)
// ============================================

// Mapeo de permisos del backend a permisos del frontend
const MAPEO_PERMISOS = {
  'usuarios': [
    PERMISOS.REGISTRAR_USUARIO,
    PERMISOS.LISTAR_USUARIO,
    PERMISOS.CONSULTAR_USUARIO,
    PERMISOS.ACTUALIZAR_USUARIO,
    PERMISOS.INHABILITAR_USUARIO,
  ],
  'roles': [
    PERMISOS.REGISTRAR_ROL,
    PERMISOS.LISTAR_ROL,
    PERMISOS.CONSULTAR_ROL,
    PERMISOS.ACTUALIZAR_ROL,
  ],
  'clientes': [
    PERMISOS.REGISTRAR_CLIENTE,
    PERMISOS.LISTAR_CLIENTE,
    PERMISOS.CONSULTAR_CLIENTE,
    PERMISOS.ACTUALIZAR_CLIENTE,
    PERMISOS.INHABILITAR_CLIENTE,
  ],
  'conductores': [
    PERMISOS.REGISTRAR_CONDUCTOR,
    PERMISOS.LISTAR_CONDUCTOR,
    PERMISOS.CONSULTAR_CONDUCTOR,
    PERMISOS.ACTUALIZAR_CONDUCTOR,
  ],
  'vehiculos': [
    PERMISOS.REGISTRAR_VEHICULO,
    PERMISOS.LISTAR_VEHICULO,
    PERMISOS.CONSULTAR_VEHICULO,
    PERMISOS.ACTUALIZAR_VEHICULO,
  ],
  'destinos': [
    PERMISOS.REGISTRAR_DESTINO,
    PERMISOS.LISTAR_DESTINO,
    PERMISOS.CONSULTAR_DESTINO,
    PERMISOS.ACTUALIZAR_DESTINO,
  ],
  'rutas': [
    PERMISOS.REGISTRAR_RUTA,
    PERMISOS.LISTAR_RUTA,
    PERMISOS.CONSULTAR_RUTA,
    PERMISOS.ACTUALIZAR_RUTA,
  ],
  'encomiendas': [
    PERMISOS.REGISTRAR_ENCOMIENDA,
    PERMISOS.LISTAR_ENCOMIENDA,
    PERMISOS.CONSULTAR_ENCOMIENDA,
    PERMISOS.ACTUALIZAR_ENCOMIENDA,
  ],
  'anticipos': [
    PERMISOS.REGISTRAR_ANTICIPO,
    PERMISOS.LISTAR_ANTICIPO,
    PERMISOS.CONSULTAR_ANTICIPO,
    PERMISOS.ACTUALIZAR_ANTICIPO,
  ],
  'ventas': [
    PERMISOS.REGISTRAR_VENTA,
    PERMISOS.LISTAR_VENTA,
    PERMISOS.CONSULTAR_VENTA,
    PERMISOS.ACTUALIZAR_VENTA,
    PERMISOS.INHABILITAR_VENTA,
  ],
}

// Mapeo de nombres de rol del backend al frontend
const MAPEO_ROLES = {
  'admin': 'Administrador',
  'usuario': 'Vendedor',
  'conductor': 'Conductor',
}

// Convertir permisos del backend a permisos del frontend
const convertirPermisosBackendAFrontend = (permisosBackend) => {
  if (!permisosBackend || !Array.isArray(permisosBackend)) {
    return []
  }
  
  const permisosFrontend = []
  permisosBackend.forEach(permiso => {
    const permisosMapeados = MAPEO_PERMISOS[permiso]
    if (permisosMapeados) {
      permisosFrontend.push(...permisosMapeados)
    }
  })
  
  return [...new Set(permisosFrontend)] // Eliminar duplicados
}

// Convertir nombre de rol del backend al frontend
const convertirRolBackendAFrontend = (rolBackend) => {
  return MAPEO_ROLES[rolBackend] || rolBackend
}

// ============================================
// DEFINICIONES DE ROLES
// ============================================

// Obtenemos todos los permisos disponibles
const todosLosPermisos = Object.values(PERMISOS)

export const ROLES = {
  ADMINISTRADOR: {
    id: 1,
    nombre: 'Administrador',
    permisos: todosLosPermisos, // Tiene todos los permisos
  },
  GERENTE: {
    id: 2,
    nombre: 'Gerente',
    permisos: [
      // Listar
      PERMISOS.LISTAR_CLIENTE,
      PERMISOS.LISTAR_ENCOMIENDA,
      PERMISOS.LISTAR_ANTICIPO,
      PERMISOS.LISTAR_VENTA,
      // Consultar
      PERMISOS.CONSULTAR_CLIENTE,
      PERMISOS.CONSULTAR_ENCOMIENDA,
      PERMISOS.CONSULTAR_VENTA,
      // Actualizar
      PERMISOS.ACTUALIZAR_CLIENTE,
      PERMISOS.ACTUALIZAR_ENCOMIENDA,
      PERMISOS.ACTUALIZAR_ANTICIPO,
      PERMISOS.ACTUALIZAR_VENTA,
      // Inhabilitar
      PERMISOS.INHABILITAR_CLIENTE,
      PERMISOS.INHABILITAR_USUARIO,
      PERMISOS.INHABILITAR_VENTA,
    ],
  },
  VENDEDOR: {
    id: 3,
    nombre: 'Vendedor',
    permisos: [
      // Registrar
      PERMISOS.REGISTRAR_CLIENTE,
      PERMISOS.REGISTRAR_ENCOMIENDA,
      PERMISOS.REGISTRAR_VENTA,
      // Listar
      PERMISOS.LISTAR_CLIENTE,
      PERMISOS.LISTAR_ENCOMIENDA,
      PERMISOS.LISTAR_VENTA,
      // Consultar
      PERMISOS.CONSULTAR_CLIENTE,
      PERMISOS.CONSULTAR_VENTA,
    ],
  },
  CONDUCTOR: {
    id: 4,
    nombre: 'Conductor',
    permisos: [
      // Registrar
      PERMISOS.REGISTRAR_ANTICIPO,
      // Listar
      PERMISOS.LISTAR_ANTICIPO,
      // Actualizar
      PERMISOS.ACTUALIZAR_ANTICIPO,
    ],
  },
  AUXILIAR: {
    id: 5,
    nombre: 'Auxiliar',
    permisos: [
      // Registrar
      PERMISOS.REGISTRAR_ENCOMIENDA,
      // Listar
      PERMISOS.LISTAR_CLIENTE,
      PERMISOS.LISTAR_ENCOMIENDA,
      PERMISOS.LISTAR_ANTICIPO,
      // Consultar
      PERMISOS.CONSULTAR_CLIENTE,
      PERMISOS.CONSULTAR_ENCOMIENDA,
    ],
  },
}

// Obtener permisos del rol por nombre
const getPermisosPorRol = (nombreRol) => {
  const rol = Object.values(ROLES).find(r => r.nombre === nombreRol)
  return rol ? rol.permisos : []
}

// Obtener permisos por nombre de rol (función helper)
const getPermisosPorNombreRol = (nombreRol) => {
  const rol = Object.values(ROLES).find(r => r.nombre === nombreRol)
  return rol ? rol.permisos : []
}

// Convertir respuesta del backend a formato del frontend
const formatUsuarioFromBackend = (backendUser) => {
  // Convertir el nombre del rol
  const nombreRolFrontend = convertirRolBackendAFrontend(backendUser.rol)
  
  // Convertir los permisos del backend a formato frontend
  let permisosFrontend = convertirPermisosBackendAFrontend(backendUser.permisos)
  
  // SOLUCIÓN: Si los permisos vienen vacíos, asignar permisos según el rol
  if (!permisosFrontend || permisosFrontend.length === 0) {
    console.log(`[DEBUG] Permisos vacíos para rol ${nombreRolFrontend}, asignando permisos predefinidos`)
    permisosFrontend = getPermisosPorNombreRol(nombreRolFrontend)
    
    // Si aún no hay permisos, dar permisos básicos de Vendedor por defecto
    if (!permisosFrontend || permisosFrontend.length === 0) {
      console.log(`[DEBUG] Asignando permisos de Vendedor por defecto`)
      permisosFrontend = ROLES.VENDEDOR.permisos
    }
  }
  
  return {
    idUsuario: backendUser.idUsuario,
    nombre: backendUser.nombre,
    apellido: backendUser.apellido,
    email: backendUser.email,
    rol: {
      nombre: nombreRolFrontend,
      permisos: permisosFrontend, // Usar permisos convertidos
    },
    permisos: permisosFrontend, // También almacenar a nivel raíz para compatibilidad
  }
}

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sesión al cargar la app
  useEffect(() => {
    const initAuth = () => {
      const storedUser = getUsuario()
      if (storedUser) {
        // Formatear el usuario almacenado para asegurar que tenga los permisos correctos
        const usuarioFormateado = formatUsuarioFromBackend({
          idUsuario: storedUser.idUsuario,
          nombre: storedUser.nombre,
          apellido: storedUser.apellido,
          email: storedUser.email,
          rol: storedUser.rol?.nombre || storedUser.rol,
          permisos: storedUser.permisos || storedUser.rol?.permisos || [],
        })
        console.log('[DEBUG] initAuth - usuario formateado:', usuarioFormateado)
        setUsuario(usuarioFormateado)
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  // Función de login - conecta con el backend
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      
      if (response.success) {
        console.log('[DEBUG] Login response - usuario completo:', response.data.usuario)
        const usuarioFormateado = formatUsuarioFromBackend(response.data.usuario)
        console.log('[DEBUG] Login - usuario formateado:', usuarioFormateado)
        setUsuario(usuarioFormateado)
        return { success: true, usuario: usuarioFormateado }
      } else {
        return { success: false, mensaje: response.message }
      }
    } catch (error) {
      return { success: false, mensaje: error.message || 'Error de conexión' }
    }
  }

  // Función de logout - limpia sesión
  const logout = () => {
    authLogout()
    setUsuario(null)
  }

  // Verificar si tiene un permiso específico
  const tienePermiso = (permiso) => {
    if (!usuario) return false
    // Usar permisos del rol primero, o los permisos directos del usuario
    if (usuario.rol?.permisos && usuario.rol.permisos.length > 0) {
      return usuario.rol.permisos.includes(permiso)
    }
    return usuario.permisos?.includes(permiso) || false
  }

  // Verificar si tiene alguno de los permisos dados
  const tieneAlgunPermiso = (permisos) => {
    if (!usuario) return false
    if (usuario.rol?.permisos && usuario.rol.permisos.length > 0) {
      return permisos.some(p => usuario.rol.permisos.includes(p))
    }
    return permisos.some(p => usuario.permisos?.includes(p))
  }

  // Verificar si tiene todos los permisos dados
  const tieneTodosLosPermisos = (permisos) => {
    if (!usuario) return false
    if (usuario.rol?.permisos && usuario.rol.permisos.length > 0) {
      return permisos.every(p => usuario.rol.permisos.includes(p))
    }
    return permisos.every(p => usuario.permisos?.includes(p))
  }

  // Obtener todos los roles disponibles
  const getRoles = () => Object.values(ROLES)

  // Registrar usuario - conecta con el backend
  // autoLogin: true para self-registration (cuando no hay nadie logueado)
  // autoLogin: false para cuando un admin registra otro usuario
  const registrarUsuario = async (nuevoUsuario, autoLogin = true) => {
    try {
      const response = await authService.register(nuevoUsuario, autoLogin)
      
      if (response.success) {
        const usuarioFormateado = formatUsuarioFromBackend(response.data.usuario)
        
        // Solo iniciar sesión automáticamente si autoLogin es true Y NO hay un usuario logueado actualmente
        // (para auto-registro). Si un admin registra otro usuario, no debe hacer auto-login
        if (autoLogin && !usuario) {
          setUsuario(usuarioFormateado)
        }
        
        return { success: true, usuario: usuarioFormateado }
      } else {
        return { success: false, mensaje: response.message }
      }
    } catch (error) {
      return { success: false, mensaje: error.message || 'Error de conexión' }
    }
  }

  // Recuperar contraseña
  const recuperarPassword = async (email) => {
    try {
      const response = await authService.recuperarPassword(email)
      return response
    } catch (error) {
      return { success: false, message: error.message || 'Error de conexión' }
    }
  }

  // Función para recargar usuario desde el backend
  const recargarUsuario = async () => {
    try {
      const response = await authService.getProfile()
      if (response.success) {
        const usuarioFormateado = formatUsuarioFromBackend(response.data)
        setUsuario(usuarioFormateado)
        return usuarioFormateado
      }
    } catch (error) {
      console.error('Error al recargar usuario:', error)
    }
    return null
  }

  // Función para obtener todos los usuarios
  const getUsuarios = async () => {
    try {
      const response = await getAllUsuarios()
      if (response.success && response.data) {
        // Mapear los usuarios del backend al formato esperado
        return response.data.map(u => ({
          id: u.idUsuario || u.id,
          nombre: u.nombre,
          email: u.email,
          iniciales: u.iniciales || (u.nombre ? u.nombre.substring(0, 2).toUpperCase() : '??'),
          rol: {
            nombre: u.rol?.nombre || u.rol || 'Vendedor'
          },
          habilitado: u.habilitado !== false,
          estado: u.estado || (u.habilitado !== false ? 'Activo' : 'Inactivo'),
        }))
      }
      return []
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return []
    }
  }

<<<<<<< HEAD
  // Función para actualizar un usuario
  const actualizarUsuario = async (id, datos) => {
    try {
      const response = await actualizarUsuarioService(id, datos)
      return response
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return { success: false, message: error.message || 'Error al actualizar usuario' }
    }
  }

  // Función para habilitar/inhabilitar un usuario
  const inhabilidadUsuario = async (id) => {
    try {
      const response = await inhabilidadUsuarioService(id)
      return response
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error)
      return { success: false, message: error.message || 'Error al cambiar estado del usuario' }
    }
  }

=======
>>>>>>> 82ae9b43c01bc8d7146675f6787fd06d38c992fc
  return (
    <AuthContext.Provider value={{
      usuario,
      loading,
      login,
      logout,
      tienePermiso,
      tieneAlgunPermiso,
      tieneTodosLosPermisos,
      getRoles,
      registrarUsuario,
      recuperarPassword,
      recargarUsuario,
      getUsuarios,
<<<<<<< HEAD
      actualizarUsuario,
      inhabilidadUsuario,
=======
>>>>>>> 82ae9b43c01bc8d7146675f6787fd06d38c992fc
      ROLES,
      PERMISOS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
