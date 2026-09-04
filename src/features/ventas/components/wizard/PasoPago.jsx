import { Box, MenuItem } from '@mui/material'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { validarCampo } from '../../validations/validacion.js'

/** Paso 4 del wizard: método de pago y valores (tarifa auto-calculada pero editable). */
export default function PasoPago({ form, errores, setErrores, handleChange, ventaOriginal }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormSelect label="Método de pago" name="metodoPago" value={form.metodoPago}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, metodoPago: validarCampo('metodoPago', form, ventaOriginal) }))} required
                error={errores.metodoPago} helperText={errores.metodoPago}>
                <MenuItem value="Contraentrega">Contraentrega</MenuItem>
                <MenuItem value="Efectivo">Efectivo</MenuItem>
                <MenuItem value="Transferencia">Transferencia</MenuItem>
            </FormSelect>
            <FormField label="Valor del servicio ($)" name="valorServicio"
                value={formatearMoneda(form.valorServicio)} onChange={handleChange}
                helperText="Tarifa del destino + costo por peso de cada paquete + cantidad × tarifa por paquete (editable)"
                inputProps={{ maxLength: 11 }} />
            <FormField label="Total a pagar ($)" name="total"
                value={formatearMoneda(form.total)} onChange={handleChange} disabled />
        </Box>
    )
}
