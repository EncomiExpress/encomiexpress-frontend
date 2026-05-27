import { fetchWithAuth } from './authService';

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
 * Cambiar estado del conductor
 * PATCH /api/conductores/:id/estado
 */
export const cambiarEstadoConductor = async (id, estado) => {
  return await fetchWithAuth(`/conductores/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
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

