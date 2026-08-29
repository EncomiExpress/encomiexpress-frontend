import { limpiarMonedaInput } from '../../../shared/utils/formatters.js'

export const steps = ['Datos del Anticipo', 'Confirmación']

export const NUMERIC_LIMITS = { valorAnticipo: 999999999 }

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo mientras
// se corrige un campo ya marcado con error). "Valor gastado" y las fechas de
// legalización/entrega de excedente no viven en este formulario — las registra el
// conductor cuando legaliza el anticipo, no el admin al crearlo/editarlo.
export const validarCampo = (name, form) => {
    switch (name) {
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'idRutaVehiculoConductor':
            return form.idRutaVehiculoConductor ? '' : 'Selecciona el vehículo y conductor de la ruta'
        case 'valorAnticipo':
            if (!form.valorAnticipo) return 'El valor del anticipo es obligatorio'
            if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0) return 'Ingresa un valor válido mayor a 0'
            if (parseFloat(form.valorAnticipo) > NUMERIC_LIMITS.valorAnticipo) return `El valor no puede ser mayor a ${NUMERIC_LIMITS.valorAnticipo.toLocaleString('es-CO')}`
            return ''
        case 'fechaEntrega':
            return form.fechaEntrega ? '' : 'La fecha de entrega es obligatoria'
        default:
            return ''
    }
}

export const validarPaso = (step, form) => {
    const e = {}
    if (step === 0) {
        e.idRuta = validarCampo('idRuta', form)
        e.idRutaVehiculoConductor = validarCampo('idRutaVehiculoConductor', form)
        e.valorAnticipo = validarCampo('valorAnticipo', form)
        e.fechaEntrega = validarCampo('fechaEntrega', form)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}

export const formatMoney = (val) => {
    const num = parseFloat(val || 0)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
}

// onCambio: callback opcional (solo lo usa ActualizarAnticipoExcedente, para apagar el
// aviso de "sin cambios" apenas se edita algo).
export const handleChangeAnticipo = (e, form, setForm, setErrores, { onCambio } = {}) => {
    const { name } = e.target
    let { value } = e.target

    if (name in NUMERIC_LIMITS) {
        value = limpiarMonedaInput(value)
        const num = parseFloat(value)
        if (!isNaN(num) && num > NUMERIC_LIMITS[name]) return
    }

    const formActualizado = { ...form, [name]: value }
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado) : '' }))
    onCambio?.()
}
