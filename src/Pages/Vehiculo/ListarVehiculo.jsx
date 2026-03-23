import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment } from '@mui/material'
import { Edit, Delete, DirectionsCar, Search, Add } from '@mui/icons-material'
import { useTransporte } from '../../Context/TransporteContext'
import { useAuth } from '../../Context/AuthContext'

const ListarTransporte = () => {
  const [transportes, setTransportes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const { getTransportes, toggleHabilitado } = useTransporte()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setTransportes(getTransportes())
    }
  }, [usuario, navigate, getTransportes])

  const handleToggleHabilitado = (id) => {
    toggleHabilitado(id)
    setTransportes(getTransportes())
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success'
      case 'Inactivo':
        return 'error'
      case 'Mantenimiento':
        return 'warning'
      case 'En Reparación':
        return 'info'
      default:
        return 'default'
    }
  }

  const getHabilitadoColor = (habilitado) => {
    return habilitado ? 'success' : 'error'
  }

  const filteredTransportes = transportes.filter(t => 
    t.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
  }

  return (
    <Box sx={{ p: 4 }}>
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Lista de Transportes
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                Gestiona los vehículos registrados
              </Typography>
            </Box>
          </Box>
          
          <Button
            component={Link}
            to="/registrar-transporte"
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
            Nuevo Transporte
          </Button>
        </Box>

        {/* Buscador */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField
            fullWidth
            placeholder="Buscar por placa, marca, modelo o tipo..."
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
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Marca</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Modelo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Color</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Capacidad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>SOAT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#64748b' }}>
                      No se encontraron transportes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransportes.map((transporte) => (
                  <TableRow 
                    key={transporte.idVehiculo}
                    sx={{ 
                      '&:hover': { backgroundColor: '#fef2f2' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    <TableCell>{transporte.idVehiculo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transporte.placa} 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: '#fef2f2',
                          color: '#CC1818'
                        }}
                      />
                    </TableCell>
                    <TableCell>{transporte.marca}</TableCell>
                    <TableCell>{transporte.modelo}</TableCell>
                    <TableCell>{transporte.color}</TableCell>
                    <TableCell>{transporte.tipo}</TableCell>
                    <TableCell>{transporte.capacidad} kg</TableCell>
                    <TableCell>
                      <Chip 
                        label={transporte.estado} 
                        size="small"
                        color={getEstadoColor(transporte.estado)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transporte.vencimientoSOAT ? new Date(transporte.vencimientoSOAT).toLocaleDateString() : 'N/A'} 
                        size="small"
                        color={isVencido(transporte.vencimientoSOAT) ? 'error' : 'success'}
                        variant={isVencido(transporte.vencimientoSOAT) ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transporte.habilitado ? 'Habilitado' : 'Inhabilitado'} 
                        size="small"
                        color={getHabilitadoColor(transporte.habilitado)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleHabilitado(transporte.idVehiculo)}
                          sx={{ 
                            color: transporte.habilitado ? '#dc2626' : '#10b981',
                            '&:hover': { 
                              backgroundColor: transporte.habilitado ? '#fef2f2' : '#ecfdf5'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
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
          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Total de transportes: <strong>{filteredTransportes.length}</strong>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default ListarTransporte
