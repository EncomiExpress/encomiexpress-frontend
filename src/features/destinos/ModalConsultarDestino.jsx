import { useTheme } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import * as rutaService from '../../shared/services/rutaService'
import {
    Box, Typography, Paper, Chip, Button, Dialog, IconButton, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { getEstadoColorRuta } from '../../shared/utils/estadoColors.js'

const NacionSVG = ({ color }) => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <g transform="translate(0,512) scale(0.1,-0.1)" fill={color} stroke="none">
            <path d="M2980 5033 c-8 -3 -38 -16 -65 -28 -28 -13 -62 -26 -75 -30 -46 -12
-90 -61 -90 -102 0 -13 -8 -24 -21 -28 -12 -4 -58 -32 -103 -63 l-81 -55 -80
2 c-85 2 -127 -8 -160 -39 -16 -15 -34 -19 -75 -18 -75 2 -107 -17 -221 -132
-70 -70 -99 -106 -104 -130 -4 -19 -14 -44 -21 -56 -8 -11 -16 -45 -18 -75 -5
-59 -20 -109 -34 -109 -13 0 -82 -72 -98 -102 -8 -15 -35 -41 -60 -59 -40 -27
-49 -30 -70 -20 -39 18 -98 13 -127 -9 -58 -46 -92 -139 -76 -210 9 -39 8 -42
-35 -83 -29 -27 -48 -56 -55 -84 -6 -23 -18 -54 -26 -70 -24 -45 -19 -114 10
-157 14 -21 36 -59 50 -85 21 -43 23 -53 13 -85 -9 -28 -9 -48 0 -81 10 -36 9
-50 -4 -82 -15 -35 -15 -45 0 -124 24 -126 23 -191 -4 -229 -35 -50 -38 -110
-6 -169 32 -63 24 -91 -35 -121 -29 -15 -46 -33 -58 -60 -10 -25 -26 -44 -44
-51 -15 -6 -35 -21 -45 -33 -9 -12 -29 -29 -45 -39 -40 -26 -84 -92 -92 -138
-4 -23 -14 -43 -26 -49 -25 -14 -65 -86 -73 -132 -9 -47 13 -101 51 -124 15
-10 58 -46 94 -80 78 -72 142 -118 204 -145 27 -12 51 -31 59 -48 8 -15 31
-42 50 -58 44 -40 187 -75 287 -72 59 2 73 -1 106 -24 60 -40 154 -79 201 -81
61 -3 97 -34 116 -98 21 -71 57 -121 103 -143 63 -30 96 -63 114 -118 10 -30
32 -64 53 -84 20 -19 36 -43 36 -54 0 -48 46 -102 117 -138 33 -17 63 -21 155
-23 107 -3 116 -1 162 25 44 25 53 26 84 16 19 -6 60 -9 91 -6 39 3 63 0 75
-9 18 -13 17 -18 -28 -104 -53 -106 -61 -170 -26 -228 24 -38 75 -72 111 -72
29 0 50 -20 68 -67 28 -70 106 -102 169 -69 40 21 56 51 86 170 23 87 33 161
66 480 6 59 20 152 32 205 23 109 19 188 -11 251 -10 22 -24 63 -31 91 -10 39
-24 64 -61 102 -29 30 -49 60 -49 73 0 21 3 22 35 13 133 -37 240 134 169 272
l-13 26 117 7 c64 3 126 9 138 12 18 5 22 0 28 -37 10 -60 66 -115 129 -124
38 -6 55 -3 94 16 91 46 109 130 60 284 -14 44 -29 103 -33 130 -8 64 -24 102
-59 144 l-29 33 28 50 c24 43 28 58 24 109 -4 49 -11 69 -50 126 -53 78 -68
134 -68 257 0 68 3 86 19 100 10 9 25 38 32 64 7 26 23 63 35 82 72 110 15
246 -120 285 -43 13 -62 13 -97 4 -65 -16 -165 -28 -246 -28 l-71 -1 -42 68
c-71 112 -118 152 -180 152 -17 0 -41 7 -54 15 -36 24 -117 30 -168 13 -25 -8
-53 -11 -68 -7 -14 4 -41 7 -61 8 -27 1 -40 8 -58 31 -20 28 -21 35 -10 67 23
69 15 137 -24 216 -19 40 -41 94 -47 120 -7 26 -25 65 -40 86 -21 28 -25 42
-18 55 5 9 18 60 29 113 25 123 57 182 120 222 32 19 58 46 75 78 24 42 37 52
103 83 122 56 191 134 191 215 0 74 -87 179 -168 203 -40 12 -105 15 -132 5z
m-365 -574 c-14 -27 -37 -100 -50 -160 -18 -82 -34 -126 -65 -177 -44 -75 -50
-117 -23 -163 18 -30 67 -59 101 -59 15 0 21 -9 25 -38 4 -20 21 -60 38 -87
l31 -49 -16 -52 c-32 -101 -18 -186 40 -244 14 -14 35 -40 47 -59 43 -68 61
-74 214 -78 78 -1 152 2 171 8 24 8 37 8 46 0 8 -7 32 -17 54 -24 36 -11 48
-22 94 -97 78 -124 81 -125 306 -124 100 0 182 -2 182 -6 0 -4 -15 -35 -32
-70 -32 -62 -33 -66 -33 -194 0 -171 28 -290 86 -364 18 -23 17 -24 -31 -70
-58 -57 -76 -108 -56 -157 14 -33 59 -75 82 -75 22 0 27 -21 8 -35 -13 -9 -34
-12 -65 -8 -49 6 -105 -15 -116 -43 -5 -13 -30 -15 -167 -12 -146 3 -164 1
-195 -17 -59 -35 -73 -75 -68 -187 3 -53 9 -104 15 -114 8 -14 4 -24 -19 -46
-38 -39 -52 -96 -46 -193 6 -96 25 -147 77 -200 22 -23 43 -57 49 -80 6 -22
17 -49 25 -60 21 -27 20 -65 -4 -176 -11 -52 -20 -105 -20 -118 0 -18 -4 -22
-17 -16 -10 4 -29 10 -43 13 -14 3 -40 18 -57 33 -51 44 -103 56 -156 35 -41
-15 -44 -15 -82 5 -54 27 -102 20 -172 -26 -44 -30 -62 -36 -96 -33 -41 3 -42
4 -47 43 -7 51 -33 90 -70 105 -23 10 -32 23 -44 64 -16 54 -33 75 -90 111
-100 62 -103 65 -117 113 -28 101 -227 253 -313 239 -38 -6 -41 -4 -150 82
-71 55 -124 64 -184 31 -50 -28 -105 -22 -124 15 -18 33 -115 115 -137 115
-23 0 -90 37 -131 72 l-31 28 22 29 c18 25 21 38 16 85 l-5 55 41 6 c62 10
142 68 167 121 11 24 20 48 20 53 0 5 11 23 25 39 14 17 31 45 37 64 6 18 24
47 41 65 50 53 48 170 -4 206 -16 12 -16 17 -3 72 16 70 18 156 4 239 -8 53
-7 63 11 93 17 27 20 43 15 86 -4 28 -6 86 -6 127 1 71 -1 80 -45 164 l-47 88
41 35 c23 19 55 55 72 79 19 28 37 44 50 44 12 0 36 15 55 34 31 31 34 39 34
94 l0 59 56 37 c32 22 66 55 82 81 21 35 34 46 67 54 75 19 121 89 108 165 -3
21 3 59 16 100 11 36 21 71 21 77 0 7 14 25 32 39 32 27 32 27 63 9 38 -24 92
-24 130 -1 17 11 44 45 62 77 l31 58 68 -2 c38 -1 80 2 94 8 14 5 26 10 28 10
1 1 -9 -22 -23 -50z"/>
        </g>
    </svg>
)

