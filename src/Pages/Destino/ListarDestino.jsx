import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, TextField, InputAdornment, Switch, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material'
import { Edit, LocationOn, Search, Add, Visibility } from '@mui/icons-material'
import { useDestino } from '../../Context/DestinoContext'
import { useAuth } from '../../Context/AuthContext'

const ListarDestino = () => {
  const [destinos, setDestinos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [destinoVer, setDestinoVer] = useState(null)
  
  const { getDestinos, toggleHabilitado } = useDestino()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setDestinos(getDestinos())
    }
  }, [usuario, navigate, getDestinos])

  const handleToggleHabilitado = (id) => {
    toggleHabilitado(id)
    setDestinos(getDestinos())
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
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocationOn sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Lista de Destinos</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Gestiona los destinos de entrega</Typography>
            </Box>
          </Box>
          <Button component={Link} to="/transporte/destinos/registrar" variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#CC1818', borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)', '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)' }}}>
            Nuevo Destino
          </Button>
        </Box>

        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField fullWidth placeholder="Buscar por nombre, ciudad, departamento o dirección..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>)}} sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#e2e8f0' } }}} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Dirección</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Ciudad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Habilitado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDestinos.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}><Typography sx={{ color: '#64748b' }}>No se encontraron destinos</Typography></TableCell></TableRow>
              ) : (
                filteredDestinos.map((destino) => (
                  <TableRow key={destino.idDestino} sx={{ '&:hover': { backgroundColor: '#f0f5ff' }, '&:last-child td': { borderBottom: 0 }}}>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{destino.nombre}</Typography></TableCell>
                    <TableCell>{destino.direccion}</TableCell>
                    <TableCell>{destino.ciudad}</TableCell>
                    <TableCell>{destino.departamento}</TableCell>
                    <TableCell>{destino.telefono}</TableCell>
                    <TableCell>{destino.contacto}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Switch checked={destino.habilitado !== false} onChange={() => handleToggleHabilitado(destino.idDestino)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' }}} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => setDestinoVer(destino)} sx={{ color: '#1A2E6E', '&:hover': { backgroundColor: '#e8edff' }}}><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small" component={Link} to={`/transporte/destinos/actualizar/${destino.idDestino}`} sx={{ color: '#CC1818', '&:hover': { backgroundColor: '#fef2f2' }}}><Edit fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Total de destinos: <strong>{filteredDestinos.length}</strong></Typography>
        </Box>
      </Paper>

      <Dialog open={!!destinoVer} onClose={() => setDestinoVer(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1A2E6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocationOn sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} color="#1A2E6E">{destinoVer?.nombre}</Typography>
            <Typography variant="caption" color="#8A94A6">Detalle del destino</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Dirección</Typography><Typography variant="body2" fontWeight={500}>{destinoVer?.direccion}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Ciudad</Typography><Typography variant="body2" fontWeight={500}>{destinoVer?.ciudad}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Departamento</Typography><Typography variant="body2" fontWeight={500}>{destinoVer?.departamento}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{destinoVer?.telefono}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Contacto</Typography><Typography variant="body2" fontWeight={500}>{destinoVer?.contacto}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={destinoVer?.habilitado !== false ? '#2E7D32' : '#ef4444'}>{destinoVer?.habilitado !== false ? 'Activo' : 'Inactivo'}</Typography></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDestinoVer(null)} variant="contained" sx={{ backgroundColor: '#1A2E6E', borderRadius: 2, textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ListarDestino