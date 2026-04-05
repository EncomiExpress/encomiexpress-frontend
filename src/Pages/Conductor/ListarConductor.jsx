import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, Switch, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material'
import { Edit, DirectionsCar, Search, Add, Visibility } from '@mui/icons-material'
import { useConductor } from '../../Context/ConductorContext'
import { useAuth } from '../../Context/AuthContext'

const ListarConductor = () => {
  const [conductores, setConductores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [conductorVer, setConductorVer] = useState(null)
  
  const { getConductores, toggleHabilitado } = useConductor()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
    } else {
      setConductores(getConductores())
    }
  }, [usuario, navigate, getConductores])

  const handleToggleHabilitado = (id) => {
    toggleHabilitado(id)
    setConductores(getConductores())
  }

  const getTipoIdentificacionLabel = (tipo) => {
    const tipos = { 'CC': 'Cédula', 'NIT': 'NIT', 'CE': 'Cédula Extranjería', 'TI': 'Tarjeta Identidad', 'PAS': 'Pasaporte', 'RC': 'Registro Civil' }
    return tipos[tipo] || tipo
  }

  const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
  }

  const filteredConductores = conductores.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numeroIdentificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.licenciaConduccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Lista de Conductores</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Gestiona los conductores registrados</Typography>
            </Box>
          </Box>
          <Button component={Link} to="/transporte/conductores/registrar" variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#CC1818', borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)', '&:hover': { backgroundColor: '#b91c1c', boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)' }}}>
            Nuevo Conductor
          </Button>
        </Box>

        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField fullWidth placeholder="Buscar por nombre, identificación o license..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#94a3b8' }} /></InputAdornment>)}} sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#e2e8f0' } }}} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Identificación</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Licencia</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Habilitado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConductores.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}><Typography sx={{ color: '#64748b' }}>No se encontraron conductores</Typography></TableCell></TableRow>
              ) : (
                filteredConductores.map((conductor) => (
                  <TableRow key={conductor.idConductor} sx={{ '&:hover': { backgroundColor: '#f0f5ff' }, '&:last-child td': { borderBottom: 0 }}}>
                    <TableCell>
                      <Box><Chip label={getTipoIdentificacionLabel(conductor.tipoIdentificacion)} size="small" sx={{ fontWeight: 600, backgroundColor: '#fef2f2', color: '#CC1818', mb: 0.5 }} /><Typography sx={{ fontWeight: 600 }}>{conductor.numeroIdentificacion}</Typography></Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{conductor.nombre} {conductor.apellido}</Typography></TableCell>
                    <TableCell>{conductor.telefono}</TableCell>
                    <TableCell>{conductor.email || '-'}</TableCell>
                    <TableCell><Chip label={conductor.licenciaConduccion} size="small" sx={{ fontWeight: 600, backgroundColor: '#fef2f2', color: '#CC1818' }} /></TableCell>
                    <TableCell><Chip label={conductor.fechaVencimientoLicencia ? new Date(conductor.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'} size="small" color={isVencido(conductor.fechaVencimientoLicencia) ? 'error' : 'success'} variant={isVencido(conductor.fechaVencimientoLicencia) ? 'filled' : 'outlined'} /></TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Switch checked={conductor.habilitado !== false} onChange={() => handleToggleHabilitado(conductor.idConductor)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' }}} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => setConductorVer(conductor)} sx={{ color: '#1A2E6E', '&:hover': { backgroundColor: '#e8edff' }}}><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small" component={Link} to={`/transporte/conductores/actualizar/${conductor.idConductor}`} sx={{ color: '#CC1818', '&:hover': { backgroundColor: '#fef2f2' }}}><Edit fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>Total de conductores: <strong>{filteredConductores.length}</strong></Typography>
        </Box>
      </Paper>

      <Dialog open={!!conductorVer} onClose={() => setConductorVer(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1A2E6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DirectionsCar sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} color="#1A2E6E">{conductorVer?.nombre} {conductorVer?.apellido}</Typography>
            <Typography variant="caption" color="#8A94A6">Detalle del conductor</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Tipo ID</Typography><Typography variant="body2" fontWeight={500}>{getTipoIdentificacionLabel(conductorVer?.tipoIdentificacion)}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Número ID</Typography><Typography variant="body2" fontWeight={500}>{conductorVer?.numeroIdentificacion}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Teléfono</Typography><Typography variant="body2" fontWeight={500}>{conductorVer?.telefono}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Ciudad</Typography><Typography variant="body2" fontWeight={500}>{conductorVer?.ciudad || '-'}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Email</Typography><Typography variant="body2" fontWeight={500}>{conductorVer?.email || '-'}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Licencia</Typography><Typography variant="body2" fontWeight={500}>{conductorVer?.licenciaConduccion}</Typography></Box>
            <Box><Typography variant="caption" color="#8A94A6" fontWeight={600}>Vencimiento</Typography><Typography variant="body2" fontWeight={500} color={isVencido(conductorVer?.fechaVencimientoLicencia) ? '#ef4444' : '#2E7D32'}>{conductorVer?.fechaVencimientoLicencia ? new Date(conductorVer.fechaVencimientoLicencia).toLocaleDateString() : 'N/A'}</Typography></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="#8A94A6" fontWeight={600}>Estado</Typography><Typography variant="body2" fontWeight={500} color={conductorVer?.habilitado !== false ? '#2E7D32' : '#ef4444'}>{conductorVer?.habilitado !== false ? 'Activo' : 'Inactivo'}</Typography></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConductorVer(null)} variant="contained" sx={{ backgroundColor: '#1A2E6E', borderRadius: 2, textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ListarConductor