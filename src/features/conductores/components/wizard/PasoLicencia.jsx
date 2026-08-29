import { Box, Typography, MenuItem, Button, IconButton } from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import CloseIcon from '@mui/icons-material/Close'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { CATEGORIAS_LICENCIA, validarCategorias } from '../../validations/conductorValidation.js'

const PasoLicencia = ({
    theme, form, errores, setErrores, handleChange,
    handleCategoriaChange, handleAgregarCategoria, handleQuitarCategoria, verificarLicenciaDuplicada,
    validationOpts, numeroLicenciaHelperText, minVencimiento,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormField label="N° de Licencia" name="numeroLicencia" value={form.numeroLicencia}
            onChange={handleChange} onBlur={verificarLicenciaDuplicada} icon={BadgeOutlinedIcon}
            error={errores.numeroLicencia}
            inputProps={{ maxLength: 20 }} placeholder="Ej: 123456789"
            helperText={errores.numeroLicencia || numeroLicenciaHelperText} />

        <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
            Categorías de licencia
        </Typography>
        {errores.categoriasLicencia && (
            <Typography variant="caption" color="error" sx={{ mt: -1.5 }}>{errores.categoriasLicencia}</Typography>
        )}

        {form.categoriasLicencia.map((cat, index) => {
            const categoriasUsadas = form.categoriasLicencia
                .filter((_, i) => i !== index)
                .map(c => c.categoria)
            return (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1.5, alignItems: 'center' }}>
                    <FormSelect label="Categoría" value={cat.categoria}
                        onChange={(e) => handleCategoriaChange(index, 'categoria', e.target.value)}>
                        {CATEGORIAS_LICENCIA.filter(c => !categoriasUsadas.includes(c.value)).map(c => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </FormSelect>
                    <FormField label="Vencimiento" type="date" value={cat.vencimiento}
                        onChange={(e) => handleCategoriaChange(index, 'vencimiento', e.target.value)}
                        onBlur={() => setErrores(prev => ({ ...prev, categoriasLicencia: validarCategorias(form.categoriasLicencia, validationOpts) }))}
                        icon={EventOutlinedIcon} InputLabelProps={{ shrink: true }}
                        inputProps={minVencimiento ? { min: minVencimiento } : undefined} />
                    <IconButton onClick={() => handleQuitarCategoria(index)}
                        disabled={form.categoriasLicencia.length === 1}
                        sx={{ visibility: form.categoriasLicencia.length === 1 ? 'hidden' : 'visible' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        })}

        <Button
            onClick={handleAgregarCategoria}
            startIcon={<AddOutlinedIcon />}
            disabled={form.categoriasLicencia.length >= CATEGORIAS_LICENCIA.length}
            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
        >
            Agregar categoría
        </Button>
    </Box>
)

export default PasoLicencia
