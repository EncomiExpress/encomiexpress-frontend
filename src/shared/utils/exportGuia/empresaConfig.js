export const EMPRESA = {
  nombre: 'Osvaldoc Mensajería y Logística S.A.S.',
  nit: '901.515.251-1',
  direccion: 'Calle 45A # 60-50',
  ciudad: 'Medellín',
  departamento: 'Antioquia',
  telefono: '(604) 423 6529',
  actividad: 'Actividades de mensajería (CIIU 5320)',
}

// Math.round defensivo: el total ya se guarda redondeado (ver calcularValorServicio en
// ventaValidation.js), pero una guía puede imprimirse de una venta vieja registrada
// antes de esa corrección, con decimales todavía en la BD.
export const formatCurrency = (value) =>
  value !== null && value !== undefined && value !== ''
    ? `$${Math.round(Number(value)).toLocaleString('es-CO')}`
    : '—'
