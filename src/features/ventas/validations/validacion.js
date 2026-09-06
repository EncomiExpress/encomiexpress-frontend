import { esSoloRelleno } from '../../../shared/utils/formatters.js'
import { sumarDias } from '../../../shared/utils/horarioLaboral.js'
import { EMAIL_REGEX, validarUsuarioCorreo } from '../../../shared/validations/emailValidation.js'
import { validarDireccion } from '../../../shared/validations/direccionValidation.js'
import { validarDescripcionContenido } from '../../../shared/validations/descripcionContenidoValidation.js'
import { validarTelefono } from '../../../shared/validations/telefonoValidation.js'
import { maxLengthDocumento, docHelperText as docHelperTextBase, validarNumeroDocumento, esDocAlfanumerico, formatearNit, NIT_MAX_LENGTH, validarNitConDv } from '../../../shared/utils/documento.js'

export const steps = ['Participantes', 'Paquete', 'Envío', 'Pago', 'Confirmación']

export const MAX_PAQUETES = 10
export const PAQUETE_VACIO = { descripcionContenido: '', peso: '', alto: '', ancho: '', profundidad: '', tipoCarga: 'normal', idRutaVehiculoConductor: '' }
export const CAMPOS_PAQUETE = ['descripcionContenido', 'peso', 'alto', 'ancho', 'profundidad', 'tipoCarga']
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
const NOMBRE_DESTINATARIO_MAX_LENGTH = 50
const CORREO_DESTINATARIO_MAX_LENGTH = 150
// Sin TI/RC (menores de edad) -- mismo criterio que Cliente, ver LOGICA.md
// ("Tipos de documento por módulo").
const TIPOS_DOC_PERMITIDOS = ['CC', 'NIT', 'CE', 'PAS', 'PPT']

// Tipo/número de documento del destinatario — mismo mecanismo y mismo comportamiento
// de NIT que Propietario y Cliente (máscara de 9 dígitos + dígito de verificación,
// `formatearNit`/`validarNitConDv`/`NIT_MAX_LENGTH` de shared/utils/documento.js).
export const getMaxLengthDocDestinatario = (tipo) => {
    if (tipo === 'NIT') return NIT_MAX_LENGTH
    return maxLengthDocumento(tipo)
}

export const docHelperTextDestinatario = (tipo) => {
    if (tipo === 'NIT') return 'Escribe solo números: los 9 dígitos y luego el de verificación. El guion se pone solo.'
    return docHelperTextBase(tipo) || ''
}

export const validarDocumentoDestinatarioCompleto = (tipo, valor) => {
    if (tipo === 'NIT') return validarNitConDv(valor) || ''
    const limpio = (valor || '').trim()
    if (!limpio) return 'El número de documento es obligatorio'
    return validarNumeroDocumento(tipo, limpio) || ''
}

// Reexportados para que useVentaWizardForm.js filtre/enmascare lo que se escribe en
// numeroIdentificacionDestinatario según el tipo, igual que RegistrarCliente.jsx.
export { formatearNit }
export { esDocAlfanumerico }

// Opción sentinel que se agrega al final de las sugerencias de Cliente — al elegirla
// se abre RegistrarCliente en un modal encima, en vez de seleccionar un cliente real.
// Solo aparece cuando PasoParticipantes recibe `onNuevoCliente` (modo registrar).
export const OPCION_CLIENTE_NUEVO = { idCliente: '__nuevo__', esNuevo: true }

// Valida un único campo del formulario principal (usado en onBlur y para re-validar
// en vivo mientras se corrige un campo ya marcado con error). total no
// vive aquí: es editable sin ninguna regla de obligatoriedad. Los call sites
// del modo edición pasan un tercer argumento (la venta original) por consistencia con el
// resto del wizard, pero esta función no lo necesita para validar.
export const validarCampo = (name, form) => {
    switch (name) {
        case 'idCliente':
            return form.idCliente ? '' : 'Selecciona un cliente remitente'
        case 'tipoIdentificacionDestinatario':
            if (!form.tipoIdentificacionDestinatario) return 'Selecciona el tipo de documento'
            if (!TIPOS_DOC_PERMITIDOS.includes(form.tipoIdentificacionDestinatario)) return 'Tipo de documento no permitido'
            return ''
        case 'nombreDestinatario': {
            const esNitDest = form.tipoIdentificacionDestinatario === 'NIT'
            if (!form.nombreDestinatario.trim()) return esNitDest ? 'La razón social es obligatoria' : 'El nombre es obligatorio'
            if (esNitDest && esSoloRelleno(form.nombreDestinatario)) return 'La razón social no puede contener solo espacios o guiones'
            if (!esNitDest && !SOLO_LETRAS_REGEX.test(form.nombreDestinatario)) return 'Solo se permiten letras'
            if (form.nombreDestinatario.length > NOMBRE_DESTINATARIO_MAX_LENGTH) return `${esNitDest ? 'La razón social' : 'El nombre'} no puede superar los ${NOMBRE_DESTINATARIO_MAX_LENGTH} caracteres`
            return ''
        }
        case 'telefonoDestinatario':
            return validarTelefono(form.telefonoDestinatario, form.tipoIdentificacionDestinatario)
        case 'direccionDestinatario':
            if (!form.direccionDestinatario.trim()) return 'La dirección es obligatoria'
            if (form.direccionDestinatario.length > 300) return 'La dirección no puede superar los 300 caracteres'
            return validarDireccion(form.direccionDestinatario)
        case 'correoDestinatario': {
            // Opcional -- igual que el correo del Cliente, no todos los destinatarios lo tienen.
            const valor = (form.correoDestinatario || '').trim()
            if (!valor) return ''
            const errorUsuario = validarUsuarioCorreo(valor)
            if (errorUsuario) return errorUsuario
            if (!EMAIL_REGEX.test(valor)) return 'El correo no es válido'
            if (valor.length > CORREO_DESTINATARIO_MAX_LENGTH) return `El correo no puede superar los ${CORREO_DESTINATARIO_MAX_LENGTH} caracteres`
            return ''
        }
        case 'idDestinoDestinatario':
            return form.idDestinoDestinatario ? '' : 'Selecciona el municipio de destino'
        case 'idRuta':
            return form.idRuta ? '' : 'Selecciona una ruta'
        case 'fechaEstimadaEntrega': {
            if (!form.fechaEstimadaEntrega) return 'La fecha es obligatoria'
            if (form.fechaLlegadaEstimadaRuta) {
                if (form.fechaEstimadaEntrega < form.fechaLlegadaEstimadaRuta) return 'Debe ser igual o posterior a la llegada de la ruta'
            } else if (form.fechaSalidaRuta) {
                const minima = sumarDias(form.fechaSalidaRuta, 1)
                if (form.fechaEstimadaEntrega < minima) return 'Debe ser al menos un día después de la salida de la ruta'
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
// peso/alto/ancho/profundidad aceptan decimales (ej. 9.96). Ni empiezan ni terminan con
// punto: el inicial lo previene limpiarDecimalInput (".5" → "0.5"); el final se quita al
// salir del campo (blurMedida en PasoPaquetes.jsx), no se puede en vivo sin romper "5.5".
export const validarCampoPaquete = (campo, paquete) => {
    switch (campo) {
        case 'descripcionContenido':
            if (!paquete.descripcionContenido.trim()) return 'La descripción es obligatoria'
            if (paquete.descripcionContenido.length > 300) return 'Máximo 300 caracteres'
            return validarDescripcionContenido(paquete.descripcionContenido)
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
