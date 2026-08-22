import { Box, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { validarCampoPaquete, MAX_PAQUETES } from './validacion.js'

/** Paso 2 del wizard: uno o varios paquetes (contenido, dimensiones, peso, valor declarado). */
export default function PasoPaquetes({
    theme, form, errores, handlePaqueteChange, setErrorPaquete, handleAgregarPaquete, handleQuitarPaquete,
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {form.paquetes.map((paquete, index) => {
                const errPaquete = errores.paquetes?.[index] || {}
                return (
                    <Box key={index} sx={{
                        display: 'flex', flexDirection: 'column', gap: 2.5,
                        ...(form.paquetes.length > 1 ? { p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } : {}),
                    }}>
                        {form.paquetes.length > 1 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" fontWeight={700} color={theme.palette.text.primary}>
                                    Paquete {index + 1}
                                </Typography>
                                <IconButton onClick={() => handleQuitarPaquete(index)}
                                    disabled={form.paquetes.length === 1}
                                    sx={{ visibility: form.paquetes.length === 1 ? 'hidden' : 'visible' }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                        <FormField label="Descripción del contenido" name="descripcionContenido" value={paquete.descripcionContenido}
                            onChange={(e) => handlePaqueteChange(index, 'descripcionContenido', e.target.value)}
                            onBlur={() => setErrorPaquete(index, 'descripcionContenido', validarCampoPaquete('descripcionContenido', paquete))}
                            required error={errPaquete.descripcionContenido}
                            helperText={errPaquete.descripcionContenido || `${paquete.descripcionContenido.length}/300`}
                            multiline rows={2} inputProps={{ maxLength: 300 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
                            <FormField label="Peso (kg)" name="peso" value={paquete.peso}
                                onChange={(e) => handlePaqueteChange(index, 'peso', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'peso', validarCampoPaquete('peso', paquete))}
                                required error={errPaquete.peso}
                                placeholder="Ej: 1.5" helperText={errPaquete.peso || 'Ej: 1.5'}
                                inputProps={{ maxLength: 7 }} />
                            <FormField label="Alto (cm)" name="alto" value={paquete.alto}
                                onChange={(e) => handlePaqueteChange(index, 'alto', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'alto', validarCampoPaquete('alto', paquete))}
                                required error={errPaquete.alto}
                                placeholder="Ej: 30" helperText={errPaquete.alto || 'Ej: 30'}
                                inputProps={{ maxLength: 4 }} />
                            <FormField label="Ancho (cm)" name="ancho" value={paquete.ancho}
                                onChange={(e) => handlePaqueteChange(index, 'ancho', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'ancho', validarCampoPaquete('ancho', paquete))}
                                required error={errPaquete.ancho}
                                placeholder="Ej: 20" helperText={errPaquete.ancho || 'Ej: 20'}
                                inputProps={{ maxLength: 4 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <FormField label="Profundidad (cm)" name="profundidad" value={paquete.profundidad}
                                onChange={(e) => handlePaqueteChange(index, 'profundidad', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'profundidad', validarCampoPaquete('profundidad', paquete))}
                                required error={errPaquete.profundidad}
                                placeholder="Ej: 15" helperText={errPaquete.profundidad || 'Ej: 15'}
                                inputProps={{ maxLength: 4 }} />
                            <FormField label="Valor declarado ($)" name="valorDeclarado" value={formatearMoneda(paquete.valorDeclarado)}
                                onChange={(e) => handlePaqueteChange(index, 'valorDeclarado', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'valorDeclarado', validarCampoPaquete('valorDeclarado', paquete))}
                                helperText={errPaquete.valorDeclarado || 'Opcional'}
                                placeholder="Ej: 50.000" error={errPaquete.valorDeclarado}
                                inputProps={{ maxLength: 11 }} />
                        </Box>
                    </Box>
                )
            })}
            <Button
                onClick={handleAgregarPaquete}
                startIcon={<AddOutlinedIcon />}
                disabled={form.paquetes.length >= MAX_PAQUETES}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
            >
                Agregar paquete
            </Button>
        </Box>
    )
}
