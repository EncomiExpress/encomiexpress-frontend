import { useState, useEffect, useMemo } from 'react'
import { Box, Autocomplete, TextField, Typography, Link } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { getDepartamentosColombia, getMunicipiosColombia } from '../../services/colombiaService.js'
import { validarCampo } from '../../validations/destinoValidation.js'

const PasoUbicacion = ({
    form, setForm, errores, setErrores, handleChange,
    validarMunicipioDup,
}) => {
    const [departamentos, setDepartamentos] = useState([])
    const [loadingDepartamentos, setLoadingDepartamentos] = useState(true)
    const [errorDepartamentos, setErrorDepartamentos] = useState('')
    const [intentoDepartamentos, setIntentoDepartamentos] = useState(0)

    const [municipios, setMunicipios] = useState([])
    const [loadingMunicipios, setLoadingMunicipios] = useState(false)
    const [errorMunicipios, setErrorMunicipios] = useState('')
    const [intentoMunicipios, setIntentoMunicipios] = useState(0)

    useEffect(() => {
        let cancelado = false
        const cargar = async () => {
            setLoadingDepartamentos(true)
            setErrorDepartamentos('')
            try {
                const data = await getDepartamentosColombia()
                if (!cancelado) setDepartamentos(data)
            } catch {
                if (!cancelado) setErrorDepartamentos('No se pudo cargar la lista de departamentos.')
            } finally {
                if (!cancelado) setLoadingDepartamentos(false)
            }
        }
        cargar()
        return () => { cancelado = true }
    }, [intentoDepartamentos])

    // El form solo guarda el NOMBRE del departamento (así queda en la BD, ver
    // destino.js) — el id de API-Colombia se deriva del nombre solo para saber a
    // cuál departamento pedirle los municipios. Mientras los departamentos no hayan
    // cargado (o en Actualizar, mientras no encuentre el nombre ya guardado) queda
    // undefined y el efecto de abajo simplemente espera.
    const departamentoId = useMemo(
        () => departamentos.find(d => d.nombre === form.departamento)?.id,
        [departamentos, form.departamento]
    )

    useEffect(() => {
        if (departamentoId === undefined) return
        let cancelado = false
        const cargar = async () => {
            setLoadingMunicipios(true)
            setErrorMunicipios('')
            try {
                const data = await getMunicipiosColombia(departamentoId)
                if (!cancelado) setMunicipios(data)
            } catch {
                if (!cancelado) setErrorMunicipios('No se pudo cargar la lista de municipios.')
            } finally {
                if (!cancelado) setLoadingMunicipios(false)
            }
        }
        cargar()
        return () => { cancelado = true }
    }, [departamentoId, intentoMunicipios])

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <Box>
                <Autocomplete
                    options={departamentos}
                    getOptionLabel={(d) => d.nombre}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    value={departamentos.find(d => d.nombre === form.departamento) || null}
                    loading={loadingDepartamentos}
                    loadingText="Cargando departamentos..."
                    noOptionsText={errorDepartamentos || 'Sin resultados'}
                    disabled={!!errorDepartamentos}
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    onChange={(_, nuevo) => {
                        // Cambiar de departamento invalida el municipio ya elegido (era de
                        // otro departamento) — se limpia junto con su error. Los municipios
                        // viejos se limpian solos: el efecto de arriba reacciona a
                        // departamentoId y pide los nuevos.
                        setForm(prev => ({ ...prev, departamento: nuevo?.nombre || '', municipio: '' }))
                        setErrores(prev => ({ ...prev, departamento: undefined, municipio: undefined }))
                        setMunicipios([])
                    }}
                    onBlur={() => setErrores(prev => ({ ...prev, departamento: validarCampo('departamento', form) }))}
                    renderInput={(params) => (
                        <TextField {...params} label="Departamento *"
                            error={!!errores.departamento}
                            helperText={errores.departamento || ' '}
                            sx={formFieldStyles} />
                    )}
                />
                {errorDepartamentos && (
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: -0.5 }}>
                        {errorDepartamentos}{' '}
                        <Link component="button" type="button" onClick={() => setIntentoDepartamentos(n => n + 1)} sx={{ fontWeight: 600 }}>
                            Reintentar
                        </Link>
                    </Typography>
                )}
            </Box>

            <Box>
                <Autocomplete
                    options={municipios}
                    getOptionLabel={(m) => m.nombre}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    value={municipios.find(m => m.nombre === form.municipio) || null}
                    loading={loadingMunicipios}
                    loadingText="Cargando municipios..."
                    noOptionsText={errorMunicipios || 'Sin resultados'}
                    disabled={!form.departamento || !!errorMunicipios}
                    popupIcon={<KeyboardArrowDownOutlinedIcon />}
                    onChange={(_, nuevo) => {
                        const municipio = nuevo?.nombre || ''
                        setForm(prev => ({ ...prev, municipio }))
                        setErrores(prev => ({ ...prev, municipio: validarCampo('municipio', { ...form, municipio }) || validarMunicipioDup(municipio) }))
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Municipio *"
                            error={!!errores.municipio}
                            helperText={errores.municipio || (form.departamento ? ' ' : 'Completa primero el departamento')}
                            sx={formFieldStyles} />
                    )}
                />
                {errorMunicipios && (
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: -0.5 }}>
                        {errorMunicipios}{' '}
                        <Link component="button" type="button" onClick={() => setIntentoMunicipios(n => n + 1)} sx={{ fontWeight: 600 }}>
                            Reintentar
                        </Link>
                    </Typography>
                )}
            </Box>

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
}

export default PasoUbicacion
