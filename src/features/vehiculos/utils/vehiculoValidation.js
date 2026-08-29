import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { hoyISO } from '../../../shared/utils/horarioLaboral.js'

export const stepsRegistrar = ['Datos del Vehículo', 'Documentación y Estado', 'Confirmación']
export const stepsActualizar = ['Datos del Vehículo', 'Documentación', 'Confirmación']

export const TIPOS_VEHICULO = ['Camioneta', 'Camión', 'Furgón', 'Semi Trayler', 'Trayler', 'Otro']

// La placa se guarda siempre sin guion (6 caracteres alfanuméricos) — el guion que se ve
// en el campo es solo un formato visual mientras se escribe, igual que el punto decorativo
// que ya se usa en los chips de Listar/Consultar (ver PlacaDisplay en ListarVehiculo.jsx).
export const formatearPlaca = (raw) => {
    const limpio = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    return limpio.length > 3 ? `${limpio.slice(0, 3)}-${limpio.slice(3)}` : limpio
}

const PLACA_REGEX = /^[A-Z]{3}[0-9]{3}$/

// Placa colombiana estándar: 3 letras + 3 números. Filtra letra por letra según la
// posición (no solo alfanumérico general) para que no se pueda ni siquiera escribir
// un número en las primeras 3 posiciones ni una letra en las últimas 3.
export const limpiarPlacaInput = (value) => {
    const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').split('')
    let resultado = ''
    for (const c of chars) {
        if (resultado.length >= 6) break
        if (resultado.length < 3) { if (/[A-Z]/.test(c)) resultado += c }
        else { if (/[0-9]/.test(c)) resultado += c }
    }
    return resultado
}

export const CAPACIDAD_MAX = 999999

// Mismo alfabeto que ya filtra RegistrarVehiculo.jsx/ActualizarVehiculo.jsx letra por
// letra en su handleChange (solo letras) — se replica aquí para que el validador sea
// la fuente de verdad, no solo el filtrado en vivo del input.
const MARCA_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
const COLOR_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
const MARCA_MAX_LENGTH = 30
const COLOR_MAX_LENGTH = 20

// checkFechaFutura: solo RegistrarVehiculo.jsx exige que los vencimientos no sean una
// fecha pasada; ActualizarVehiculo.jsx no lo hace (no tiene sentido bloquear la edición
// de un vehículo cuyo documento ya venció).
// mensajeIdPropietario: los dos archivos usan un texto distinto para el mismo error.
export const validarCampo = (name, formData, {
    checkFechaFutura = false,
    mensajeIdPropietario = 'El propietario es obligatorio',
} = {}) => {
    switch (name) {
        case 'placa':
            if (!formData.placa?.trim()) return 'La placa es obligatoria'
            if (!PLACA_REGEX.test(formData.placa)) return 'La placa debe tener 3 letras seguidas de 3 números'
            return ''
        case 'marca':
            if (!formData.marca?.trim()) return 'La marca es obligatoria'
            if (!MARCA_REGEX.test(formData.marca)) return 'La marca solo puede contener letras'
            if (formData.marca.length > MARCA_MAX_LENGTH) return `La marca no puede superar los ${MARCA_MAX_LENGTH} caracteres`
            return ''
        case 'modelo':
            if (!formData.modelo?.trim()) return 'El modelo es obligatorio'
            if (esSoloRelleno(formData.modelo)) return 'El modelo no puede contener solo espacios o guiones'
            return ''
        case 'color':
            if (!formData.color?.trim()) return 'El color es obligatorio'
            if (!COLOR_REGEX.test(formData.color)) return 'El color solo puede contener letras'
            if (formData.color.length > COLOR_MAX_LENGTH) return `El color no puede superar los ${COLOR_MAX_LENGTH} caracteres`
            return ''
        case 'tarjetaPropiedad':
            if (formData.tarjetaPropiedad && (formData.tarjetaPropiedad.length < 6 || formData.tarjetaPropiedad.length > 11)) return 'Debe tener entre 6 y 11 dígitos'
            return ''
        case 'tipo':
            return formData.tipo ? '' : 'El tipo de vehículo es obligatorio'
        case 'tipoOtro':
            return (formData.tipo === 'Otro' && !formData.tipoOtro?.trim()) ? 'Especifica el tipo de vehículo' : ''
        case 'capacidad':
            if (!formData.capacidad) return 'La capacidad es obligatoria'
            if (parseFloat(formData.capacidad) < 1) return 'La capacidad debe ser de al menos 1 kg'
            if (parseFloat(formData.capacidad) > CAPACIDAD_MAX) return `La capacidad no puede ser mayor a ${CAPACIDAD_MAX.toLocaleString('es-CO')} kg`
            return ''
        case 'idPropietario':
            return formData.idPropietario ? '' : mensajeIdPropietario
        case 'vencimientoSOAT':
            if (!formData.vencimientoSOAT) return 'La fecha de vencimiento del SOAT es obligatoria'
            if (checkFechaFutura && formData.vencimientoSOAT < hoyISO()) return 'La fecha de vencimiento no puede ser anterior a hoy'
            return ''
        case 'vencimientoRevisionTecnica':
            if (!formData.vencimientoRevisionTecnica) return 'La fecha de vencimiento de la Revisión Técnica es obligatoria'
            if (checkFechaFutura && formData.vencimientoRevisionTecnica < hoyISO()) return 'La fecha de vencimiento no puede ser anterior a hoy'
            return ''
        case 'vencimientoSeguroTerceros':
            if (!formData.vencimientoSeguroTerceros) return 'La fecha de vencimiento del Seguro de Terceros es obligatoria'
            if (checkFechaFutura && formData.vencimientoSeguroTerceros < hoyISO()) return 'La fecha de vencimiento no puede ser anterior a hoy'
            return ''
        default:
            return ''
    }
}

export const validarPaso = (step, formData, avisoPlacaDuplicada, options = {}) => {
    const e = {}
    if (step === 0) {
        e.placa = validarCampo('placa', formData, options) || avisoPlacaDuplicada
        e.marca = validarCampo('marca', formData, options)
        e.modelo = validarCampo('modelo', formData, options)
        e.color = validarCampo('color', formData, options)
        e.tipo = validarCampo('tipo', formData, options)
        e.tipoOtro = validarCampo('tipoOtro', formData, options)
        e.capacidad = validarCampo('capacidad', formData, options)
    }
    if (step === 1) {
        e.idPropietario = validarCampo('idPropietario', formData, options)
        e.tarjetaPropiedad = validarCampo('tarjetaPropiedad', formData, options)
        e.vencimientoSOAT = validarCampo('vencimientoSOAT', formData, options)
        e.vencimientoRevisionTecnica = validarCampo('vencimientoRevisionTecnica', formData, options)
        e.vencimientoSeguroTerceros = validarCampo('vencimientoSeguroTerceros', formData, options)
    }
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}
