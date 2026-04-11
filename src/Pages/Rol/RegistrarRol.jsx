import { useState } from 'react'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, Collapse, IconButton, Snackbar, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Security, ExpandMore, ExpandLess, Close } from '@mui/icons-material'
import { useAuth, PERMISOS, MODULOS } from '../../Context/AuthContext'
import { 
  FormField, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const RegistrarRol = ({ open, onClose, onSuccess }) => {
  const { tienePermiso, registrarRol, getRoles } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: '',
    permisos: []
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [modulosExpandidos, setModulosExpandidos] = useState({})

  const toggleModulo = (moduloKey) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [moduloKey]: !prev[moduloKey]
    }))
  }

  const modulos = Object.entries(MODULOS)

  const handleModuloChange = (moduloKey) => {
    const modulo = MODULOS[moduloKey]
    const permisosDelModulo = modulo.permisos
    
    const todosSeleccionados = permisosDelModulo.every(p => formData.permisos.includes(p))
    
    if (todosSeleccionados) {
      setFormData(prev => ({
        ...prev,
        permisos: prev.permisos.filter(p => !permisosDelModulo.includes(p))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...permisosDelModulo])]
      }))
    }
  }

  const handlePermisoChange = (permiso) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter(p => p !== permiso)
        : [...prev.permisos, permiso]
    }))
  }

  const getPermisoLabel = (permiso) => {
    const labels = {
      'registrar_usuario': 'Registrar',
      'listar_usuario': 'Listar',
      'consultar_usuario': 'Consultar',
      'actualizar_usuario': 'Actualizar',
      'inhabilitar_usuario': 'Inhabilitar',
      'registrar_rol': 'Registrar',
      'listar_rol': 'Listar',
      'consultar_rol': 'Consultar',
      'actualizar_rol': 'Actualizar',
      'registrar_cliente': 'Registrar',
      'listar_cliente': 'Listar',
      'consultar_cliente': 'Consultar',
      'actualizar_cliente': 'Actualizar',
      'inhabilitar_cliente': 'Inhabilitar',
      'registrar_vehiculo': 'Registrar',
      'listar_vehiculo': 'Listar',
      'consultar_vehiculo': 'Consultar',
      'actualizar_vehiculo': 'Actualizar',
      'registrar_conductor': 'Registrar',
      'listar_conductor': 'Listar',
      'consultar_conductor': 'Consultar',
      'actualizar_conductor': 'Actualizar',
      'registrar_destino': 'Registrar',
      'listar_destino': 'Listar',
      'consultar_destino': 'Consultar',
      'actualizar_destino': 'Actualizar',
      'registrar_ruta': 'Registrar',
      'listar_ruta': 'Listar',
      'consultar_ruta': 'Consultar',
      'actualizar_ruta': 'Actualizar',
      'registrar_encomienda': 'Registrar',
      'listar_encomienda': 'Listar',
      'consultar_encomienda': 'Consultar',
      'actualizar_encomienda': 'Actualizar',
      'registrar_anticipo': 'Registrar',
      'listar_anticipo': 'Listar',
      'consultar_anticipo': 'Consultar',
      'actualizar_anticipo': 'Actualizar',
      'registrar_venta': 'Registrar',
    }
    return labels[permiso] || permiso
  }

  const isModuloCompleto = (moduloKey) => {
    const modulo = MODULOS[moduloKey]
    return modulo.permisos.every(p => formData.permisos.includes(p))
  }

  const isModuloParcial = (moduloKey) => {
    const modulo = MODULOS[moduloKey]
    const algunosSeleccionados = modulo.permisos.some(p => formData.permisos.includes(p))
    const todosSeleccionados = modulo.permisos.every(p => formData.permisos.includes(p))
    return algunosSeleccionados && !todosSeleccionados
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nombre) {
      setError('El nombre del rol es requerido')
      return
    }

    if (formData.permisos.length === 0) {
      setError('Debe seleccionar al menos un permiso')
      return
    }

    registrarRol(formData)
    
    setMensaje('Rol registrado correctamente')
    setError('')
    
    setTimeout(() => {
      handleClose()
      if (onSuccess) onSuccess()
    }, 1500)
  }

  const handleClose = () => {
    setFormData({
      nombre: '',
      permisos: []
    })
    setError('')
    setMensaje('')
    setModulosExpandidos({})
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Security sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Registrar Nuevo Rol</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#8A94A6' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <FormField
              label="Nombre del Rol"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gerente, Vendedor, Conductor"
              required
            />
          </Box>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#1A2E6E' }}>
              Permisos por Módulo
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
              Selecciona los módulos o permisos individuales
            </Typography>

            <Grid container spacing={1}>
              {modulos.map(([moduloKey, modulo]) => {
                const expandido = modulosExpandidos[moduloKey] !== false
                const completo = isModuloCompleto(moduloKey)
                const parcial = isModuloParcial(moduloKey)

                return (
                  <Grid item xs={12} key={moduloKey}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        border: completo ? '2px solid #CC1818' : parcial ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: completo ? '#fef2f2' : parcial ? '#fffbeb' : '#f8fafc',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f1f5f9' }
                        }}
                        onClick={() => toggleModulo(moduloKey)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Checkbox
                            checked={completo}
                            indeterminate={parcial}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleModuloChange(moduloKey)
                            }}
                            sx={{ 
                              color: '#CC1818',
                              '&.Mui-checked': { color: '#CC1818' }
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1A2E6E' }}>
                            {modulo.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ({modulo.permisos.length} permisos)
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          {expandido ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>

                      <Collapse in={expandido}>
                        <Box sx={{ p: 1.5, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {modulo.permisos.map((permiso) => (
                            <FormControlLabel
                              key={permiso}
                              control={
                                <Checkbox
                                  checked={formData.permisos.includes(permiso)}
                                  onChange={() => handlePermisoChange(permiso)}
                                  size="small"
                                  sx={{ 
                                    color: '#64748b',
                                    '&.Mui-checked': { color: '#CC1818' }
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                  {getPermisoLabel(permiso)}
                                </Typography>
                              }
                              sx={{ 
                                mr: 2,
                                mb: 0.5,
                                '&:hover': { backgroundColor: '#f9fafb', borderRadius: 1 }
                              }}
                            />
                          ))}
                        </Box>
                      </Collapse>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Permisos seleccionados: {formData.permisos.length}
            </Typography>
          </Box>

          <FormButtonGroup>
            <SecondaryButton onClick={handleClose} type="button">
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit">
              Registrar Rol
            </PrimaryButton>
          </FormButtonGroup>
        </form>
      </DialogContent>

      <Snackbar open={!!mensaje} autoHideDuration={2500} onClose={() => setMensaje('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.85rem' }} onClose={() => setMensaje('')}>
          ¡Rol registrado exitosamente!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default RegistrarRol