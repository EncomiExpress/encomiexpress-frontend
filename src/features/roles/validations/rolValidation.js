import { esSoloRelleno } from '../../../shared/utils/formatters.js'

export const MENSAJE_ROL_DUPLICADO = 'Ya existe un rol con este nombre.'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
const NOMBRE_MAX_LENGTH = 50
const DESCRIPCION_MAX_LENGTH = 200

export const validarNombreRol = (nombre) => {
    if (!nombre.trim()) return 'El nombre del rol es obligatorio'
    if (!SOLO_LETRAS_REGEX.test(nombre)) return 'El nombre solo puede contener letras'
    if (nombre.length > NOMBRE_MAX_LENGTH) return `El nombre no puede superar los ${NOMBRE_MAX_LENGTH} caracteres`
    return ''
}

export const validarDescripcionRol = (descripcion) => {
    if (!descripcion) return ''
    if (esSoloRelleno(descripcion)) return 'La descripción no puede contener solo espacios'
    if (descripcion.length > DESCRIPCION_MAX_LENGTH) return `La descripción no puede superar los ${DESCRIPCION_MAX_LENGTH} caracteres`
    return ''
}

export const validarFormRol = (formData, avisoNombreDuplicado) => {
    const e = {}
    e.nombre = validarNombreRol(formData.nombre) || avisoNombreDuplicado
    e.descripcion = validarDescripcionRol(formData.descripcion)
    if (formData.permisos.length === 0) e.permisos = 'Debes seleccionar al menos un permiso'
    Object.keys(e).forEach(k => { if (!e[k]) delete e[k] })
    return e
}

// todosSeleccionados: si el módulo ya estaba completo, el toggle lo desmarca por
// completo; si no, lo marca completo (incluyendo el permiso "listar" implícito).
export const toggleModuloPermisos = (modulo, permisosActuales, todosSeleccionados) => {
    if (todosSeleccionados) {
        return permisosActuales.filter(p => !modulo.permisos.includes(p) && p !== modulo.listar)
    }
    const extras = modulo.listar ? [modulo.listar] : []
    return [...new Set([...permisosActuales, ...modulo.permisos, ...extras])]
}

// Marcar cualquier permiso de un módulo activa automáticamente su "listar"; al
// desmarcar el último permiso del módulo, "listar" también se desmarca.
export const togglePermisoEnLista = (modulo, permisosActuales, permiso, checked) => {
    let nuevos = checked
        ? [...permisosActuales, permiso]
        : permisosActuales.filter(p => p !== permiso)
    if (modulo.listar) {
        if (checked && !nuevos.includes(modulo.listar)) {
            nuevos = [...nuevos, modulo.listar]
        } else if (!checked && !modulo.permisos.some(p => nuevos.includes(p))) {
            nuevos = nuevos.filter(p => p !== modulo.listar)
        }
    }
    return nuevos
}

const PERMISO_LABELS = {
    'registrar_usuario': 'Registrar',
    'listar_usuario': 'Listar',
    'consultar_usuario': 'Consultar',
    'actualizar_usuario': 'Actualizar',
    'inhabilitar_usuario': 'Inhabilitar',
    'registrar_rol': 'Registrar',
    'listar_rol': 'Listar',
    'consultar_rol': 'Consultar',
    'actualizar_rol': 'Actualizar',
    'inhabilitar_rol': 'Inhabilitar',
    'registrar_cliente': 'Registrar',
    'listar_cliente': 'Listar',
    'consultar_cliente': 'Consultar',
    'actualizar_cliente': 'Actualizar',
    'inhabilitar_cliente': 'Inhabilitar',
    'registrar_vehiculo': 'Registrar',
    'listar_vehiculo': 'Listar',
    'consultar_vehiculo': 'Consultar',
    'actualizar_vehiculo': 'Actualizar',
    'inhabilitar_vehiculo': 'Inhabilitar',
    'registrar_conductor': 'Registrar',
    'listar_conductor': 'Listar',
    'consultar_conductor': 'Consultar',
    'actualizar_conductor': 'Actualizar',
    'inhabilitar_conductor': 'Inhabilitar',
    'registrar_destino': 'Registrar',
    'listar_destino': 'Listar',
    'consultar_destino': 'Consultar',
    'actualizar_destino': 'Actualizar',
    'inhabilitar_destino': 'Inhabilitar',
    'registrar_ruta': 'Registrar',
    'listar_ruta': 'Listar',
    'consultar_ruta': 'Consultar',
    'actualizar_ruta': 'Actualizar',
    'inhabilitar_ruta': 'Inhabilitar',
    'registrar_venta': 'Registrar',
    'listar_venta': 'Listar',
    'consultar_venta': 'Consultar',
    'actualizar_venta': 'Actualizar',
    'inhabilitar_venta': 'Inhabilitar',
    'registrar_anticipo': 'Registrar',
    'listar_anticipo': 'Listar',
    'consultar_anticipo': 'Consultar',
    'actualizar_anticipo': 'Actualizar',
    'inhabilitar_anticipo': 'Inhabilitar',
    'listar_propietario': 'Listar',
    'registrar_propietario': 'Registrar',
    'consultar_propietario': 'Consultar',
    'actualizar_propietario': 'Actualizar',
    'inhabilitar_propietario': 'Inhabilitar',
    'ver_dashboard': 'Ver',
}

export const getPermisoLabel = (permiso) =>
    PERMISO_LABELS[permiso] || permiso.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
