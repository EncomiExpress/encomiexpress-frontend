import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Alert, Dialog, DialogTitle, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import { Security, Close, SaveOutlined } from '@mui/icons-material'
import { MODULOS, ROLES, useAuth } from '../../shared/contexts/AuthContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { hayDocumentoDuplicado } from '../../shared/utils/duplicados.js'
import { esSoloRelleno } from '../../shared/utils/formatters.js'
import {
  FormField, PrimaryButton, SecondaryButton,
  FormButtonGroup
} from '../../shared/components/FormularioEstandarizado.jsx'

const MENSAJE_ROL_DUPLICADO = 'Ya existe un rol con este nombre.'
const SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/

const ActualizarRol = ({ open, onClose, rol: rolProp, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  })
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [sinCambios, setSinCambios] = useState(false)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [formOriginal, setFormOriginal] = useState(null)
  const [permisosDisponibles, setPermisosDisponibles] = useState([])
  const [avisoNombreDuplicado, setAvisoNombreDuplicado] = useState('')

  const { getPermisosBackend, actualizarRolBackend, getRolesBackend } = useAuth()
  const theme = useTheme()

  const modulos = Object.entries(MODULOS).filter(([key]) => key !== 'ROLES')

  const toggleModulo = (modulo, todosSeleccionados) => {
    if (todosSeleccionados) {
      setFormData(prev => ({
        ...prev,
        permisos: prev.permisos.filter(p => !modulo.permisos.includes(p) && p !== modulo.listar)
      }))
    } else {
      const extras = modulo.listar ? [modulo.listar] : []
      setFormData(prev => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...modulo.permisos, ...extras])]
      }))
    }
  }

  const togglePermiso = (modulo, permiso, checked) => {
    let nuevos = checked
      ? [...formData.permisos, permiso]
      : formData.permisos.filter(p => p !== permiso)
    if (modulo.listar) {
      if (checked && !nuevos.includes(modulo.listar)) {
        nuevos = [...nuevos, modulo.listar]
      } else if (!checked && !modulo.permisos.some(p => nuevos.includes(p))) {
        nuevos = nuevos.filter(p => p !== modulo.listar)
      }
    }
    setFormData({ ...formData, permisos: nuevos })
  }

  const getPermisoLabel = (permiso) => {
    const labels = {
      'listar_usuario': 'Listar', 'registrar_usuario': 'Registrar', 'consultar_usuario': 'Consultar', 'actualizar_usuario': 'Actualizar', 'inhabilitar_usuario': 'Inhabilitar',
      'listar_rol': 'Listar', 'registrar_rol': 'Registrar', 'consultar_rol': 'Consultar', 'actualizar_rol': 'Actualizar', 'inhabilitar_rol': 'Inhabilitar',
      'listar_cliente': 'Listar', 'registrar_cliente': 'Registrar', 'consultar_cliente': 'Consultar', 'actualizar_cliente': 'Actualizar', 'inhabilitar_cliente': 'Inhabilitar',
      'listar_propietario': 'Listar', 'registrar_propietario': 'Registrar', 'consultar_propietario': 'Consultar', 'actualizar_propietario': 'Actualizar', 'inhabilitar_propietario': 'Inhabilitar',
      'listar_vehiculo': 'Listar', 'registrar_vehiculo': 'Registrar', 'consultar_vehiculo': 'Consultar', 'actualizar_vehiculo': 'Actualizar', 'inhabilitar_vehiculo': 'Inhabilitar',
      'listar_conductor': 'Listar', 'registrar_conductor': 'Registrar', 'consultar_conductor': 'Consultar', 'actualizar_conductor': 'Actualizar', 'inhabilitar_conductor': 'Inhabilitar',
      'listar_destino': 'Listar', 'registrar_destino': 'Registrar', 'consultar_destino': 'Consultar', 'actualizar_destino': 'Actualizar', 'inhabilitar_destino': 'Inhabilitar',
      'listar_ruta': 'Listar', 'registrar_ruta': 'Registrar', 'consultar_ruta': 'Consultar', 'actualizar_ruta': 'Actualizar', 'inhabilitar_ruta': 'Inhabilitar',
      'listar_anticipo': 'Listar', 'registrar_anticipo': 'Registrar', 'consultar_anticipo': 'Consultar', 'actualizar_anticipo': 'Actualizar', 'inhabilitar_anticipo': 'Inhabilitar',
      'listar_venta': 'Listar', 'registrar_venta': 'Registrar', 'consultar_venta': 'Consultar', 'actualizar_venta': 'Actualizar', 'inhabilitar_venta': 'Inhabilitar',
      'ver_dashboard': 'Ver',
    }
    return labels[permiso] || permiso.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
  }

  // Cargar permisos disponibles desde el backend al montar
  useEffect(() => {
    const cargarPermisos = async () => {
      const respuesta = await getPermisosBackend()
      if (respuesta.success) {
        setPermisosDisponibles(respuesta.data || [])
      }
    }
    cargarPermisos()
  }, [getPermisosBackend])

  // Limpia en vivo el error de "permisos" apenas queda al menos uno seleccionado
  // (toggleModulo/togglePermiso tienen varios puntos de entrada, un efecto cubre todos)
  useEffect(() => {
    if (formData.permisos.length > 0 && errores.permisos) {
      setErrores(prev => ({ ...prev, permisos: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.permisos.length])

  useEffect(() => {
    if (rolProp) {
      const nuevoForm = {
        nombre: rolProp.nombre || '',
        descripcion: rolProp.descripcion || '',
        permisos: (rolProp.permisos || []).map(p => typeof p === 'string' ? p : p.nombre)
      }
      setFormData(nuevoForm)
      setFormOriginal(nuevoForm)
      setSinCambios(false)
      setIntentoGuardar(false)
      setAvisoNombreDuplicado('')
      setErrores({})
    }
  }, [rolProp])

  const verificarNombreRolDuplicado = async () => {
    if (!formData.nombre.trim()) {
      setAvisoNombreDuplicado('')
      return
    }
    try {
      const res = await getRolesBackend({ q: formData.nombre.trim(), limit: 10 })
      if (!res?.success) return
      const idActual = rolProp?.idRol ?? rolProp?.id
      const duplicado = hayDocumentoDuplicado(res.data, formData.nombre, {
        getDoc: (r) => r.nombre,
        getId: (r) => r.idRol ?? r.id,
        excludeId: idActual
      })
      setAvisoNombreDuplicado(duplicado ? MENSAJE_ROL_DUPLICADO : '')
      if (duplicado) setErrores(prev => ({ ...prev, nombre: MENSAJE_ROL_DUPLICADO }))
    } catch {
      // Si falla la verificación no bloqueamos el flujo de edición
    }
  }

  useEffect(() => {
    if (formOriginal) {
      setSinCambios(
        formData.nombre === formOriginal.nombre &&
        formData.descripcion === formOriginal.descripcion &&
        JSON.stringify(formData.permisos.sort()) === JSON.stringify(formOriginal.permisos.sort())
      )
    }
  }, [formData, formOriginal])

  const cerrar = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setErrores({})
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIntentoGuardar(true)

    if (!sinCambios) {
      const erroresEncontrados = {}
      if (!formData.nombre.trim()) erroresEncontrados.nombre = 'El nombre del rol es obligatorio'
      else if (!SOLO_LETRAS_REGEX.test(formData.nombre)) erroresEncontrados.nombre = 'El nombre solo puede contener letras'
      else if (avisoNombreDuplicado) erroresEncontrados.nombre = avisoNombreDuplicado
      if (formData.descripcion && esSoloRelleno(formData.descripcion)) erroresEncontrados.descripcion = 'La descripción no puede contener solo espacios'
      if (formData.permisos.length === 0) erroresEncontrados.permisos = 'Debes seleccionar al menos un permiso'
      if (Object.keys(erroresEncontrados).length > 0) {
        setErrores(erroresEncontrados)
        return
      }
    }

    if (sinCambios) {
      setError('')
      return
    }

    setErrores({})
    setError('')
    setEnviando(true)
    try {
      // Convertir nombres de permisos a IDs numéricos
      const idsPermisos = formData.permisos
        .map(nombrePermiso => {
          const permiso = permisosDisponibles.find(p => p.nombre === nombrePermiso)
          return permiso ? permiso.idPermiso || permiso.id : null
        })
        .filter(id => id !== null)

      const respuesta = await actualizarRolBackend(rolProp.idRol || rolProp.id, formData.nombre, formData.descripcion, idsPermisos, rolProp.habilitado)

      if (respuesta.success) {
        onSuccess && onSuccess()
        cerrar()
      } else {
        setError(respuesta.message || 'Error al actualizar el rol')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Error al actualizar el rol'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onClose={cerrar} maxWidth={false} fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh', width: '100%', maxWidth: 1040 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Actualizar Rol
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            Modifica los permisos del rol.
          </Typography>
        </Box>
        <IconButton onClick={cerrar} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {intentoGuardar && sinCambios && !error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setIntentoGuardar(false)}>
            No has realizado ningún cambio. Los permisos del rol ya están actualizados.
          </Alert>
        )}
        {error && !(intentoGuardar && sinCambios) && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingTop: 20 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2 }}>
            <FormField
              label="Nombre del Rol"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                setFormData({ ...formData, nombre: valor })
                setAvisoNombreDuplicado('')
                setErrores(prev => prev.nombre ? { ...prev, nombre: valor.trim() ? '' : prev.nombre } : prev)
              }}
              onBlur={() => {
                verificarNombreRolDuplicado()
                setErrores(prev => ({
                  ...prev,
                  nombre: !formData.nombre.trim()
                    ? 'El nombre del rol es obligatorio'
                    : !SOLO_LETRAS_REGEX.test(formData.nombre)
                    ? 'El nombre solo puede contener letras'
                    : ''
                }))
              }}
              error={!!errores.nombre}
              helperText={errores.nombre}
              placeholder="Ej: Gerente, Supervisor, Asesor comercial"
              required
              inputProps={{ maxLength: 50 }}
            />

            <FormField
              label="Descripción (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')
                setFormData({ ...formData, descripcion: valor })
                setErrores(prev => prev.descripcion ? { ...prev, descripcion: esSoloRelleno(valor) ? prev.descripcion : '' } : prev)
              }}
              onBlur={() => setErrores(prev => ({ ...prev, descripcion: (formData.descripcion && esSoloRelleno(formData.descripcion)) ? 'La descripción no puede contener solo espacios' : '' }))}
              placeholder="Descripción del rol"
              inputProps={{ maxLength: 200 }}
              error={!!errores.descripcion}
              helperText={errores.descripcion || `${formData.descripcion.length}/200`}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Permisos del Rol
            </Typography>
            {errores.permisos && (
              <Typography variant="caption" fontWeight={600} color={theme.palette.error.main}>
                {errores.permisos}
              </Typography>
            )}
          </Box>

          <Box sx={{
            flex: 1, overflowY: 'auto', pr: 1,
            display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, alignContent: 'start',
            ...(errores.permisos ? { border: `1px solid ${theme.palette.error.main}`, borderRadius: 2, p: 1 } : {}),
          }}>
            {modulos.map(([moduloKey, modulo]) => (
              <Paper
                key={moduloKey}
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.muted
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.muted
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {modulo.nombre}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        checked={modulo.permisos.every(p => formData.permisos.includes(p))}
                        indeterminate={
                          modulo.permisos.filter(p => formData.permisos.includes(p)).length > 0 &&
                          modulo.permisos.some(p => !formData.permisos.includes(p))
                        }
                        onChange={() => {
                          const todosSeleccionados = modulo.permisos.every(p => formData.permisos.includes(p))
                          toggleModulo(modulo, todosSeleccionados)
                        }}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                          '&.MuiCheckbox-indeterminate': { color: theme.palette.primary.main }
                        }}
                      />
                    }
                    label={`${modulo.permisos.filter(p => formData.permisos.includes(p)).length}/${modulo.permisos.length}`}
                  />
                </Box>

                <Box sx={{ p: 1.5, backgroundColor: theme.palette.background.paper, display: 'flex', flexWrap: 'nowrap', gap: 0.75, overflowX: 'auto' }}>
                  {modulo.permisos.map((permiso) => {
                    const marcado = formData.permisos.includes(permiso)
                    return (
                      <FormControlLabel
                        key={permiso}
                        control={
                          <Checkbox
                            checked={marcado}
                            onChange={(e) => togglePermiso(modulo, permiso, e.target.checked)}
                            size="small"
                            sx={{
                              p: 0.25, mr: 0.5,
                              color: theme.palette.primary.main,
                              '&.Mui-checked': { color: theme.palette.primary.main },
                              '& .MuiSvgIcon-root': { fontSize: 16 },
                            }}
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: marcado ? theme.palette.primary.dark : theme.palette.text.secondary }}>
                            {getPermisoLabel(permiso)}
                          </Typography>
                        }
                        sx={{
                          m: 0, pl: 0.5, pr: 1.25, py: 0.25, flexShrink: 0,
                          borderRadius: 999,
                          border: `1px solid ${marcado ? theme.palette.primary.main : theme.palette.divider}`,
                          backgroundColor: marcado ? theme.palette.primary.activeBg : theme.palette.background.muted,
                          '&:hover': { backgroundColor: marcado ? theme.palette.primary.activeBg : theme.palette.background.subtle },
                        }}
                      />
                    )
                  })}
                </Box>
              </Paper>
            ))}
          </Box>
        </form>
      </DialogContent>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 2, pt: 2, px: 3, borderTop: `1px solid ${theme.palette.divider}`,
      }}>
          <Button onClick={cerrar} disableRipple
            sx={{
              textTransform: 'none', color: theme.palette.text.secondary, fontWeight: 500, borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              px: 2.5,
              '&:hover': { backgroundColor: theme.palette.background.subtle, color: theme.palette.text.primary },
            }}>
            Cancelar
          </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleSubmit} variant="contained" disableRipple
            disabled={enviando}
            endIcon={enviando ? undefined : <SaveOutlined />}
            sx={{
              textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 170,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
              '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
            }}
          >
            {enviando ? <CircularProgress size={18} color="inherit" /> : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarRol

