import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, Switch, FormControl, Select, MenuItem } from '@mui/material'
import { Edit, DirectionsCar, Search, Add } from '@mui/icons-material'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'

const ListarDestino = () => {
  const [destinos, setDestinos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const { getDestinos, updateEstado, toggleHabilitado } = useDestino()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setDestinos(getDestinos())
    }
  }, [usuario, navigate, getDestinos])

  // Cambiar estado directamente en la tabla
  const handleEstadoChange = (id, nuevoEstado) => {
    updateEstado(id, nuevoEstado)
    setDestinos(getDestinos())
  }

  const handleToggleHabilitado = (id) => {
    toggleHabilitado(id)
    setDestinos(getDestinos())
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

  const filteredDestinos = destinos.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                Lista de Destinos
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Gestiona los destinos de entrega
              </Typography>
            </Box>
          </Box>
          
          <Button
            component={Link}
            to="/transporte/destinos/registrar"
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
            Nuevo Destino
          </Button>
        </Box>

        {/* Buscador */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, ciudad o departamento..."
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
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Dirección</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Ciudad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem' }}>Habilitado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDestinos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#64748b' }}>
                      No se encontraron destinos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDestinos.map((destino) => (
                  <TableRow 
                    key={destino.idDestino}
                    sx={{ 
                      '&:hover': { backgroundColor: '#fef2f2' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {destino.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>{destino.direccion}</TableCell>
                    <TableCell>{destino.ciudad}</TableCell>
                    <TableCell>{destino.departamento}</TableCell>
                    <TableCell>{destino.telefono}</TableCell>
                    <TableCell>{destino.contacto}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={destino.estado}
                          onChange={(e) => handleEstadoChange(destino.idDestino, e.target.value)}
                          sx={{ 
                            fontSize: '0.75rem',
                            '& .MuiSelect-select': { py: 0.5 },
                            color: getEstadoColor(destino.estado) === 'success' ? '#10b981' : 
                                   getEstadoColor(destino.estado) === 'error' ? '#dc2626' : '#64748b'
                          }}
                        >
                          <MenuItem value="Activo">Activo</MenuItem>
                          <MenuItem value="Inactivo">Inactivo</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Switch 
                        checked={destino.habilitado !== false}
                        onChange={() => handleToggleHabilitado(destino.idDestino)}
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
                          to={`/transporte/destinos/actualizar/${destino.idDestino}`}
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
            Total de destinos: <strong>{filteredDestinos.length}</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default ListarDestino
