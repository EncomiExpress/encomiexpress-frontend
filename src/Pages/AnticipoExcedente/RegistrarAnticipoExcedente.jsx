import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Paper, MenuItem,
  Snackbar, Alert, InputAdornment, Select, FormControl, InputLabel
} from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PersonIcon from '@mui/icons-material/Person'
import RouteIcon from '@mui/icons-material/Route'
import EventIcon from '@mui/icons-material/Event'
import NotesIcon from '@mui/icons-material/Notes'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'

const theme = {
  primary: '#CC1818',
  secondary: '#1A2E6E'
}

const RegistrarAnticipoExcedente = () => {
  const { agregarAnticipo } = useAnticipos()
  const navigate = useNavigate()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    idConductor: '',
    idRuta: '',
    valorAnticipo: '',
    valorGastado: '',
    estado: 'entregado',
    soporte: '',
    fechaEntrega: '',
    fechaLegalizacion: '',
    fechaEntregaExcedente: '',
  })

  // Calcula el excedente en tiempo real
  const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}

    if (!form.idConductor)
      e.idConductor = 'Selecciona un conductor'

    if (!form.idRuta)
      e.idRuta = 'Selecciona una ruta'

    if (!form.valorAnticipo)
      e.valorAnticipo = 'El valor del anticipo es obligatorio'
    else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
      e.valorAnticipo = 'Ingresa un valor válido mayor a 0'

    if (form.valorGastado !== '' && (isNaN(form.valorGastado) || parseFloat(form.valorGastado) < 0))
      e.valorGastado = 'Ingresa un valor válido'

    if (!form.fechaEntrega)
      e.fechaEntrega = 'La fecha de entrega es obligatoria'

    if (!form.estado)
      e.estado = 'Selecciona un estado'

    return e
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()

    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    agregarAnticipo(form)
    setExito(true)
    setTimeout(() => navigate('/anticipos/listar'), 1500)
  }

  const handleCancelar = () => {
    navigate('/anticipos/listar')
  }

  const formatMoney = (val) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '$0'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        
        {/* Título con icono */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)'
          }}>
            <AccountBalanceWalletIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700 }}>
              Registrar Anticipo / Excedente
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Ingresa los datos del anticipo para el conductor
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* ── Sección: Asignación ──*/}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Conductor */}
            <FormControl fullWidth error={!!errores.idConductor} sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Conductor</InputLabel>
              <Select
                name="idConductor"
                value={form.idConductor}
                label="Conductor"
                onChange={handleChange}
              >
                {conductoresMock.map(c => (
                  <MenuItem key={c.idConductor} value={c.idConductor}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ruta */}
            <FormControl fullWidth error={!!errores.idRuta} sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Ruta</InputLabel>
              <Select
                name="idRuta"
                value={form.idRuta}
                label="Ruta"
                onChange={handleChange}
              >
                {rutasMock.map(r => (
                  <MenuItem key={r.idRuta} value={r.idRuta}>
                    {r.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Valor del anticipo */}
            <TextField
              label="Valor del anticipo"
              name="valorAnticipo"
              value={form.valorAnticipo}
              onChange={handleChange}
              fullWidth
              type="number"
              placeholder="Ej: 500000"
              error={!!errores.valorAnticipo}
              helperText={errores.valorAnticipo}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Valor gastado */}
            <TextField
              label="Valor gastado"
              name="valorGastado"
              value={form.valorGastado}
              onChange={handleChange}
              fullWidth
              type="number"
              placeholder="Ej: 350000"
              error={!!errores.valorGastado}
              helperText={errores.valorGastado || 'Diligenciar al legalizar'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Tarjeta de excedente calculado */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: excedente >= 0 ? '#E8F5E9' : '#FFF3F3',
                border: `1px solid ${excedente >= 0 ? '#A5D6A7' : '#FFCDD2'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : theme.primary, fontSize: 32 }} />
              <Box>
                <Typography variant="caption" fontWeight={700} color={excedente >= 0 ? '#2E7D32' : theme.primary} textTransform="uppercase" letterSpacing={0.8}>
                  {excedente >= 0 ? 'Excedente a devolver' : 'Faltante (gasto mayor al anticipo)'}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={excedente >= 0 ? '#2E7D32' : theme.primary}>
                  {formatMoney(Math.abs(excedente))}
                </Typography>
              </Box>
            </Box>

            {/* Estado */}
            <FormControl fullWidth error={!!errores.estado} sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#CC1818' },
                '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
              },
            }}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#CC1818' } }}>Estado</InputLabel>
              <Select
                name="estado"
                value={form.estado}
                label="Estado"
                onChange={handleChange}
              >
                <MenuItem value="entregado">Entregado</MenuItem>
                <MenuItem value="en legalización">En legalización</MenuItem>
                <MenuItem value="legalizado">Legalizado</MenuItem>
                <MenuItem value="excedente pendiente">Excedente pendiente</MenuItem>
                <MenuItem value="cerrado">Cerrado</MenuItem>
              </Select>
            </FormControl>

            {/* Fecha de entrega */}
            <TextField
              label="Fecha de entrega"
              name="fechaEntrega"
              value={form.fechaEntrega}
              onChange={handleChange}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              error={!!errores.fechaEntrega}
              helperText={errores.fechaEntrega}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EventIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Fecha de legalización */}
            <TextField
              label="Fecha de legalización"
              name="fechaLegalizacion"
              value={form.fechaLegalizacion}
              onChange={handleChange}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              helperText="Opcional — completar al legalizar"
              InputProps={{
                startAdornment: <InputAdornment position="start"><EventIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Fecha entrega excedente */}
            <TextField
              label="Fecha entrega excedente"
              name="fechaEntregaExcedente"
              value={form.fechaEntregaExcedente}
              onChange={handleChange}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              helperText="Opcional — completar al entregar excedente"
              InputProps={{
                startAdornment: <InputAdornment position="start"><EventIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

            {/* Observaciones */}
            <TextField
              label="Observaciones"
              name="soporte"
              value={form.soporte}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Agrega alguna observación si es necesario..."
              InputProps={{
                startAdornment: <InputAdornment position="start"><NotesIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#CC1818' },
                  '&.Mui-focused fieldset': { borderColor: '#CC1818', borderWidth: 2 },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#CC1818' },
              }}
            />

          </Box>

        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancelar}
            sx={{ 
              borderColor: '#e2e8f0',
              color: '#64748b',
              borderRadius: 2,
              py: 1.5,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc'
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            sx={{ 
              backgroundColor: '#CC1818',
              borderRadius: 2,
              py: 1.5,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(204, 24, 24, 0.3)',
              '&:hover': { 
                backgroundColor: '#b91c1c',
                boxShadow: '0 6px 20px rgba(204, 24, 24, 0.4)'
              },
            }}
          >
            Registrar anticipo
          </Button>
        </Box>

      </Paper>

      <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontWeight: 600, borderRadius: 2 }}>
          ¡Anticipo registrado exitosamente!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RegistrarAnticipoExcedente
