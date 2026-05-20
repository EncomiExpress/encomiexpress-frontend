import { Box, Typography, Paper, Grid } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { useClientes } from '../../Context/ClienteContext'
import { useAnticipos } from '../../Context/AnticipoExcedenteContext'
  import { useVentas } from '../../Context/VentaContext'

const Dashboard = () => {
  const { clientes } = useClientes()
  const { anticipos } = useAnticipos()
  const { ventas } = useVentas()

  // Clientes
  const clientesActivos = clientes.filter(c => c.habilitado !== false).length
  const clientesInactivos = clientes.length - clientesActivos

  // Anticipos
  const anticiposEntregados = anticipos.filter(a => a.estado === 'entregado').length
  const anticiposLegalizados = anticipos.filter(a => a.estado === 'legalizado').length
  const anticiposEnLegalizacion = anticipos.filter(a => a.estado === 'en legalización').length

  const totalAnticipos = anticipos.reduce((sum, a) => sum + parseFloat(a.valorAnticipo || 0), 0)
  const totalGastado = anticipos.reduce((sum, a) => sum + parseFloat(a.valorGastado || 0), 0)
  const totalExcedentes = anticipos.reduce((sum, a) => sum + parseFloat(a.excedente || 0), 0)

  // Encomiendas y Ventas — datos reales desde el contexto
  const ahora = new Date()
  const mesActual = ahora.getMonth()
  const anioActual = ahora.getFullYear()

  const encomiendasEsteMes = ventas.filter(v => {
    const fecha = new Date(v.createdAt || v.fechaRegistro || null)
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
  }).length

  const ventasRealizadas = ventas.filter(v => v.estado === 'entregado').length

  const IndicatorCard = ({ title, value, subtitle, icon, color }) => (
    <Paper sx={{ p: 2.5, height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: color || '#1f2937', fontSize: '2rem' }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: `${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header del Dashboard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Bienvenido al panel de control de EncomiExpress
        </Typography>
      </Box>

      {/* Indicadores principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard
            title="Total Clientes"
            value={clientes.length}
            subtitle={`${clientesActivos} activos, ${clientesInactivos} inactivos`}
            icon={<PeopleIcon sx={{ fontSize: 32, color: '#1A2E6E' }} />}
            color="#1A2E6E"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard
            title="Encomiendas"
            value={encomiendasEsteMes}
            subtitle="Registradas este mes"
            icon={<Inventory2Icon sx={{ fontSize: 32, color: '#CC1818' }} />}
            color="#CC1818"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard
            title="Ventas"
            value={ventasRealizadas}
            subtitle="Realizadas este mes"
            icon={<PointOfSaleIcon sx={{ fontSize: 32, color: '#059669' }} />}
            color="#059669"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard
            title="Anticipos"
            value={anticipos.length}
            subtitle={`${anticiposEntregados} entregados, ${anticiposLegalizados} legalizados`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#dc2626' }} />}
            color="#dc2626"
          />
        </Grid>
      </Grid>

      {/* Sección de Métricas */}
      <Paper sx={{ p: 3.5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#CC181810' }}>
            <TrendingUpIcon sx={{ color: '#CC1818', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>
            Medición y Desempeño
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f8fafc', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: '#6b7280', fontSize: '0.7rem' }}>
                Total Anticipos
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1A2E6E', mt: 1 }}>
                ${totalAnticipos.toLocaleString('es-CO')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f8fafc', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: '#6b7280', fontSize: '0.7rem' }}>
                Total Gastado
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#CC1818', mt: 1 }}>
                ${totalGastado.toLocaleString('es-CO')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f8fafc', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: '#6b7280', fontSize: '0.7rem' }}>
                Total Excedentes
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#059669', mt: 1 }}>
                ${totalExcedentes.toLocaleString('es-CO')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Estado de Anticipos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: '#1f2937' }}>
              Estado de Anticipos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  <Typography sx={{ color: '#166534', fontWeight: 500 }}>Entregados</Typography>
                </Box>
                <Typography sx={{ color: '#166534', fontWeight: 700, fontSize: '1.1rem' }}>{anticiposEntregados}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <Typography sx={{ color: '#92400e', fontWeight: 500 }}>En Legalización</Typography>
                </Box>
                <Typography sx={{ color: '#92400e', fontWeight: 700, fontSize: '1.1rem' }}>{anticiposEnLegalizacion}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#dbeafe', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  <Typography sx={{ color: '#1e40af', fontWeight: 500 }}>Legalizados</Typography>
                </Box>
                <Typography sx={{ color: '#1e40af', fontWeight: 700, fontSize: '1.1rem' }}>{anticiposLegalizados}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: '#1f2937' }}>
              Accesos Rápidos
            </Typography>
            <Grid container spacing={2}>
              {[
                { icon: '👥', text: 'Registrar Cliente', color: '#1A2E6E' },
                { icon: '📋', text: 'Listar Clientes', color: '#1A2E6E' },
                { icon: '📦', text: 'Registrar Encomienda', color: '#CC1818' },
                { icon: '💰', text: 'Nuevo Anticipo', color: '#dc2626' },
              ].map((item, i) => (
                <Grid item xs={6} key={i}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      borderColor: item.color,
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                    <Typography sx={{ color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>{item.text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard