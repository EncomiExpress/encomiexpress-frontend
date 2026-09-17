import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { validarObservacionesRuta } from '../../../shared/validations/observacionesRutaValidation.js'
import { hayDocumentoDuplicado } from '../../../shared/utils/duplicados.js'

// Validación de la plantilla (Ruta): idDestino obligatorio, observaciones opcional
// — mismo contrato que validators/rutasValidator.js del backend
// (createValidation/updateValidation). Sin nombre propio: la ruta se identifica
// por su corredor (Medellín -> destino), ver utils/rutaResolvers.js.

export const steps = ['Datos de la Ruta']

export const OBSERVACIONES_MAX_LENGTH = 500

export const MENSAJE_DESTINO_DUPLICADO = 'Ya existe una ruta registrada hacia ese destino.'

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

// Una plantilla por corredor (ver rutaService.create() en el backend, misma regla):
// no importa si la ruta que ya existe hacia ese destino está inhabilitada, cuenta
// igual como duplicado — lo que corresponde ahí es rehabilitarla, no crear una
// segunda. `rutas` ya viene completo en memoria (RutaContext trae habilitadas E
// inhabilitadas, ver ahí) así que no hace falta consultar al backend para esto,
// mismo patrón que validarMunicipioDuplicado en destinoValidation.js.
// excludeId: solo Actualizar lo pasa (para no marcar la propia ruta como
// duplicada de sí misma si no cambió de destino).
// idDestino llega como number (del Autocomplete) — normalizarTexto() espera un
// string (usa .trim()), así que se convierte antes de comparar.
export const validarDestinoDuplicado = (rutas, idDestino, excludeId) =>
    hayDocumentoDuplicado(rutas, String(idDestino ?? ''), {
        getDoc: r => String(r.idDestino ?? ''),
        ...(excludeId !== undefined ? { excludeId, getId: r => r.idRuta } : {}),
    }) ? MENSAJE_DESTINO_DUPLICADO : ''

export const validarPaso = (step, form, rutas, excludeId) => {
    const e = {}
    if (step === 0) {
        e.idDestino = validarCampo('idDestino', form) || validarDestinoDuplicado(rutas, form.idDestino, excludeId)
        e.observaciones = validarCampo('observaciones', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
