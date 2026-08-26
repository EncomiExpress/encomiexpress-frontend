import { Box, Typography, MenuItem } from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { FormField, FormSelect } from '../../../../shared/components/FormularioEstandarizado.jsx'
import {
    departamentos, CIUDADES_POR_DEPARTAMENTO, OTRA_CIUDAD, OTRO_DEPARTAMENTO,
    validarCampo,
} from '../../utils/destinoValidation.js'

const PasoUbicacion = ({
    theme, form, setForm, errores, setErrores, handleChange,
    handleDepartamentoSelectChange, handleCiudadSelectChange, validarCiudadDup,
    ciudadOtra, setCiudadOtra, departamentoOtro, setDepartamentoOtro,
}) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        {departamentoOtro ? (
            <Box>
                <FormField
                    label="Departamento" name="departamento" value={form.departamento} onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                    required error={errores.departamento} helperText={errores.departamento || 'Departamento nuevo — no está en la lista todavía'}
                    inputProps={{ maxLength: 60 }}
                    placeholder="Escribe el departamento"
                />
                <Typography
                    onClick={() => { setDepartamentoOtro(false); setCiudadOtra(false); setForm(prev => ({ ...prev, departamento: '', ciudad: '' })) }}
                    sx={{ fontSize: '0.75rem', color: theme.palette.primary.main, cursor: 'pointer', mt: 0.5, '&:hover': { textDecoration: 'underline' } }}
                >
                    Elegir de la lista
                </Typography>
            </Box>
        ) : (
            <FormSelect
                label="Departamento" name="departamento" value={form.departamento}
                onChange={handleDepartamentoSelectChange}
                onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                required error={errores.departamento} helperText={errores.departamento}
            >
                {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                <MenuItem value={OTRO_DEPARTAMENTO}>Otro departamento…</MenuItem>
            </FormSelect>
        )}
        {(ciudadOtra || departamentoOtro) ? (
            <Box>
                <FormField
                    label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange}
                    onBlur={() => setErrores(prev => ({ ...prev, ciudad: validarCampo('ciudad', form) || validarCiudadDup(form.ciudad) }))}
                    required error={errores.ciudad} helperText={errores.ciudad || 'Ciudad nueva — no está en la lista todavía'}
                    icon={LocationOnOutlinedIcon} inputProps={{ maxLength: 60 }}
                    placeholder="Escribe la ciudad"
                />
                {!departamentoOtro && (
                    <Typography
                        onClick={() => { setCiudadOtra(false); setForm(prev => ({ ...prev, ciudad: '' })) }}
                        sx={{ fontSize: '0.75rem', color: theme.palette.primary.main, cursor: 'pointer', mt: 0.5, '&:hover': { textDecoration: 'underline' } }}
                    >
                        Elegir de la lista
                    </Typography>
                )}
            </Box>
        ) : (
            <FormSelect
                label="Ciudad" name="ciudad" value={form.ciudad}
                onChange={handleCiudadSelectChange}
                onBlur={() => setErrores(prev => ({ ...prev, ciudad: validarCampo('ciudad', form) || validarCiudadDup(form.ciudad) }))}
                required error={errores.ciudad} helperText={errores.ciudad}
                disabled={!form.departamento}
            >
                {(CIUDADES_POR_DEPARTAMENTO[form.departamento] || []).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                <MenuItem value={OTRA_CIUDAD}>Otra ciudad…</MenuItem>
            </FormSelect>
        )}
        <Box sx={{ gridColumn: '1 / -1' }}>
            <FormField
                label="Dirección de la oficina" name="direccion" value={form.direccion} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, direccion: validarCampo('direccion', form) }))}
                error={errores.direccion}
                helperText={errores.direccion || `Opcional · ${(form.direccion || '').length}/200`}
                icon={HomeOutlinedIcon} inputProps={{ maxLength: 200 }}
                placeholder="Ej: Calle 30 #12-45, local 2"
            />
        </Box>
    </Box>
)

export default PasoUbicacion
