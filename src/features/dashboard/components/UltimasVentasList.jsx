import { Box, Paper, Typography } from '@mui/material'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SectionHeader from './SectionHeader.jsx'
import VentaEstadoDot from '../../ventas/components/VentaEstadoDot.jsx'
import { formatFecha } from '../../../shared/utils/formatters.js'
import { formatCOP } from '../utils/dashboardFormatters.js'

// Abre Listar Ventas en una pestaña nueva, saltando directo a la página y fila de
// esa venta -- reutiliza el mecanismo de ?highlight= que ListarVenta ya tiene
// (useEntityCrud + getPageOfEncomienda), el mismo patrón "ir al registro" que ya
// usan todos los modales Consultar/Inhabilitar de la app.
const abrirEnVentas = (idEncomiendaVenta) => {
    window.open(`/ventas/listar?highlight=${idEncomiendaVenta}`, '_blank')
}

const columnaHeader = (theme, flex, texto) => (
    <Typography sx={{
        flex, fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.secondary,
        textTransform: 'uppercase', letterSpacing: 0.4,
    }}>
        {texto}
    </Typography>
)

// Últimas 5 ventas registradas en el período activo -- reemplaza a "Actividad
// Reciente" (esa idea necesitaba el timestamp del último cambio de estado de cada
// paquete, que queda null mientras el paquete no se mueve de "Por entregar" — ver
// Dashboard.jsx). Esto es estático: mismas columnas y mismo criterio de Guía/Destino
// que Listar Ventas (useVentaColumns.jsx), clickeable para abrir la ficha Consultar.
const UltimasVentasList = ({ theme, ultimasVentas }) => (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <SectionHeader
            icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.darker }} />}
            title="Últimas Ventas"
        />
        {ultimasVentas.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    {columnaHeader(theme, 1.1, 'Guía')}
                    {columnaHeader(theme, 1.2, 'Destino')}
                    {columnaHeader(theme, 1.3, 'Estado')}
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        Total
                    </Typography>
                </Box>
                {ultimasVentas.map((venta) => {
                    const guia = venta.paquetes?.[0]?.numeroGuia || '—'
                    const destino = venta.destinatario?.destino?.municipio || '—'
                    return (
                        <Box
                            key={venta.idEncomiendaVenta}
                            onClick={() => abrirEnVentas(venta.idEncomiendaVenta)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, py: 1.1, px: 0.5, mx: -0.5,
                                borderRadius: 1.5, cursor: 'pointer',
                                borderBottom: `1px solid ${theme.palette.background.subtle}`,
                                '&:last-of-type': { borderBottom: 'none' },
                                '&:hover': { backgroundColor: theme.palette.background.subtle },
                            }}
                        >
                            <Box sx={{ minWidth: 0, flex: 1.1 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.palette.primary.main }} noWrap>
                                    {guia}
                                </Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary }}>
                                    {formatFecha(venta.fechaRegistro)}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.78rem', color: theme.palette.text.medium, flex: 1.2, minWidth: 0 }} noWrap>
                                {destino}
                            </Typography>
                            <Box sx={{ flex: 1.3, minWidth: 0 }}>
                                <VentaEstadoDot estado={venta.estado} />
                            </Box>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.palette.text.dark, flexShrink: 0 }}>
                                {formatCOP(venta.total)}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>
        ) : (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
                Sin ventas registradas en este período.
            </Typography>
        )}
    </Paper>
)

export default UltimasVentasList
