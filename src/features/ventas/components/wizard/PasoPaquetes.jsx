import { Box, Typography, IconButton, Button, MenuItem, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { validarCampoPaquete, MAX_PAQUETES } from '../../validations/validacion.js'
import { calcularPesoEfectivo, calcularCostoPeso } from '../../validations/ventaValidation.js'

/** Paso 2 del wizard: uno o varios paquetes (contenido, dimensiones, peso, tipo de carga). */
export default function PasoPaquetes({
    theme, form, errores, handlePaqueteChange, setErrorPaquete, handleAgregarPaquete, handleQuitarPaquete,
    tarifaPorKgHierro, tarifaPorKgNormal,
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
                            helperText={errPaquete.descripcionContenido || `${(paquete.descripcionContenido || '').length}/300`}
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
                            <FormSelect label="Tipo de carga" name="tipoCarga" value={paquete.tipoCarga}
                                onChange={(e) => handlePaqueteChange(index, 'tipoCarga', e.target.value)}
                                onBlur={() => setErrorPaquete(index, 'tipoCarga', validarCampoPaquete('tipoCarga', paquete))}
                                required error={errPaquete.tipoCarga}
                                helperText={errPaquete.tipoCarga || 'Define la tarifa por kg aplicable'}>
                                <MenuItem value="hierro">Hierro (metal pesado)</MenuItem>
                                <MenuItem value="normal">Paquete normal</MenuItem>
                            </FormSelect>
                        </Box>
                        {paquete.peso && paquete.alto && paquete.ancho && paquete.profundidad && (() => {
                            const { pesoReal, pesoVolumetrico, pesoEfectivo, gana } = calcularPesoEfectivo(paquete)
                            const costoPeso = calcularCostoPeso(paquete, tarifaPorKgHierro, tarifaPorKgNormal)
                            return (
                                <Alert severity={gana === 'volumetrico' ? 'warning' : 'info'}
                                    icon={<ScaleOutlinedIcon fontSize="small" />} sx={{ borderRadius: 2 }}>
                                    Peso real: <strong>{pesoReal} kg</strong> · Peso volumétrico: <strong>{pesoVolumetrico.toFixed(2)} kg</strong>
                                    {' — se factura por '}<strong>{gana === 'volumetrico' ? 'peso volumétrico' : 'peso real'}</strong>
                                    {` (${pesoEfectivo.toFixed(2)} kg) → costo por peso: `}<strong>${Math.round(costoPeso).toLocaleString('es-CO')}</strong>
                                </Alert>
                            )
                        })()}
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
