import { Box, MenuItem, Tooltip, IconButton } from '@mui/material'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { validarCampo } from '../../validations/validacion.js'

/** Paso 4 del wizard: método de pago y valores (tarifa auto-calculada pero editable). */
export default function PasoPago({ form, errores, setErrores, handleChange, ventaOriginal, handleResetearTotal, totalEditadoManualmente }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect label="Modalidad de recaudo" name="modalidadRecaudo" value={form.modalidadRecaudo}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, modalidadRecaudo: validarCampo('modalidadRecaudo', form, ventaOriginal) }))} required
                error={errores.modalidadRecaudo}
                helperText={errores.modalidadRecaudo || (form.modalidadRecaudo === 'Contraentrega'
                    ? 'El pago se resuelve por paquete cuando el distribuidor legaliza la entrega final.'
                    : form.modalidadRecaudo === 'Pago Inmediato'
                        ? 'El remitente paga al registrar la venta.'
                        : undefined)}>
                <MenuItem value="Pago Inmediato">Pago Inmediato</MenuItem>
                <MenuItem value="Contraentrega">Contraentrega</MenuItem>
            </FormSelect>
            <FormField label="Total a pagar ($)" name="total"
                value={formatearMoneda(form.total)} onChange={handleChange}
                helperText="Tarifa del destino + costo por peso de cada paquete + cantidad × tarifa por paquete (editable)"
                inputProps={{ maxLength: 9 }}
                endAdornment={totalEditadoManualmente && (
                    <Tooltip title="Volver a poner el valor calculado por el sistema">
                        <IconButton onClick={handleResetearTotal} edge="end" size="small">
                            <RestartAltOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )} />
        </Box>
    )
}