const renderEstadoRuta = (estado) => {
    const color = getEstadoColorRuta(estado).color
    if (estado === 'Cancelada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color, lineHeight: 1 }}>−</Box>
    if (estado === 'Completada')
        return <Box component="span" sx={{ flexShrink: 0, width: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color, lineHeight: 1 }}>✓</Box>
    if (estado === 'Programada')
        return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: 'transparent', border: `2px solid ${color}` }} />
    return <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, backgroundColor: color, border: `2px solid ${color}` }} />
}

const CampoFila = ({ label, value, esChip }) => {
    const theme = useTheme()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, py: 0.9 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
            {esChip ? (
                <Chip
                    label={value || '—'}
                    size="small"
                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem' }}
                />
            ) : (
                <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}
                    sx={{ flex: 1, minWidth: 0, textAlign: 'right', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {value ?? '—'}
                </Typography>
            )}
        </Box>
    )
}

const ModalConsultarDestino = ({ destino, onClose }) => {
    const theme = useTheme()
    const [tabIndex, setTabIndex] = useState(0)
    const [tabRutas, setTabRutas] = useState({ data: [], loading: false })

    useEffect(() => {
        if (!destino || tabIndex !== 1) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag antes de fetch, patrón recomendado por React
        setTabRutas({ data: [], loading: true })
        rutaService.getRutas({ idDestino: destino.idDestino, limit: 100 })
            .then(res => setTabRutas({ data: res?.data || [], loading: false }))
            .catch(() => setTabRutas({ data: [], loading: false }))
    }, [destino, tabIndex])

    if (!destino) return null

    const handleClose = () => { setTabIndex(0); onClose() }

    const dotEstado = destino.habilitado
        ? { backgroundColor: 'transparent', border: `2px solid ${theme.palette.status?.activeText}` }
        : { backgroundColor: theme.palette.text.disabled, border: `2px solid ${theme.palette.text.disabled}` }

    return (
        <Dialog open onClose={handleClose} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, position: 'relative', backgroundColor: theme.palette.background.subtle } } }}>

            <IconButton onClick={handleClose} size="small"
                sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary, zIndex: 1 }}>
                <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, backgroundColor: theme.palette.background.paper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 30, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <NacionSVG color={theme.palette.primary.main} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem" color={theme.palette.text.primary}>
                            {destino.ciudad}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary}>{destino.departamento}</Typography>
                    </Box>
                </Box>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Información" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                    <Tab label="Rutas" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BusinessOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Ubicación</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Ciudad y departamento de destino
                            </Typography>
                            <CampoFila label="Ciudad" value={destino.ciudad} />
                            <CampoFila label="Departamento" value={destino.departamento} />
                        </Paper>

                        <Paper elevation={0} sx={{ borderRadius: 2, p: 3, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachMoneyOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.primary }} />
                                <Typography fontWeight={700} fontSize="0.95rem">Tarifa y Estado</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                                Tarifa base y disponibilidad del destino
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Tarifa Base</Typography>
                                <Chip
                                    label={destino.tarifaBase !== undefined ? `$${Number(destino.tarifaBase).toLocaleString('es-CO')}` : '—'}
                                    size="small"
                                    sx={{ fontWeight: 600, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.darker, fontSize: '0.7rem', borderRadius: '2px', height: 26 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.9 }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>Estado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, ...dotEstado }} />
                                    <Typography variant="body2" fontWeight={500} color={theme.palette.text.medium}>
                                        {destino.habilitado ? 'Habilitado' : 'Inhabilitado'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mb: 2 }}>
                        Rutas programadas hacia este destino
                    </Typography>
                    {tabRutas.loading
                        ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                        : tabRutas.data.length === 0
                        ? <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>Sin rutas registradas</Typography>
                        : <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 230, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.background.subtle }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Ruta</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Vehículo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Fecha salida</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tabRutas.data.map(r => (
                                        <TableRow key={r.idRuta}
                                            onClick={() => window.open(`/transporte/rutas?highlight=${r.idRuta}`, '_blank')}
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.background.subtle } }}>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.nombreRuta || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.vehiculo?.placa || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{r.fechaSalida ? new Date(r.fechaSalida).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    {renderEstadoRuta(r.estado)}
                                                    <Typography fontSize="0.82rem" color={theme.palette.text.primary}>{r.estado || '—'}</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 3 }}>
                <Button onClick={handleClose} variant="contained"
                    sx={{ backgroundColor: theme.palette.primary.main, borderRadius: 2, textTransform: 'none',
                        boxShadow: `0 4px 14px ${theme.palette.primary.activeBg}`, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                    Cerrar
                </Button>
            </Box>
        </Dialog>
    )
}

export default ModalConsultarDestino
