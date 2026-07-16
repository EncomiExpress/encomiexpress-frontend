import { API_URL } from '../config/api';

// Clave para storing el token en localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

// Obtener token del localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Guardar token y usuario en localStorage
export const setAuthData = (token, usuario) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

// Función helper para hacer peticiones con token — compartida con todos los servicios
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const ejecutarPeticion = async (authToken) => {
    const reqHeaders = { ...headers };
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: reqHeaders,
      cache: 'no-store',
    });

    const data = await response.json();

    if (response.status === 401) {
      const error = new Error(data.message || 'No autorizado');
      error.status = 401;
      throw error;
    }

    if (response.status === 403) {
      const error = new Error('Sin permisos');
      error.status = 403;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(data.message || 'Error en la petición');
      error.status = response.status;
      error.details = data.details;
      error.errorCode = data.errorCode;
      throw error;
    }

    return data;
  };

  try {
    return await ejecutarPeticion(token);
  } catch (originalError) {
    if (originalError.status !== 401) throw originalError;

    // Intentar renovar con refresh token
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const refreshTokenValido = storedRefreshToken && storedRefreshToken !== 'undefined';

    if (refreshTokenValido) {
      let nuevoToken = null;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success && refreshData.data?.token) {
          nuevoToken = refreshData.data.token;
        }
      } catch {
        // Error de red durante el refresh — tratar como sesión expirada
      }

      if (nuevoToken) {
        localStorage.setItem('token', nuevoToken);
        window.dispatchEvent(new CustomEvent('encomi:token-refreshed', { detail: { token: nuevoToken } }));
        return await ejecutarPeticion(nuevoToken);
      }
    }

    // Sin refresh token válido o el refresh falló — notificar sesión expirada.
    // Solo dispara el evento si había un token activo (evita falsos positivos en login/register).
    if (token) {
      window.dispatchEvent(new CustomEvent('encomi:session-expired'));
    }

    throw originalError;
  }
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 * @param {Object} userData - Datos del usuario
 * @param {boolean} autoLogin - Si true, guarda token para auto-login (para self-registration)
 */
export const register = async (userData, autoLogin = true) => {
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

  // Solo guardar token y usuario si el registro fue exitoso Y autoLogin es true
  // (para auto-registro). Si un admin registra otro usuario, no debe hacer auto-login
  if (autoLogin && data.success && data.data.token) {
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

export default {
  register,
  recuperarPassword,
  getToken,
  setAuthData,
};