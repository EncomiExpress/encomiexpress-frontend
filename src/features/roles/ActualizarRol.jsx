import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, Alert, Dialog, DialogTitle, DialogContent, IconButton, Button, CircularProgress } from '@mui/material'
import { Close, SaveOutlined } from '@mui/icons-material'
import { MODULOS, useAuth } from '../../shared/contexts/AuthContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { validarFormRol, toggleModuloPermisos, togglePermisoEnLista } from './validations/rolValidation.js'
import { useDuplicadoRol } from './hooks/useDuplicadoRol.js'
import { cancelButtonSx, primaryButtonSx } from './style/formStyles.js'
import DatosRolFields from './components/DatosRolFields.jsx'
import PermisosGrid from './components/PermisosGrid.jsx'

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

  const { getPermisosBackend, actualizarRolBackend, getRolesBackend } = useAuth()
  const theme = useTheme()

  const { avisoNombreDuplicado, setAvisoNombreDuplicado, verificarNombreRolDuplicado } = useDuplicadoRol({
    nombre: formData.nombre, setErrores, getRolesBackend, excludeId: rolProp?.idRol ?? rolProp?.id,
  })

  const modulos = Object.entries(MODULOS).filter(([key]) => key !== 'ROLES')

  const toggleModulo = (modulo, todosSeleccionados) => {
    setFormData(prev => ({ ...prev, permisos: toggleModuloPermisos(modulo, prev.permisos, todosSeleccionados) }))
  }

  const togglePermiso = (modulo, permiso, checked) => {
    setFormData(prev => ({ ...prev, permisos: togglePermisoEnLista(modulo, prev.permisos, permiso, checked) }))
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
  }, [rolProp, setAvisoNombreDuplicado])

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
      const erroresEncontrados = validarFormRol(formData, avisoNombreDuplicado)
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
          <DatosRolFields
            formData={formData} setFormData={setFormData} errores={errores} setErrores={setErrores}
            setAvisoNombreDuplicado={setAvisoNombreDuplicado} verificarNombreRolDuplicado={verificarNombreRolDuplicado}
          />

          <PermisosGrid
            theme={theme} modulos={modulos} permisos={formData.permisos} errorPermisos={errores.permisos}
            toggleModulo={toggleModulo} togglePermiso={togglePermiso}
          />
        </form>
      </DialogContent>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 2, pt: 2, px: 3, borderTop: `1px solid ${theme.palette.divider}`,
      }}>
          <Button onClick={cerrar} disableRipple
            sx={cancelButtonSx(theme)}>
            Cancelar
          </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleSubmit} variant="contained" disableRipple
            disabled={enviando}
            endIcon={enviando ? undefined : <SaveOutlined />}
            sx={primaryButtonSx(theme, { minWidth: 170 })}
          >
            {enviando ? <CircularProgress size={18} color="inherit" /> : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default ActualizarRol
