// Regla de fortaleza de contraseña compartida por conductores, usuarios, auth y el
// diálogo de "cambiar contraseña" del Header — antes copiada de forma idéntica en
// los 4 archivos. El texto de ayuda (PASSWORD_HELP) sí varía a propósito entre
// pantallas (mismo requisito, texto distinto por contexto), así que no se centraliza.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,64}$/
