import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, Snackbar, Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material'
import { Security, Close, SaveOutlined } from '@mui/icons-material'
import { MODULOS, ROLES, useAuth } from '../../shared/contexts/AuthContext.jsx'
import {
  FormField, PrimaryButton, SecondaryButton,
  FormButtonGroup
} from '../../shared/components/FormularioEstandarizado.jsx'

const ActualizarRol = ({ open, onClose, rol: rolProp, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sinCambios, setSinCambios] = useState(false)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [formOriginal, setFormOriginal] = useState(null)
  const [permisosDisponibles, setPermisosDisponibles] = useState([])

  const { getPermisosBackend, actualizarRolBackend } = useAuth()
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
    return labels[permiso] || permiso
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
    }
  }, [rolProp])

  useEffect(() => {
    if (formOriginal) {
      setSinCambios(
        formData.nombre === formOriginal.nombre &&
        formData.descripcion === formOriginal.descripcion &&
        JSON.stringify(formData.permisos.sort()) === JSON.stringify(formOriginal.permisos.sort())
      )
    }
  }, [formData, formOriginal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIntentoGuardar(true)

    if (!formData.nombre.trim() && !sinCambios) {
      setError('El nombre del rol es requerido')
      return
    }

    if (formData.permisos.length === 0 && !sinCambios) {
      setError('Debe seleccionar al menos un permiso')
      return
    }

    if (sinCambios) {
      setError('')
      return
    }

    setMensaje('')
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
        onClose()
      } else {
        setError(respuesta.message || 'Error al actualizar el rol')
      }
    } catch (err) {
      setError('Error al actualizar el rol')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Actualizar Rol
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            Modifica los permisos del rol.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
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
          <FormField
            label="Nombre del Rol"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Gerente, Supervisor, Asesor comercial"
            inputProps={{ maxLength: 50 }}
          />

          <Box sx={{ mb: 2, mt: 2 }}>
            <FormField
              label="Descripción (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del rol"
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.descripcion.length}/200`}
            />
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1, fontWeight: 700, color: theme.palette.text.primary }}>
            Permisos del Rol
          </Typography>

          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
            {modulos.map(([moduloKey, modulo]) => (
              <Paper
                key={moduloKey}
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  mb: 1.5,
                  backgroundColor: '#F8F9FA'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: '#F8F9FA'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {modulo.nombre}
                    </Typography>
                  </Box>
                  <FormControlLabel
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

                <Box sx={{ p: 1.5, backgroundColor: 'white' }}>
                  <Grid container spacing={0.5}>
                    {modulo.permisos.map((permiso) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={permiso}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permisos.includes(permiso)}
                              onChange={(e) => togglePermiso(modulo, permiso, e.target.checked)}
                              sx={{
                                color: theme.palette.primary.main,
                                '&.Mui-checked': { color: theme.palette.primary.main }
                              }}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {getPermisoLabel(permiso)}
                            </Typography>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
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
          <Button onClick={onClose} disableRipple
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
              textTransform: 'none', borderRadius: 2, fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`,
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${theme.palette.primary.activeBg}` },
              '&.Mui-disabled': { backgroundColor: theme.palette.divider, color: theme.palette.text.disabled },
            }}
          >
            {enviando ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarRol

