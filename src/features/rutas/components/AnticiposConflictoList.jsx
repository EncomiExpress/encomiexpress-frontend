import { Box, Paper, Typography } from '@mui/material'
import { getAnticipoEstadoDot } from '../../../shared/utils/estadoColors.js'
import EstadoDot from './EstadoDot.jsx'

const labelAnticipo = (a) => [
    a.valorAnticipo ? `$${Number(a.valorAnticipo).toLocaleString('es-CO')}` : null,
    a.fechaEntrega ? new Date(a.fechaEntrega + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
].filter(Boolean).join(' · ') || 'Anticipo'

// Lista de anticipos en conflicto (Paper con una fila por anticipo: etiqueta + punto
// de estado) que se repite entre ModalConfirmarEstado y ModalInhabilitarRuta.
const AnticiposConflictoList = ({ theme, anticipos }) => (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        {anticipos.map((a, i) => (
            <Box key={a.idAnticipoExcedente}
                onClick={() => window.open(`/anticipos/listar?highlight=${a.idAnticipoExcedente}`, '_blank')}
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1,
                    borderBottom: i < anticipos.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover },
                }}>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                    {labelAnticipo(a)}
                </Typography>
                <EstadoDot {...getAnticipoEstadoDot(a.estado)} />
            </Box>
        ))}
    </Paper>
)

export default AnticiposConflictoList
