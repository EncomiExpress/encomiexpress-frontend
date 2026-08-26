import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { getVentaEstadoDot } from '../../../shared/utils/estadoColors.js'
import { getGuiaPrincipal } from '../../../shared/utils/formatters.js'
import EstadoDot from './EstadoDot.jsx'

// Tabla de ventas en conflicto (Guía/Cliente/Estado) que se repite entre
// ModalConfirmarEstado y ModalInhabilitarRuta al listar las ventas que bloquean
// o se ven afectadas por un cambio de estado/inhabilitación de la ruta.
const VentasConflictoTable = ({ theme, ventas, maxHeight = 180 }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Guía</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>Cliente</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle, textAlign: 'right' }}>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ventas.map(v => (
                        <TableRow key={v.idEncomiendaVenta}
                            onClick={() => window.open(`/ventas/listar?highlight=${v.idEncomiendaVenta}`, '_blank')}
                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>
                                {getGuiaPrincipal(v) || `#${v.idEncomiendaVenta}`}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                {v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : '—'}
                            </TableCell>
                            <TableCell sx={{ py: 0.75, textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <EstadoDot {...getVentaEstadoDot(v.estado)} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

export default VentasConflictoTable
