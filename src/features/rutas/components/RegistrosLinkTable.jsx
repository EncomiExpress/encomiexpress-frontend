import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

// Tabla de registros enlazados con navegación a otro módulo vía `?highlight=id`.
// Usada por el diálogo de alerta de bloqueo de ListarRutaProgramacion; el mismo
// patrón se repite en ModalConsultarRutaProgramacion, ModalConfirmarEstado y
// ModalInhabilitarRuta (Etapa 8 lo consolida ahí también).
const RegistrosLinkTable = ({ theme, items, columnLabel, basePath, idParam = 'highlight', maxHeight = 220 }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.75, backgroundColor: theme.palette.background.subtle }}>
                            {columnLabel}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}
                            onClick={() => item.id && window.open(`${basePath}?${idParam}=${item.id}`, '_blank')}
                            sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: theme.palette.action.hover } }}>
                            <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, py: 0.75 }}>{item.label}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)

export default RegistrosLinkTable
