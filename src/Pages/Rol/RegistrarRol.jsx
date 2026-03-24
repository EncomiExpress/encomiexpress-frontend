import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, FormControlLabel, Checkbox, Grid, Alert, Collapse, IconButton } from '@mui/material'
import { Security, ExpandMore, ExpandLess, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import { useAuth, PERMISOS, MODULOS } from '../../Context/AuthContext'
import { 
  theme, FormField, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const RegistrarRol = () => {
  const { tienePermiso, registrarRol, getRoles } = useAuth()
  const navigate = useNavigate()
  
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

  // Obtener todos los módulos
  const modulos = Object.entries(MODULOS)

  // Manejar cambio de módulo (seleccionar todos los permisos del módulo)
  const handleModuloChange = (moduloKey) => {
    const modulo = MODULOS[moduloKey]
    const permisosDelModulo = modulo.permisos
    
    // Verificar si todos los permisos del módulo ya están seleccionados
    const todosSeleccionados = permisosDelModulo.every(p => formData.permisos.includes(p))
    
    if (todosSeleccionados) {
      // Deseleccionar todos los permisos del módulo
      setFormData(prev => ({
        ...prev,
        permisos: prev.permisos.filter(p => !permisosDelModulo.includes(p))
      }))
    } else {
      // Seleccionar todos los permisos del módulo
      setFormData(prev => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...permisosDelModulo])]
      }))
    }
  }

  // Manejar cambio de permiso individual
  const handlePermisoChange = (permiso) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter(p => p !== permiso)
        : [...prev.permisos, permiso]
    }))
  }

  // Obtener label legible para un permiso
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

  // Verificar si todos los permisos de un módulo están seleccionados
  const isModuloCompleto = (moduloKey) => {
    const modulo = MODULOS[moduloKey]
    return modulo.permisos.every(p => formData.permisos.includes(p))
  }

  // Verificar si algunos permisos de un módulo están seleccionados
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
    
    setFormData({
      nombre: '',
      permisos: []
    })
    
    setTimeout(() => setMensaje(''), 3000)
  }

  if (!tienePermiso(PERMISOS.REGISTRAR_ROL)) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800, mx: 'auto' }}>
          <FormAlert severity="error">
            No tienes permisos para registrar roles.
          </FormAlert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>
        <FormHeader 
          icon={Security} 
          title="Registrar Nuevo Rol" 
          subtitle="Asigna permisos por módulos"
        />

        {mensaje && (
          <FormAlert severity="success">
            {mensaje}
          </FormAlert>
        )}

        {error && (
          <FormAlert>
            {error}
          </FormAlert>
        )}

        <form onSubmit={handleSubmit}>
          <FormFieldsContainer>
            <FormField
              label="Nombre del Rol"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gerente, Vendedor, Conductor"
              required
            />
          </FormFieldsContainer>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A2E6E' }}>
              Permisos por Módulo
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
              Selecciona los módulos completos o los permisos individuales
            </Typography>

            <Grid container spacing={2}>
              {modulos.map(([moduloKey, modulo]) => {
                const expandido = modulosExpandidos[moduloKey] !== false // Por defecto expandido
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
                      {/* Encabezado del módulo */}
                      <Box 
                        sx={{ 
                          p: 2, 
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

                      {/* Permisos individuales del módulo */}
                      <Collapse in={expandido}>
                        <Box sx={{ p: 2, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              Permisos seleccionados: {formData.permisos.length}
            </Typography>
          </Box>

          <FormButtonGroup>
            <SecondaryButton onClick={() => navigate('/roles')} type="button">
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit">
              Registrar Rol
            </PrimaryButton>
          </FormButtonGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default RegistrarRol
