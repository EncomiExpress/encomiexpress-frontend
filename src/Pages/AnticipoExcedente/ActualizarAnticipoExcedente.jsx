import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, Grid, MenuItem, Divider, Chip, IconButton, Tooltip, Dialog, DialogContent, DialogTitle } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ImageIcon from '@mui/icons-material/Image'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAnticipos, conductoresMock, rutasMock } from '../../Context/AnticipoExcedenteContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const ESTADO_COLORS = {
  'entregado':           { bg: '#E3F2FD', color: '#1565C0' },
  'en legalización':     { bg: '#FFF8E1', color: '#F57F17' },
  'legalizado':          { bg: '#E8F5E9', color: '#2E7D32' },
  'excedente pendiente': { bg: '#FFF3E0', color: '#E65100' },
  'cerrado':             { bg: '#F3E5F5', color: '#6A1B9A' },
}

const formatMoney = (val) => {
  const num = parseFloat(val)
  if (isNaN(num)) return '$0'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num)
}

// Vista previa de imagen
const ModalImagen = ({ soporte, onClose }) => {
  if (!soporte) return null
  return (
    <Dialog open onClose={onClose} maxWidth="md" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon sx={{ color: theme.secondary, fontSize: 20 }} />
          <Typography fontWeight={700} color={theme.secondary} fontSize="0.9rem">
            {soporte.nombre}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <img
          src={soporte.url}
          alt={soporte.nombre}
          style={{ width: '100%', display: 'block', maxHeight: '70vh', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
        />
        <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 3 }}>
          <Typography variant="caption" color={theme.textMuted}>
            Subido por: <strong>{soporte.subidoPor}</strong>
          </Typography>
          <Typography variant="caption" color={theme.textMuted}>
            Fecha: <strong>{soporte.fecha}</strong>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

// Tarjeta de soporte (solo lectura)
const TarjetaSoporte = ({ soporte, onVer }) => {
  const esImagen = soporte.tipo === 'image'
  return (
    <Box
      onClick={() => esImagen && onVer(soporte)}
      sx={{
        border: `1px solid ${theme.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        cursor: esImagen ? 'pointer' : 'default',
        '&:hover .soporte-overlay': { opacity: esImagen ? 1 : 0 },
      }}
    >
      {esImagen ? (
        <Box
          component="img"
          src={soporte.url}
          alt={soporte.nombre}
          sx={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', backgroundColor: '#f5f5f5' }}
        />
      ) : (
        <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
          <InsertDriveFileIcon sx={{ fontSize: 40, color: theme.textMuted }} />
        </Box>
      )}

      {/* Overlay zoom */}
      <Box
        className="soporte-overlay"
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s',
        }}
      >
        <Box sx={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%', p: 0.5, display: 'flex' }}>
          <ZoomInIcon sx={{ fontSize: 18, color: theme.secondary }} />
        </Box>
      </Box>

      {/* Chip conductor */}
      <Box sx={{ position: 'absolute', top: 6, left: 6 }}>
        <Chip
          label="Conductor"
          size="small"
          sx={{ fontSize: '0.6rem', height: 17, backgroundColor: 'rgba(26,46,110,0.85)', color: '#fff', fontWeight: 600 }}
        />
      </Box>

      <Box sx={{ px: 1, py: 0.8, backgroundColor: '#fff' }}>
        <Typography variant="caption" color={theme.textMuted} noWrap display="block" fontSize="0.7rem">
          {soporte.nombre}
        </Typography>
        <Typography variant="caption" color={theme.textMuted} fontSize="0.65rem">
          {soporte.fecha}
        </Typography>
      </Box>
    </Box>
  )
}

// Componente principal
const ActualizarAnticipoExcedente = () => {
  const { id } = useParams()
  const { anticipos, actualizarAnticipo } = useAnticipos()
  const navigate = useNavigate()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})
  const [imagenVista, setImagenVista] = useState(null)
  const [form, setForm] = useState(null)

  useEffect(() => {
    const anticipo = anticipos.find(a => a.idAnticipoExcedente === parseInt(id))
    if (anticipo) {
      setForm({ ...anticipo })
    } else {
      navigate('/anticipos/listar')
    }
  }, [id, anticipos, navigate])

  if (!form) return null

  const excedente = parseFloat(form.valorAnticipo || 0) - parseFloat(form.valorGastado || 0)
  const estadoStyle = ESTADO_COLORS[form.estado] || { bg: '#F5F5F5', color: '#757575' }
  const soportes = form.soportes || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.idConductor) e.idConductor = 'Selecciona un conductor'
    if (!form.idRuta) e.idRuta = 'Selecciona una ruta'
    if (!form.valorAnticipo) e.valorAnticipo = 'El valor del anticipo es obligatorio'
    else if (isNaN(form.valorAnticipo) || parseFloat(form.valorAnticipo) <= 0)
      e.valorAnticipo = 'Ingresa un valor válido mayor a 0'
    if (form.valorGastado !== '' && form.valorGastado !== 0 && (isNaN(form.valorGastado) || parseFloat(form.valorGastado) < 0))
      e.valorGastado = 'Ingresa un valor válido'
    if (!form.fechaEntrega) e.fechaEntrega = 'La fecha de entrega es obligatoria'
    if (!form.estado) e.estado = 'Selecciona un estado'
    return e
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }
    actualizarAnticipo(form)
    setExito(true)
    setTimeout(() => navigate('/anticipos/listar'), 1500)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>

        {/* Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #CC1818 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <EditIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700 }}>
              Actualizar Anticipo / Excedente
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>ID: {id}</Typography>
              <Chip
                label={form.estado}
                size="small"
                sx={{
                  fontSize: '0.7rem', fontWeight: 600, height: 20,
                  backgroundColor: estadoStyle.bg,
                  color: estadoStyle.color,
                  textTransform: 'capitalize',
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>

          {/* Asignación */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Asignación
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormSelect
              label="Conductor"
              name="idConductor"
              value={form.idConductor}
              onChange={handleChange}
              error={errores.idConductor}
            >
              {conductoresMock.map(c => (
                <MenuItem key={c.idConductor} value={c.idConductor}>{c.nombre}</MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormSelect
              label="Ruta"
              name="idRuta"
              value={form.idRuta}
              onChange={handleChange}
              error={errores.idRuta}
            >
              {rutasMock.map(r => (
                <MenuItem key={r.idRuta} value={r.idRuta}>{r.idRuta} - {r.nombre}</MenuItem>
              ))}
            </FormSelect>
          </Grid>

          {/* Valores */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Valores
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Valor del anticipo"
              name="valorAnticipo"
              type="number"
              value={form.valorAnticipo}
              onChange={handleChange}
              required
              error={errores.valorAnticipo}
              helperText={errores.valorAnticipo}
              icon={AttachMoneyIcon}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Valor gastado"
              name="valorGastado"
              type="number"
              value={form.valorGastado}
              onChange={handleChange}
              error={errores.valorGastado}
              helperText={errores.valorGastado || 'Completar al legalizar'}
              icon={AttachMoneyIcon}
            />
          </Grid>

          {/* Tarjeta excedente */}
          <Grid item xs={12}>
            <Box sx={{
              p: 2, borderRadius: 2,
              backgroundColor: excedente >= 0 ? '#E8F5E9' : '#FFF3F3',
              border: `1px solid ${excedente >= 0 ? '#A5D6A7' : '#FFCDD2'}`,
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <AttachMoneyIcon sx={{ color: excedente >= 0 ? '#2E7D32' : theme.primary }} />
              <Box>
                <Typography variant="caption" fontWeight={700}
                  color={excedente >= 0 ? '#2E7D32' : theme.primary}
                  textTransform="uppercase" letterSpacing={0.8}>
                  {excedente >= 0 ? 'Excedente a devolver' : 'Faltante (gasto mayor al anticipo)'}
                </Typography>
                <Typography variant="h6" fontWeight={800} color={excedente >= 0 ? '#2E7D32' : theme.primary}>
                  {formatMoney(Math.abs(excedente))}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Estado y fechas */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Estado y fechas
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormSelect
              label="Estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              error={errores.estado}
            >
              <MenuItem value="entregado">Entregado</MenuItem>
              <MenuItem value="en legalización">En legalización</MenuItem>
              <MenuItem value="legalizado">Legalizado</MenuItem>
              <MenuItem value="excedente pendiente">Excedente pendiente</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
            </FormSelect>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Fecha de entrega"
              name="fechaEntrega"
              type="date"
              value={form.fechaEntrega}
              onChange={handleChange}
              error={errores.fechaEntrega}
              helperText={errores.fechaEntrega}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Fecha de legalización"
              name="fechaLegalizacion"
              type="date"
              value={form.fechaLegalizacion}
              onChange={handleChange}
              helperText="Opcional"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Fecha entrega excedente"
              name="fechaEntregaExcedente"
              type="date"
              value={form.fechaEntregaExcedente}
              onChange={handleChange}
              helperText="Opcional"
            />
          </Grid>

          <Grid item xs={12}>
            <FormField
              label="Observaciones"
              name="observaciones"
              value={form.observaciones || ''}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {/* Soportes (solo lectura) */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Soportes de pago
                </Typography>
                <Typography variant="caption" display="block" color={theme.textMuted} sx={{ mt: 0.3 }}>
                  Archivos subidos por el conductor desde la app móvil
                </Typography>
              </Box>
              <Chip
                label={`${soportes.length} archivo${soportes.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  fontSize: '0.72rem', fontWeight: 600,
                  backgroundColor: soportes.length > 0 ? '#E8F5E9' : '#F5F5F5',
                  color: soportes.length > 0 ? '#2E7D32' : theme.textMuted,
                }}
              />
            </Box>
            <Divider sx={{ mt: 0.5, mb: 2 }} />

            {soportes.length === 0 ? (
              /* Estado vacío */
              <Box sx={{
                py: 3, px: 2, textAlign: 'center',
                backgroundColor: '#FAFAFA',
                border: `1px dashed ${theme.border}`,
                borderRadius: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
              }}>
                <ImageIcon sx={{ color: theme.textMuted, fontSize: 32, opacity: 0.5 }} />
                <Typography variant="body2" color={theme.textMuted} fontWeight={500}>
                  El conductor aún no ha subido soportes
                </Typography>
                <Typography variant="caption" color={theme.textMuted}>
                  Los soportes se cargan desde la app móvil del conductor
                </Typography>
              </Box>
            ) : (
              <>
                {/* Aviso solo lectura */}
                <Box sx={{
                  mb: 1.5, px: 1.5, py: 1,
                  backgroundColor: '#EEF2FF',
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: theme.secondary }} />
                  <Typography variant="caption" color={theme.secondary} fontWeight={500}>
                    Estos archivos fueron subidos por el conductor. Solo puedes visualizarlos.
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
                  {soportes.map(s => (
                    <TarjetaSoporte key={s.id} soporte={s} onVer={setImagenVista} />
                  ))}
                </Box>
              </>
            )}
          </Grid>

        </Grid>

        {/* Botones */}
        <FormButtonGroup>
          <SecondaryButton 
            onClick={() => navigate('/anticipos/listar')}
            children="Cancelar"
          />
          <PrimaryButton 
            onClick={handleSubmit}
            children="Guardar cambios"
          />
        </FormButtonGroup>

      </Paper>

      <ModalImagen soporte={imagenVista} onClose={() => setImagenVista(null)} />
    </Box>
  )
}

export default ActualizarAnticipoExcedente
