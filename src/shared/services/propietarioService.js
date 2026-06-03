import { fetchWithAuth } from './authService';

// ============================================
// FUNCIONES DE PROPIETARIOS
// ============================================

/**
 * Obtener todos los propietarios
 * GET /api/propietarios
 */
export const getPropietarios = async (signal, params = {}) => {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return await fetchWithAuth(`/propietarios${suffix}`, { method: 'GET', signal })
}

/**
 * Obtener propietario por ID
 * GET /api/propietarios/:id
 */
export const getPropietarioById = async (id, signal) => {
  return await fetchWithAuth(`/propietarios/${id}`, {
    method: 'GET',
    signal,
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

