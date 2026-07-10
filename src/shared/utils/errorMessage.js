// En dev muestra el detalle de validación del backend (campo + motivo) para depurar rápido.
// En producción siempre devuelve el mensaje genérico para no exponer detalles internos.
export const getErrorMessage = (err, fallback) => {
    if (import.meta.env.DEV) {
        if (err?.details?.length) {
            return err.details.map(d => `${d.field}: ${d.message}`).join(' · ')
        }
        if (err?.message) return err.message
    }
    return fallback
}
