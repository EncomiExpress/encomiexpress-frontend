import { Box, Typography, Paper, FormControlLabel, Checkbox } from '@mui/material'
import { Security } from '@mui/icons-material'
import { getPermisoLabel } from '../validations/rolValidation.js'

const PermisosGrid = ({ theme, modulos, permisos, errorPermisos, toggleModulo, togglePermiso }) => (
    <>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Permisos del Rol
            </Typography>
            {errorPermisos && (
                <Typography variant="caption" fontWeight={600} color={theme.palette.error.main}>
                    {errorPermisos}
                </Typography>
            )}
        </Box>

        <Box sx={{
            flex: 1, overflowY: 'auto', pr: 1,
            display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, alignContent: 'start',
            ...(errorPermisos ? { border: `1px solid ${theme.palette.error.main}`, borderRadius: 2, p: 1 } : {}),
        }}>
            {modulos.map(([moduloKey, modulo]) => (
                <Paper
                    key={moduloKey}
                    elevation={0}
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.muted
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.muted
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Security sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                                {modulo.nombre}
                            </Typography>
                        </Box>
                        <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                                <Checkbox
                                    checked={modulo.permisos.every(p => permisos.includes(p))}
                                    indeterminate={
                                        modulo.permisos.filter(p => permisos.includes(p)).length > 0 &&
                                        modulo.permisos.some(p => !permisos.includes(p))
                                    }
                                    onChange={() => {
                                        const todosSeleccionados = modulo.permisos.every(p => permisos.includes(p))
                                        toggleModulo(modulo, todosSeleccionados)
                                    }}
                                    sx={{
                                        color: theme.palette.primary.main,
                                        '&.Mui-checked': { color: theme.palette.primary.main },
                                        '&.MuiCheckbox-indeterminate': { color: theme.palette.primary.main }
                                    }}
                                />
                            }
                            label={`${modulo.permisos.filter(p => permisos.includes(p)).length}/${modulo.permisos.length}`}
                        />
                    </Box>

                    <Box sx={{ p: 1.5, backgroundColor: theme.palette.background.paper, display: 'flex', flexWrap: 'nowrap', gap: 0.75, overflowX: 'auto' }}>
                        {modulo.permisos.map((permiso) => {
                            const marcado = permisos.includes(permiso)
                            return (
                                <FormControlLabel
                                    key={permiso}
                                    control={
                                        <Checkbox
                                            checked={marcado}
                                            onChange={(e) => togglePermiso(modulo, permiso, e.target.checked)}
                                            size="small"
                                            sx={{
                                                p: 0.25, mr: 0.5,
                                                color: theme.palette.primary.main,
                                                '&.Mui-checked': { color: theme.palette.primary.main },
                                                '& .MuiSvgIcon-root': { fontSize: 16 },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: marcado ? theme.palette.primary.dark : theme.palette.text.secondary }}>
                                            {getPermisoLabel(permiso)}
                                        </Typography>
                                    }
                                    sx={{
                                        m: 0, pl: 0.5, pr: 1.25, py: 0.25, flexShrink: 0,
                                        borderRadius: 999,
                                        border: `1px solid ${marcado ? theme.palette.primary.main : theme.palette.divider}`,
                                        backgroundColor: marcado ? theme.palette.primary.activeBg : theme.palette.background.muted,
                                        '&:hover': { backgroundColor: marcado ? theme.palette.primary.activeBg : theme.palette.background.subtle },
                                    }}
                                />
                            )
                        })}
                    </Box>
                </Paper>
            ))}
        </Box>
    </>
)

export default PermisosGrid
