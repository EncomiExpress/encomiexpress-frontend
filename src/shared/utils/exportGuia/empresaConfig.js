export const EMPRESA = {
  nombre: 'Osvaldoc Mensajería y Logística S.A.S.',
  nit: '901.515.251-1',
  direccion: 'Calle 45A # 60-50',
  ciudad: 'Medellín',
  departamento: 'Antioquia',
  telefono: '(604) 423 6529',
  actividad: 'Actividades de mensajería (CIIU 5320)',
}

export const formatCurrency = (value) =>
  value !== null && value !== undefined && value !== ''
    ? `$${Number(value).toLocaleString('es-CO')}`
    : '—'
