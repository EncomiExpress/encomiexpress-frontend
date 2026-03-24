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
// FUNCIONES DE CONDUCTORES
// ============================================

/**
 * Obtener todos los conductores
 * GET /api/conductores
 */
export const getConductores = async () => {
  return await fetchWithAuth('/conductores', {
    method: 'GET',
  });
};

/**
 * Obtener conductor por ID
 * GET /api/conductores/:id
 */
export const getConductorById = async (id) => {
  return await fetchWithAuth(`/conductores/${id}`, {
    method: 'GET',
  });
};

/**
 * Registrar nuevo conductor
 * POST /api/conductores
 */
export const createConductor = async (conductorData) => {
  return await fetchWithAuth('/conductores', {
    method: 'POST',
    body: JSON.stringify(conductorData),
  });
};

/**
 * Actualizar conductor
 * PUT /api/conductores/:id
 */
export const updateConductor = async (id, conductorData) => {
  return await fetchWithAuth(`/conductores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(conductorData),
  });
};

/**
 * Eliminar conductor (inhabilitar)
 * DELETE /api/conductores/:id
 */
export const deleteConductor = async (id) => {
  return await fetchWithAuth(`/conductores/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Habilitar/Inhabilitar conductor
 * PATCH /api/conductores/:id/toggle-habilitado
 */
export const toggleHabilitadoConductor = async (id) => {
  return await fetchWithAuth(`/conductores/${id}/toggle-habilitado`, {
    method: 'PATCH',
  });
};

export default {
  getConductores,
  getConductorById,
  createConductor,
  updateConductor,
  deleteConductor,
  toggleHabilitadoConductor,
};
