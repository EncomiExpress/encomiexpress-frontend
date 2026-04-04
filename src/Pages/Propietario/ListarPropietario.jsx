import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, Switch, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material'
import { Edit, DirectionsCar, Search, Add, Visibility } from '@mui/icons-material'
import { usePropietario } from '../../Context/PropietarioContext'
import { useAuth } from '../../Context/AuthContext'

const ListarPropietario = () => {
  const [propietarios, setPropietarios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [propietarioVer, setPropietarioVer] = useState(null)
  
  const { getPropietarios, toggleHabilitado } = usePropietario()
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

  const getTipoIdentificacionLabel = (tipo) => {
    const tipos = {
      'CC': 'Cédula', 'NIT': 'NIT', 'CE': 'Cédula Extranjería',
      'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil'
    }
    return tipos[tipo] || tipo
  }

  const filteredPropietarios = propietarios.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.numeroIdentificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Lista de Propietarios</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Gestiona los propietarios de vehículos registrados</Typography>
            </Box>
          </Box>
          <Button component={Link} to="/transporte/propietarios/registrar" variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#CC1818', borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)', '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)' }}}>
            Nuevo Propietario
          </Button>
        </Box>

        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField fullWidth placeholder="Buscar por nombre, identificación, ciudad o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>)}} sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#e2e8f0' } }}} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Identificación</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Ciudad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Habilitado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPropietarios.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}><Typography sx={{ color: '#64748b' }}>No se encontraron propietarios</Typography></TableCell></TableRow>
              ) : (
                filteredPropietarios.map((propietario) => (
                  <TableRow key={propietario.idPropietario} sx={{ '&:hover': { backgroundColor: '#f0f5ff' }, '&:last-child td': { borderBottom: 0 }}}>
                    <TableCell>
                      <Box><Chip label={getTipoIdentificacionLabel(propietario.tipoIdentificacion)} size="small" sx={{ fontWeight: 600, backgroundColor: '#fef2f2', color: '#CC1818', mb: 0.5 }} /><Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{propietario.numeroIdentificacion}</Typography></Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{propietario.nombre} {propietario.apellido}</Typography></TableCell>
                    <TableCell>{propietario.telefono}</TableCell>
                    <TableCell>{propietario.email || '-'}</TableCell>
                    <TableCell>{propietario.ciudad}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Switch checked={propietario.habilitado !== false} onChange={() => handleToggleHabilitado(propietario.idPropietario)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' }}} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => setPropietarioVer(propietario)} sx={{ color: '#1A2E6E', '&:hover': { backgroundColor: '#e8edff' }}}><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small" component={Link} to={`/transporte/propietarios/actualizar/${propietario.idPropietario}`} sx={{ color: '#CC1818', '&:hover': { backgroundColor: '#fef2f2' }}}><Edit fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Total de propietarios: <strong>{filteredPropietarios.length}</strong></Typography>
        </Box>
      </Paper>

      <Dialog open={!!propietarioVer} onClose={() => setPropietarioVer(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1A2E6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DirectionsCar sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} color="#1A2E6E">{propietarioVer?.nombre} {propietarioVer?.apellido}</Typography>
            <Typography variant="caption" color="#8A94A6">Detalle del propietario</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Tipo ID</Typography><Typography variant="body2" fontWeight={500}>{getTipoIdentificacionLabel(propietarioVer?.tipoIdentificacion)}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Número ID</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer?.numeroIdentificacion}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer?.telefono}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Ciudad</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer?.ciudad}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Email</Typography><Typography variant="body2" fontWeight={500}>{propietarioVer?.email || '-'}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={propietarioVer?.habilitado !== false ? '#2E7D32' : '#ef4444'}>{propietarioVer?.habilitado !== false ? 'Activo' : 'Inactivo'}</Typography></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPropietarioVer(null)} variant="contained" sx={{ backgroundColor: '#1A2E6E', borderRadius: 2, textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ListarPropietario