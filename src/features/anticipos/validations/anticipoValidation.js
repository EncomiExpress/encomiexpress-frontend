import { limpiarMonedaInput, formatFecha } from '../../../shared/utils/formatters.js'
import { sumarDias, hoyISO, MAX_DIAS_ANTICIPACION } from '../../../shared/utils/horarioLaboral.js'

export const steps = ['Datos del Anticipo', 'Confirmación']

export const NUMERIC_LIMITS = { valorAnticipo: 9999999 }

// Valida un único campo del formulario (usado en onBlur y para re-validar en vivo mientras
// se corrige un campo ya marcado con error). "Valor gastado" y las fechas de
// legalización/entrega de excedente no viven en este formulario — las registra el
// conductor cuando legaliza el anticipo, no el admin al crearlo/editarlo.
// `rutaSeleccionada` es opcional (la ruta ya resuelta a partir de form.idRuta, la arma
// cada pantalla) — solo hace falta para el tope superior de fechaEntrega.
export const validarCampo = (name, form, rutaSeleccionada) => {
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
        case 'fechaEntrega': {
            if (!form.fechaEntrega) return 'La fecha de entrega es obligatoria'
            // No tiene sentido entregar el anticipo DESPUÉS de que la ruta ya salió.
            if (rutaSeleccionada?.fechaSalida && form.fechaEntrega > rutaSeleccionada.fechaSalida) {
                return `No puede ser posterior a la salida de la ruta (${formatFecha(rutaSeleccionada.fechaSalida)})`
            }
            // Tampoco una fecha absurdamente vieja — mismo horizonte (MAX_DIAS_ANTICIPACION)
            // que ya limita las fechas de Ruta/Venta, aplicado hacia atrás en vez de adelante.
            const minima = sumarDias(hoyISO(), -MAX_DIAS_ANTICIPACION)
            if (form.fechaEntrega < minima) return `No puede ser más de ${MAX_DIAS_ANTICIPACION} días en el pasado`
            return ''
        }
        default:
            return ''
    }
}

export const validarPaso = (step, form, rutaSeleccionada) => {
    const e = {}
    if (step === 0) {
        e.idRuta = validarCampo('idRuta', form)
        e.idRutaVehiculoConductor = validarCampo('idRutaVehiculoConductor', form)
        e.valorAnticipo = validarCampo('valorAnticipo', form)
        e.fechaEntrega = validarCampo('fechaEntrega', form, rutaSeleccionada)
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
// aviso de "sin cambios" apenas se edita algo). rutaSeleccionada: igual que en
// validarCampo, solo hace falta para revalidar fechaEntrega en vivo.
export const handleChangeAnticipo = (e, form, setForm, setErrores, { onCambio, rutaSeleccionada } = {}) => {
    const { name } = e.target
    let { value } = e.target

    if (name in NUMERIC_LIMITS) {
        value = limpiarMonedaInput(value)
        const num = parseFloat(value)
        if (!isNaN(num) && num > NUMERIC_LIMITS[name]) return
    }

    const formActualizado = { ...form, [name]: value }
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: prev[name] ? validarCampo(name, formActualizado, rutaSeleccionada) : '' }))
    onCambio?.()
}
