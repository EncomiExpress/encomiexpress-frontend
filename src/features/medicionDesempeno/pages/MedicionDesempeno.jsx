import { Box, Typography, Paper, Grid } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { useClientes } from '../../../shared/contexts/ClienteContext'
import { useAnticipos } from '../../../shared/contexts/AnticipoExcedenteContext'

const MedicionDesempeno = () => {
  const { clientes } = useClientes()
  const { anticipos } = useAnticipos()

  const clientesActivos = clientes.filter(c => c.habilitado !== false).length
  const clientesInactivos = clientes.length - clientesActivos
  
  const anticiposEntregados = anticipos.filter(a => a.estado === 'entregado').length
  const anticiposLegalizados = anticipos.filter(a => a.estado === 'legalizado').length
  const anticiposEnLegalizacion = anticipos.filter(a => a.estado === 'en legalización').length
  
  const totalAnticipos = anticipos.reduce((sum, a) => sum + parseFloat(a.valorAnticipo || 0), 0)
  const totalGastado = anticipos.reduce((sum, a) => sum + parseFloat(a.valorGastado || 0), 0)
  const totalExcedentes = anticipos.reduce((sum, a) => sum + parseFloat(a.excedente || 0), 0)

  const encomiendasRegistradas = 156
  const ventasRealizadas = 89

  const IndicatorCard = ({ title, value, subtitle, icon, color }) => (
    <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color || '#2D3748'} sx={{ my: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          backgroundColor: `${color}15`,
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1A2E6E' }}>
        Medición y Desempeño
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard 
            title="Total Clientes" 
            value={clientes.length}
            subtitle={`${clientesActivos} activos, ${clientesInactivos} inactivos`}
            icon={<PeopleIcon sx={{ fontSize: 30, color: '#1A2E6E' }} />}
            color="#1A2E6E"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard 
            title="Encomiendas" 
            value={encomiendasRegistradas}
            subtitle="Registradas este mes"
            icon={<Inventory2Icon sx={{ fontSize: 30, color: '#CC1818' }} />}
            color="#CC1818"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard 
            title="Ventas" 
            value={ventasRealizadas}
            subtitle="Realizadas este mes"
            icon={<PointOfSaleIcon sx={{ fontSize: 30, color: '#2E7D32' }} />}
            color="#2E7D32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <IndicatorCard 
            title="Anticipos" 
            value={anticipos.length}
            subtitle={`${anticiposEntregados} entregados, ${anticiposLegalizados} legalizados`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 30, color: '#F57C00' }} />}
            color="#F57C00"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1A2E6E' }}>
              Valores de Anticipos y Excedentes
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Total Anticipos
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#1A2E6E">
                    ${totalAnticipos.toLocaleString('es-CO')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Total Gastado
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#CC1818">
                    ${totalGastado.toLocaleString('es-CO')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Total Excedentes
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#2E7D32">
                    ${totalExcedentes.toLocaleString('es-CO')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1A2E6E' }}>
              Estado de Anticipos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Entregados</Typography>
                <Typography fontWeight={700}>{anticiposEntregados}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>En Legalización</Typography>
                <Typography fontWeight={700}>{anticiposEnLegalizacion}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Legalizados</Typography>
                <Typography fontWeight={700}>{anticiposLegalizados}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1A2E6E' }}>
              Accesos Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • Ir a Registrar Cliente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Ir a Listar Encomiendas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Ir a Gestionar Anticipos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Ir a Nueva Venta
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MedicionDesempeno


