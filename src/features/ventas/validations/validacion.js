import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { sumarDias } from '../../../shared/utils/horarioLaboral.js'
import { EMAIL_REGEX } from '../../../shared/validations/emailValidation.js'
import { maxLengthDocumento, docHelperText as docHelperTextBase, validarNumeroDocumento, esDocAlfanumerico } from '../../../shared/utils/documento.js'

export const steps = ['Participantes', 'Paquete', 'Envío', 'Pago', 'Confirmación']

export const MAX_PAQUETES = 10
export const PAQUETE_VACIO = { descripcionContenido: '', peso: '', alto: '', ancho: '', profundidad: '', tipoCarga: 'normal', idRutaVehiculoConductor: '' }
export const CAMPOS_PAQUETE = ['descripcionContenido', 'peso', 'alto', 'ancho', 'profundidad', 'tipoCarga']
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
const NOMBRE_DESTINATARIO_MAX_LENGTH = 50
const CORREO_DESTINATARIO_MAX_LENGTH = 150

// Tipo/número de documento del destinatario — mismo mecanismo que Cliente
// (PasoDocumento.jsx / clienteValidation.js): el tipo elegido cambia el límite de
// caracteres y la validación del número. NIT tiene su propio formato especial
// (dígitos + guión, hasta 15) que no encaja en shared/utils/documento.js, así que
// se replica acá igual que allá — no se puede importar esa función desde
// features/clientes (un feature nunca importa del interior de otro, solo de shared/).
export const getMaxLengthDocDestinatario = (tipo) => {
    if (tipo === 'NIT') return 15
    return maxLengthDocumento(tipo)
}

export const docHelperTextDestinatario = (tipo) => {
    if (tipo === 'NIT') return 'Números con guión, hasta 15 caracteres'
    return docHelperTextBase(tipo) || ''
}

export const validarDocumentoDestinatarioCompleto = (tipo, valor) => {
    const limpio = (valor || '').trim()
    if (!limpio) return 'El número de documento es obligatorio'
    if (tipo === 'NIT') {
        if (!/^[0-9-]+$/.test(limpio)) return 'Solo se permiten números y guión'
        if (!/\d/.test(limpio)) return 'Debe contener al menos un número'
        if (limpio.length > 15) return 'Máximo 15 caracteres'
        return ''
    }
    return validarNumeroDocumento(tipo, limpio) || ''
}

// Reexportado para que useVentaWizardForm.js filtre lo que se escribe en
// numeroIdentificacionDestinatario según el tipo, igual que RegistrarCliente.jsx.
export { esDocAlfanumerico }

// Opción sentinel que se agrega al final de las sugerencias de Cliente — al elegirla
// se abre RegistrarCliente en un modal encima, en vez de seleccionar un cliente real.
// Solo aparece cuando PasoParticipantes recibe `onNuevoCliente` (modo registrar).
export const OPCION_CLIENTE_NUEVO = { idCliente: '__nuevo__', esNuevo: true }

