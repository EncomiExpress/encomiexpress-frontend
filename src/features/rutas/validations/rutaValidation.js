import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { validarObservacionesRuta } from '../../../shared/validations/observacionesRutaValidation.js'

// Validación de la plantilla (Ruta): idDestino obligatorio, observaciones opcional
// — mismo contrato que validators/rutasValidator.js del backend
// (createValidation/updateValidation). Sin nombre propio: la ruta se identifica
// por su corredor (Medellín -> destino), ver utils/rutaResolvers.js.

export const steps = ['Datos de la Ruta']

export const OBSERVACIONES_MAX_LENGTH = 500

export const validarCampo = (name, form) => {
    switch (name) {
        case 'idDestino':
            return form.idDestino ? '' : 'Selecciona un destino'
        case 'observaciones':
            if (form.observaciones && esSoloRelleno(form.observaciones)) return 'Las observaciones no pueden contener solo espacios o guiones'
            if (form.observaciones && form.observaciones.length > OBSERVACIONES_MAX_LENGTH) return `Las observaciones no pueden superar los ${OBSERVACIONES_MAX_LENGTH} caracteres`
            return validarObservacionesRuta(form.observaciones)
        default:
            return ''
    }
}

export const validarPaso = (step, form) => {
    const e = {}
    if (step === 0) {
        e.idDestino = validarCampo('idDestino', form)
        e.observaciones = validarCampo('observaciones', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
