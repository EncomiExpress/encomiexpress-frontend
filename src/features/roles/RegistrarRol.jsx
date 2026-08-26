import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, Button, CircularProgress } from '@mui/material'
import { Close, CheckOutlined } from '@mui/icons-material'
import { useAuth, MODULOS } from '../../shared/contexts/AuthContext.jsx'
import { PERMISOS } from '../../shared/config/permisos.js'
import { useToast } from '../../shared/contexts/ToastContext.jsx'
import { getErrorMessage } from '../../shared/utils/errorMessage.js'
import { FormAlert } from '../../shared/components/FormularioEstandarizado.jsx'
import { validarFormRol, toggleModuloPermisos, togglePermisoEnLista } from './utils/rolValidation.js'
import { useDuplicadoRol } from './hooks/useDuplicadoRol.js'
import { cancelButtonSx, primaryButtonSx } from './style/formStyles.js'
import DatosRolFields from './components/DatosRolFields.jsx'
import PermisosGrid from './components/PermisosGrid.jsx'

const RegistrarRol = ({ open, onClose, onSuccess }) => {
  const { tienePermiso, registrarRol, getPermisosBackend, getRolesBackend } = useAuth()
  const { showToast } = useToast()
  const theme = useTheme()

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: []
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [permisosDisponibles, setPermisosDisponibles] = useState([])

  const { avisoNombreDuplicado, setAvisoNombreDuplicado, verificarNombreRolDuplicado } = useDuplicadoRol({
    nombre: formData.nombre, setErrores, getRolesBackend,
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const erroresEncontrados = validarFormRol(formData, avisoNombreDuplicado)
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
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

      const respuesta = await registrarRol(formData.nombre, idsPermisos, formData.descripcion)

      if (respuesta.success) {
        onSuccess && onSuccess()
        handleClose()
        showToast('¡Rol registrado exitosamente!', 'success')
      } else {
        setError(respuesta.message || 'Error al registrar el rol')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Error al registrar el rol'))
    } finally {
      setEnviando(false)
    }
  }

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setFormData({
      nombre: '',
      descripcion: '',
      permisos: []
    })
    setError('')
    setErrores({})
    setAvisoNombreDuplicado('')
    onClose()
  }

  if (!tienePermiso(PERMISOS.REGISTRAR_ROL)) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 3 } } }}>
        <FormAlert severity="error">
          No tienes permisos para registrar roles.
        </FormAlert>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh', width: '100%', maxWidth: 1040 } } }}>
      <DialogTitle sx={{ m: 0, p: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Registrar Nuevo Rol
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            Selecciona los permisos del nuevo rol.
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <FormAlert>
            {error}
          </FormAlert>
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
          <Button onClick={handleClose} disableRipple
            sx={cancelButtonSx(theme)}>
            Cancelar
          </Button>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button onClick={handleSubmit} variant="contained" disableRipple
            disabled={enviando}
            endIcon={enviando ? undefined : <CheckOutlined />}
            sx={primaryButtonSx(theme, { minWidth: 160 })}>
            {enviando ? <CircularProgress size={18} color="inherit" /> : 'Registrar'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default RegistrarRol
