// El backend ya decide qué es seguro mostrar, según SU propio NODE_ENV (ver
// errorHandler.js): un AppError operacional (validaciones, reglas de negocio — ej.
// "El vehículo ABC123 tiene el SOAT vencido") siempre trae un mensaje pensado para
// el usuario final, tanto en desarrollo como en producción. Solo los errores 500
// inesperados (bugs reales) se sanean ahí mismo antes de salir del servidor, con un
// mensaje genérico ("Ocurrió un error inesperado..."). O sea: para cuando el mensaje
// llega aquí, YA es seguro de mostrar sin importar en qué entorno corre el frontend —
// filtrarlo de nuevo según import.meta.env.DEV solo tapaba mensajes reales en
// producción sin ganar nada en seguridad.
export const getErrorMessage = (err, fallback) => {
    if (err?.details?.length) {
        return err.details.map(d => `${d.field}: ${d.message}`).join(' · ')
    }
    if (err?.message) return err.message
    return fallback
}
