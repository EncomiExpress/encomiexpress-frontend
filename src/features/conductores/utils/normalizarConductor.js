export const normalizarConductor = (c) => ({
  ...c,
  nombre: c.usuario?.nombre || c.nombre || '',
  apellido: c.usuario?.apellido || c.apellido || '',
  telefono: c.usuario?.telefono || c.telefono || '',
  email: c.usuario?.email || c.email || '',
  tipoIdentificacion: c.usuario?.tipoIdentificacion || c.tipoIdentificacion || '',
  numeroIdentificacion: c.usuario?.numeroIdentificacion || c.numeroIdentificacion || '',
  categoriasLicencia: c.categoriasLicencia || [],
  numeroLicencia: c.numeroLicencia || '',
})
