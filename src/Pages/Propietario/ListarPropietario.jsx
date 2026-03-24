import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, Switch, FormControl, Select, MenuItem } from '@mui/material'
import { Edit, DirectionsCar, Search, Add, CheckCircle, Cancel } from '@mui/icons-material'
import { usePropietario } from '../../Context/PropietarioContext'
import { useAuth } from '../../Context/AuthContext'

const ListarPropietario = () => {
  const [propietarios, setPropietarios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const { getPropietarios, toggleHabilitado, updateEstado } = usePropietario()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setPropietarios(getPropietarios())
    }
  }, [usuario, navigate, getPropietarios])

  const handleToggleHabilitado = (id) => {
    toggleHabilitado(id)
    setPropietarios(getPropietarios())
  }

  // Cambiar estado directamente en la tabla
  const handleEstadoChange = (id, nuevoEstado) => {
    updateEstado(id, nuevoEstado)
    setPropietarios(getPropietarios())
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success'
      case 'Inactivo':
        return 'error'
      default:
        return 'default'
    }
  }

  const filteredPropietarios = propietarios.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numeroIdentificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTipoIdentificacionLabel = (tipo) => {
    const tipos = {
      'CC': 'Cédula',
      'NIT': 'NIT',
      'CE': 'Cédula Extranjería',
      'TI': 'Tarjeta Identidad',
      'PAS': 'Pasaporte',
      'RC': 'Registro Civil'
    }
    return tipos[tipo] || tipo
  }

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>
                Lista de Propietarios
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Gestiona los propietarios de vehículos registrados
              </Typography>
            </Box>
          </Box>
          
          <Button
            component={Link}
            to="/transporte/propietarios/registrar"
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: '#CC1818',
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
              '&:hover': { 
                backgroundColor: '#b91c1c',
                boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)',
              },
            }}
          >
            Nuevo Propietario
          </Button>
        </Box>

        {/* Buscador */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, identificación, ciudad o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
              },
            }}
          />
        </Box>

        {/* Tabla */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Identificación</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Ciudad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Habilitado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPropietarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#64748b' }}>
                      No se encontraron propietarios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPropietarios.map((propietario) => (
                  <TableRow 
                    key={propietario.idPropietario}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f0f5ff' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Chip 
                          label={getTipoIdentificacionLabel(propietario.tipoIdentificacion)} 
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: '#fef2f2',
                            color: '#CC1818',
                            mb: 0.5
                          }}
                        />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {propietario.numeroIdentificacion}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {propietario.nombre} {propietario.apellido}
                        </Typography>
                        {propietario.tipoIdentificacion === 'NIT' && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Persona Jurídica
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{propietario.telefono}</TableCell>
                    <TableCell>
                      {propietario.email || '-'}
                    </TableCell>
                    <TableCell>{propietario.ciudad}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={propietario.estado}
                          onChange={(e) => handleEstadoChange(propietario.idPropietario, e.target.value)}
                          sx={{ 
                            fontSize: '0.75rem',
                            '& .MuiSelect-select': { py: 0.5 },
                            color: getEstadoColor(propietario.estado) === 'success' ? '#10b981' : 
                                   getEstadoColor(propietario.estado) === 'error' ? '#dc2626' : '#64748b'
                          }}
                        >
                          <MenuItem value="Activo">Activo</MenuItem>
                          <MenuItem value="Inactivo">Inactivo</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Switch 
                        checked={propietario.habilitado !== false}
                        onChange={() => handleToggleHabilitado(propietario.idPropietario)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          component={Link}
                          to={`/transporte/propietarios/actualizar/${propietario.idPropietario}`}
                          sx={{ 
                            color: '#CC1818',
                            '&:hover': { backgroundColor: '#fef2f2' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer con total */}
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
            Total de propietarios: <strong>{filteredPropietarios.length}</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default ListarPropietario
