import { API_URL } from '../config/api';
import { getToken } from './authService';

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
// FUNCIONES DE PROPIETARIOS
// ============================================

/**
 * Obtener todos los propietarios
 * GET /api/propietarios
 */
export const getPropietarios = async () => {
  return await fetchWithAuth('/propietarios', {
    method: 'GET',
  });
};

/**
 * Obtener propietario por ID
 * GET /api/propietarios/:id
 */
export const getPropietarioById = async (id) => {
  return await fetchWithAuth(`/propietarios/${id}`, {
    method: 'GET',
  });
};

/**
 * Registrar nuevo propietario
 * POST /api/propietarios
 */
export const createPropietario = async (propietarioData) => {
  return await fetchWithAuth('/propietarios', {
    method: 'POST',
    body: JSON.stringify(propietarioData),
  });
};

/**
 * Actualizar propietario
 * PUT /api/propietarios/:id
 */
export const updatePropietario = async (id, propietarioData) => {
  return await fetchWithAuth(`/propietarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propietarioData),
  });
};

/**
 * Eliminar propietario (inhabilitar)
 * DELETE /api/propietarios/:id
 */
export const deletePropietario = async (id) => {
  return await fetchWithAuth(`/propietarios/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Habilitar/Inhabilitar propietario
 * PATCH /api/propietarios/:id/toggle-habilitado
 */
export const toggleHabilitadoPropietario = async (id) => {
  return await fetchWithAuth(`/propietarios/${id}/toggle-habilitado`, {
    method: 'PATCH',
  });
};

export default {
  getPropietarios,
  getPropietarioById,
  createPropietario,
  updatePropietario,
  deletePropietario,
  toggleHabilitadoPropietario,
};
