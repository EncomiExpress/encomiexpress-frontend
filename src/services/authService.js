import { API_URL } from '../config/api';

// Clave para storing el token en localStorage
const TOKEN_KEY = 'encomi_token';
const USER_KEY = 'encomi_usuario';

// Obtener token del localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Obtener usuario del localStorage
export const getUsuario = () => {
  const usuario = localStorage.getItem(USER_KEY);
  return usuario ? JSON.parse(usuario) : null;
};

// Guardar token y usuario en localStorage
export const setAuthData = (token, usuario) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

// Limpiar datos de autenticación
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Función helper para hacer peticiones con token
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
export const login = async (email, password) => {
  const data = await fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Guardar token y usuario
  if (data.success && data.data.token) {
    setAuthData(data.data.token, data.data.usuario);
  }

  return data;
};

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
export const register = async (userData) => {
  // Mapear los datos del formulario al formato del backend
  const dataBackend = {
    tipoIdentificacion: userData.tipoIdentificacion || 'CC',
    numeroIdentificacion: userData.numeroIdentificacion || '',
    nombre: userData.nombre,
    apellido: userData.apellido || userData.nombre.split(' ').slice(1).join(' '),
    telefono: userData.telefono || '',
    email: userData.email,
    password: userData.password,
    idRol: userData.idRol || 2, // Por defecto vendedor
  };

  const data = await fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dataBackend),
  });

  // Guardar token y usuario si el registro fue exitoso
  if (data.success && data.data.token) {
    setAuthData(data.data.token, data.data.usuario);
  }

  return data;
};

/**
 * Solicitar recuperación de contraseña
 * POST /api/auth/recuperar-password
 */
export const recuperarPassword = async (email) => {
  return await fetchWithAuth('/auth/recuperar-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Restablecer contraseña con token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (token, newPassword) => {
  return await fetchWithAuth('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  });
};

/**
 * Obtener perfil del usuario actual
 * GET /api/auth/profile
 */
export const getProfile = async () => {
  return await fetchWithAuth('/auth/profile', {
    method: 'GET',
  });
};

/**
 * Cerrar sesión (elimina datos locales)
 */
export const logout = () => {
  clearAuthData();
};

// ============================================
// FUNCIONES DE USUARIOS
// ============================================

/**
 * Obtener todos los usuarios
 * GET /api/usuarios
 */
export const getUsuarios = async () => {
  return await fetchWithAuth('/usuarios', {
    method: 'GET',
  });
};

/**
 * Actualizar usuario
 * PUT /api/usuarios/:id
 */
export const actualizarUsuario = async (id, datos) => {
  return await fetchWithAuth(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
};

/**
 * Inhabilitar usuario
 * DELETE /api/usuarios/:id
 */
export const inhabilidadUsuario = async (id) => {
  return await fetchWithAuth(`/usuarios/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// MAPEO DE ROLES
// ============================================

// Mapeo de nombres de rol a IDs (debe coincidir con el backend)
export const ROL_ID_MAP = {
  'Administrador': 1,
  'Gerente': 2,
  'Vendedor': 3,
  'Conductor': 4,
  'Auxiliar': 5,
};

// Obtener ID del rol por nombre
export const getRolId = (rolNombre) => ROL_ID_MAP[rolNombre] || 2;

export default {
  login,
  register,
  recuperarPassword,
  resetPassword,
  getProfile,
  logout,
  getToken,
  getUsuario,
  setAuthData,
  clearAuthData,
  getRolId,
  getUsuarios,
  actualizarUsuario,
  inhabilidadUsuario,
};
