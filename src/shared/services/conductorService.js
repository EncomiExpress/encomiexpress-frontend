import { fetchWithAuth } from './authService';

// ============================================
// FUNCIONES DE CONDUCTORES
// ============================================

/**
 * Obtener todos los conductores
 * GET /api/conductores
 */
export const getConductores = async (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return await fetchWithAuth(`/conductores${suffix}`, {
    method: 'GET',
    signal,
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
 * Habilitar/Inhabilitar conductor
 * PATCH /api/conductores/:id/toggle-habilitado
 */
export const toggleHabilitadoConductor = async (id) => {
  return await fetchWithAuth(`/conductores/${id}/toggle-habilitado`, {
    method: 'PATCH',
  });
};

export const getPageOfConductor = (id, limit = 10) =>
  fetchWithAuth(`/conductores/${id}/page-of?limit=${limit}`)

export default {
  getConductores,
  createConductor,
  updateConductor,
  toggleHabilitadoConductor,
  getPageOfConductor,
};