// Valida un único campo del formulario principal (usado en onBlur y para re-validar
// en vivo mientras se corrige un campo ya marcado con error). valorServicio/total no
// viven aquí: son editables sin ninguna regla de obligatoriedad. Los call sites
// del modo edición pasan un tercer argumento (la venta original) por consistencia con el
// resto del wizard, pero esta función no lo necesita para validar.
export const validarCampo = (name, form) => {
    switch (name) {
        case 'idCliente':
            return form.idCliente ? '' : 'Selecciona un cliente remitente'
        case 'tipoIdentificacionDestinatario':
            return form.tipoIdentificacionDestinatario ? '' : 'Selecciona el tipo de documento'
        case 'nombreDestinatario':
            if (!form.nombreDestinatario.trim()) return 'El nombre es obligatorio'
            if (!SOLO_LETRAS_REGEX.test(form.nombreDestinatario)) return 'Solo se permiten letras'
            if (form.nombreDestinatario.length > NOMBRE_DESTINATARIO_MAX_LENGTH) return `El nombre no puede superar los ${NOMBRE_DESTINATARIO_MAX_LENGTH} caracteres`
            return ''
        case 'telefonoDestinatario':
            if (!form.telefonoDestinatario.trim()) return 'El teléfono es obligatorio'
            if (!/^\d{10}$/.test(form.telefonoDestinatario)) return 'Debe tener 10 dígitos'
            return ''
        case 'direccionDestinatario':
            if (!form.direccionDestinatario.trim()) return 'La dirección es obligatoria'
            if (esSoloRelleno(form.direccionDestinatario)) return 'La dirección no puede contener solo espacios o guiones'
            return ''
        case 'correoDestinatario': {
            // Opcional -- igual que el correo del Cliente, no todos los destinatarios lo tienen.
            const valor = (form.correoDestinatario || '').trim()
            if (!valor) return ''
            if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
            if (valor.length > CORREO_DESTINATARIO_MAX_LENGTH) return `El correo no puede superar los ${CORREO_DESTINATARIO_MAX_LENGTH} caracteres`
            return ''
        }
        case 'idDestinoDestinatario':
            return form.idDestinoDestinatario ? '' : 'Selecciona el municipio de destino'
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'fechaEstimadaEntrega': {
            // Destinatario en una parada intermedia sin fecha estimada de paso
            // cargada todavía (ver PasoEnvio.jsx) — no hay ninguna fecha válida
            // que se le pueda pedir al usuario.
            if (form.entregaSinFecha) return 'Esta ruta todavía no tiene una fecha estimada de paso por el municipio del destinatario'
            if (!form.fechaEstimadaEntrega) return 'La fecha es obligatoria'
            if (form.fechaSalidaRuta) {
                const minima = sumarDias(form.fechaSalidaRuta, 1)
                if (form.fechaEstimadaEntrega < minima) return 'Debe ser al menos un día después de la salida de la ruta'
            }
            if (form.fechaLlegadaEstimadaRuta) {
                const maxima = sumarDias(form.fechaLlegadaEstimadaRuta, -1)
                if (form.fechaEstimadaEntrega > maxima) return 'Debe ser al menos un día antes de la llegada de la ruta'
            }
            return ''
        }
        case 'metodoPago':
            return form.metodoPago ? '' : 'Selecciona un método de pago'
        case 'observaciones':
            if (form.observaciones && form.observaciones.length > 500) return 'Máximo 500 caracteres'
            if (form.observaciones && esSoloRelleno(form.observaciones)) return 'Las observaciones no pueden contener solo espacios o guiones'
            return ''
        default:
            return ''
    }
}

// Valida un único campo de un paquete (usado en onBlur y para re-validar en vivo).
export const validarCampoPaquete = (campo, paquete) => {
    switch (campo) {
        case 'descripcionContenido':
            if (!paquete.descripcionContenido.trim()) return 'La descripción es obligatoria'
            if (paquete.descripcionContenido.length > 300) return 'Máximo 300 caracteres'
            if (esSoloRelleno(paquete.descripcionContenido)) return 'La descripción no puede contener solo espacios o guiones'
            return ''
        case 'peso': {
            const n = parseFloat(paquete.peso)
            if (!paquete.peso) return 'El peso es obligatorio'
            if (isNaN(n) || n < 1) return 'El peso debe ser de al menos 1 kg'
            if (n > 999) return 'Máximo 999 kg'
            return ''
        }
        case 'alto': {
            const n = parseFloat(paquete.alto)
            if (!paquete.alto) return 'El alto es obligatorio'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 999) return 'Máximo 999 cm'
            return ''
        }
        case 'ancho': {
            const n = parseFloat(paquete.ancho)
            if (!paquete.ancho) return 'El ancho es obligatorio'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 999) return 'Máximo 999 cm'
            return ''
        }
        case 'profundidad': {
            const n = parseFloat(paquete.profundidad)
            if (!paquete.profundidad) return 'La profundidad es obligatoria'
            if (isNaN(n) || n < 1) return 'Debe ser de al menos 1 cm'
            if (n > 999) return 'Máximo 999 cm'
            return ''
        }
        case 'tipoCarga':
            return ['hierro', 'normal'].includes(paquete.tipoCarga) ? '' : 'Selecciona el tipo de carga'
        case 'idRutaVehiculoConductor':
            return paquete.idRutaVehiculoConductor ? '' : 'Asigna un vehículo'
        default:
            return ''
    }
}
