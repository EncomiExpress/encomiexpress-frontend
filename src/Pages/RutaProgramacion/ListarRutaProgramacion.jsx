import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, FormControl, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material'
import { Edit, Route, Search, Add, Visibility } from '@mui/icons-material'
import { useRutaProgramacion } from '../../Context/RutaProgramacionContext'
import { useTransporte } from '../../Context/TransporteContext'
import { useConductor } from '../../Context/ConductorContext'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'

const ListarRutaProgramacion = () => {
  const [rutasProgramadas, setRutasProgramadas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [rutaVer, setRutaVer] = useState(null)
  
  const { getRutasProgramadas, updateEstado } = useRutaProgramacion()
  const { getTransportes } = useTransporte()
  const { getConductores } = useConductor()
  const { getDestinos } = useDestino()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setRutasProgramadas(getRutasProgramadas())
    }
  }, [usuario, navigate, getRutasProgramadas])

  const handleEstadoChange = (id, nuevoEstado) => {
    updateEstado(id, nuevoEstado)
    setRutasProgramadas(getRutasProgramadas())
  }

  const getVehiculoPlaca = (id) => {
    const vehiculos = getTransportes()
    const vehiculo = vehiculos.find(v => v.idVehiculo === id)
    return vehiculo ? vehiculo.placa : 'N/A'
  }

  const getConductorNombre = (id) => {
    const conductores = getConductores()
    const conductor = conductores.find(c => c.idConductor === id)
    return conductor ? `${conductor.nombre} ${conductor.apellido}` : 'N/A'
  }

  const getDestinoNombre = (id) => {
    const destinos = getDestinos()
    const destino = destinos.find(d => d.idDestino === id)
    return destino ? destino.nombre : 'N/A'
  }

  const filteredRutas = rutasProgramadas.filter(r => 
    r.nombreRuta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fechaSalida.includes(searchTerm) ||
    getVehiculoPlaca(r.idVehiculo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getConductorNombre(r.idConductor).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Route sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Programación de Rutas</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Gestiona las rutas programadas</Typography>
            </Box>
          </Box>
          <Button component={Link} to="/transporte/rutas/registrar" variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#CC1818', borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)', '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)' }}}>
            Nueva Ruta
          </Button>
        </Box>

        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField fullWidth placeholder="Buscar por nombre, fecha, vehículo o conductor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>)}} sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#e2e8f0' } }}} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Ruta</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Hora Salida</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Vehículo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Conductor</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Destino</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRutas.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}><Typography sx={{ color: '#64748b' }}>No se encontraron rutas</Typography></TableCell></TableRow>
              ) : (
                filteredRutas.map((ruta) => (
                  <TableRow key={ruta.idRutaProgramada} sx={{ '&:hover': { backgroundColor: '#f0f5ff' }, '&:last-child td': { borderBottom: 0 }}}>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{ruta.nombreRuta}</Typography></TableCell>
                    <TableCell>{ruta.fechaSalida}</TableCell>
                    <TableCell>{ruta.horaSalida || '-'}</TableCell>
                    <TableCell><Chip label={getVehiculoPlaca(ruta.idVehiculo)} size="small" sx={{ fontWeight: 600, backgroundColor: '#fef2f2', color: '#CC1818' }} /></TableCell>
                    <TableCell>{getConductorNombre(ruta.idConductor)}</TableCell>
                    <TableCell>{getDestinoNombre(ruta.idDestino)}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={ruta.estado} onChange={(e) => handleEstadoChange(ruta.idRutaProgramada, e.target.value)} sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0.5 }}}>
                          <MenuItem value="Programada">Programada</MenuItem>
                          <MenuItem value="En Curso">En Curso</MenuItem>
                          <MenuItem value="Completada">Completada</MenuItem>
                          <MenuItem value="Cancelada">Cancelada</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => setRutaVer(ruta)} sx={{ color: '#1A2E6E', '&:hover': { backgroundColor: '#e8edff' }}}><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small" component={Link} to={`/transporte/rutas/actualizar/${ruta.idRutaProgramada}`} sx={{ color: '#CC1818', '&:hover': { backgroundColor: '#fef2f2' }}}><Edit fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Total de rutas: <strong>{filteredRutas.length}</strong></Typography>
        </Box>
      </Paper>

      <Dialog open={!!rutaVer} onClose={() => setRutaVer(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1A2E6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Route sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} color="#1A2E6E">{rutaVer?.nombreRuta}</Typography>
            <Typography variant="caption" color="#8A94A6">Detalle de la ruta</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Fecha Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer?.fechaSalida}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Hora Salida</Typography><Typography variant="body2" fontWeight={500}>{rutaVer?.horaSalida || '-'}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Vehículo</Typography><Typography variant="body2" fontWeight={500}>{getVehiculoPlaca(rutaVer?.idVehiculo)}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Conductor</Typography><Typography variant="body2" fontWeight={500}>{getConductorNombre(rutaVer?.idConductor)}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Destino</Typography><Typography variant="body2" fontWeight={500}>{getDestinoNombre(rutaVer?.idDestino)}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500}>{rutaVer?.estado}</Typography></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRutaVer(null)} variant="contained" sx={{ backgroundColor: '#1A2E6E', borderRadius: 2, textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ListarRutaProgramacion