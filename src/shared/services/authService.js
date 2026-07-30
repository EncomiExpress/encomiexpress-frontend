import { API_URL } from '../config/api';

// sessionStorage a propósito (no localStorage): la sesión muere al cerrar la pestaña.
const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

// Obtener token del sessionStorage
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

// Guardar token y usuario en sessionStorage
export const setAuthData = (token, usuario) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
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

    let response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: reqHeaders,
        cache: 'no-store',
      });
    } catch {
      // fetch() nunca llegó a obtener una respuesta (sin internet, servidor caído, CORS,
      // DNS) — sin esto, el usuario vería el mensaje crudo del navegador ("Failed to
      // fetch"), en inglés y sin indicarle qué hacer.
      const error = new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.');
      error.status = 0;
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      // Respuesta que no es JSON (ej. una página de error HTML de un proxy/gateway
      // caído) — mismo motivo: sin esto se filtraría un error críptico de parseo.
      const error = new Error('El servidor respondió de forma inesperada. Intenta de nuevo en un momento.');
      error.status = response.status;
      throw error;
    }

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
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
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
        sessionStorage.setItem('token', nuevoToken);
        window.dispatchEvent(new CustomEvent('encomi:token-refreshed', { detail: { token: nuevoToken } }));
        return await ejecutarPeticion(nuevoToken);
      }
    }

    // Sin refresh token válido o el refresh falló — notificar sesión expirada.
    // Solo dispara el evento si había un token activo (evita falsos positivos en login).
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
 * Solicitar recuperación de contraseña — envía un enlace de reseteo al correo
 * POST /api/auth/recuperar-password
 */
export const recuperarPassword = async (email) => {
  return await fetchWithAuth('/auth/recuperar-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Elegir nueva contraseña con el token del enlace de recuperar-password
 * POST /api/auth/resetear-password
 */
export const resetearPassword = async (token, passwordNueva) => {
  return await fetchWithAuth('/auth/resetear-password', {
    method: 'POST',
    body: JSON.stringify({ token, passwordNueva }),
  });
};

export default {
  recuperarPassword,
  resetearPassword,
  getToken,
  setAuthData,
};