// Regla de formato de correo compartida por clientes, conductores, propietarios,
// usuarios y auth — antes copiada de forma idéntica en cada uno de esos archivos
// de validación. Cada módulo mantiene su propia función validarEmail/validarEmailValor
// (los mensajes de error varían levemente entre módulos), pero todas usan este mismo
// regex como fuente única.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
