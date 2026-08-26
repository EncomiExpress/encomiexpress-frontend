import { Box, Typography, TextField, Alert, Autocomplete, Avatar, Divider } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import PlacaDisplay from '../../../../shared/components/PlacaDisplay.jsx'
import { FormField } from '../../../../shared/components/FormularioEstandarizado.jsx'
import { formFieldStyles } from '../../../../shared/utils/formStyles.js'
import { normalizarTexto } from '../../../../shared/utils/duplicados.js'
import { formatearMoneda } from '../../../../shared/utils/formatters.js'
import { validarCampo } from '../../utils/anticipoValidation.js'

const PasoRutaVehiculo = ({
    theme, form, errores, setErrores, setForm, handleChange,
    rutas, rutaSeleccionada, pares, parSeleccionado,
    rutaInput, setRutaInput, parInput, setParInput,
    getEtiquetaRuta, afterChange = () => { },
    rutaDisabled = false, parDisabled, valorDisabled = false, fechaDisabled = false,
    rutaHelperTextOk, rutaHelperTextDisabled, parHelperTextDisabled, valorHelperTextDisabled, fechaHelperTextDisabled,
    mostrarAdvertencia,
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Autocomplete
            options={rutas}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            disabled={rutaDisabled}
            getOptionLabel={getEtiquetaRuta}
            isOptionEqualToValue={(opt, val) => opt.idRuta === val.idRuta}
            value={rutaSeleccionada || null}
            inputValue={rutaInput}
            onInputChange={(_, newVal, reason) => {
                if (reason === 'input') setRutaInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s\-_]/g, ''))
                else setRutaInput(newVal)
            }}
            onChange={(_, val) => {
                setForm(prev => ({ ...prev, idRuta: val ? val.idRuta : '', idRutaVehiculoConductor: '' }))
                setErrores(prev => ({
                    ...prev,
                    idRuta: val ? '' : (prev.idRuta ? validarCampo('idRuta', { idRuta: '' }) : prev.idRuta),
                    idRutaVehiculoConductor: '',
                }))
                setParInput('')
                afterChange()
            }}
            onBlur={() => setErrores(prev => ({ ...prev, idRuta: validarCampo('idRuta', form) }))}
            renderOption={(props, r) => {
                const { key, ...rest } = props
                return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                            width: 34, height: 34, flexShrink: 0,
                            backgroundColor: theme.palette.avatarDefault.bg,
                            color: theme.palette.avatarDefault.color,
                        }}>
                            <RouteOutlinedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                            {r.nombre} → {r.destino?.ciudad || 'Sin destino'}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.text.secondary} sx={{ flexShrink: 0 }}>
                            ${Number(r.destino?.tarifaBase || 0).toLocaleString('es-CO')}
                        </Typography>
                    </Box>
                )
            }}
            filterOptions={(opts, { inputValue }) => {
                if (!inputValue.trim()) return [...opts].sort((a, b) => b.idRuta - a.idRuta).slice(0, 5)
                const q = normalizarTexto(inputValue)
                return opts.filter(r =>
                    normalizarTexto(r.nombre).includes(q) ||
                    normalizarTexto(r.destino?.ciudad || '').includes(q) ||
                    normalizarTexto(r.destino?.departamento || '').includes(q)
                )
            }}
            noOptionsText="No se encontraron rutas"
            renderInput={(params) => (
                <TextField {...params} label="Ruta *"
                    error={!!errores.idRuta}
                    helperText={errores.idRuta || (rutaDisabled ? rutaHelperTextDisabled : rutaHelperTextOk)}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { ...params.inputProps, maxLength: 100 } }}
                    sx={formFieldStyles} />
            )}
        />

        <Autocomplete
            options={pares}
            popupIcon={<KeyboardArrowDownOutlinedIcon />}
            disabled={parDisabled}
            getOptionLabel={(p) => `${p.placa || 'Sin placa'} — ${p.conductorNombre}`}
            isOptionEqualToValue={(opt, val) => opt.idRutaVehiculoConductor === val.idRutaVehiculoConductor}
            value={parSeleccionado || null}
            inputValue={parInput}
            onInputChange={(_, newVal, reason) => {
                if (reason === 'input') setParInput(newVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s\-_]/g, ''))
                else setParInput(newVal)
            }}
            onChange={(_, val) => {
                setForm(prev => ({ ...prev, idRutaVehiculoConductor: val ? val.idRutaVehiculoConductor : '' }))
                setErrores(prev => ({
                    ...prev,
                    idRutaVehiculoConductor: val ? '' : (prev.idRutaVehiculoConductor ? validarCampo('idRutaVehiculoConductor', { idRutaVehiculoConductor: '' }) : prev.idRutaVehiculoConductor),
                }))
                afterChange()
            }}
            onBlur={() => setErrores(prev => ({ ...prev, idRutaVehiculoConductor: validarCampo('idRutaVehiculoConductor', form) }))}
            renderOption={(props, p) => {
                const { key, ...rest } = props
                const iniciales = (p.conductorNombre || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                return (
                    <Box component="li" key={key} {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PlacaDisplay placa={p.placa} theme={theme} />
                        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Avatar sx={{
                                width: 28, height: 28, flexShrink: 0,
                                backgroundColor: theme.palette.avatarDefault.bg,
                                color: theme.palette.avatarDefault.color,
                                fontSize: '0.68rem', fontWeight: 700,
                            }}>
                                {iniciales}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
                                {p.conductorNombre}
                            </Typography>
                        </Box>
                    </Box>
                )
            }}
            noOptionsText={form?.idRuta ? 'No hay vehículos en esta ruta' : 'Primero selecciona una ruta'}
            renderInput={(params) => (
                <TextField {...params} label="Vehículo y conductor *"
                    error={!!errores.idRutaVehiculoConductor}
                    helperText={errores.idRutaVehiculoConductor || (parDisabled ? parHelperTextDisabled : 'Elige a cuál vehículo/conductor de la ruta corresponde este anticipo')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={formFieldStyles} />
            )}
        />

        {mostrarAdvertencia && (
            <Alert severity="warning" sx={{ borderRadius: 2, mt: -1 }}>
                Este vehículo no tiene paquetes asignados en esta ruta — el anticipo se registrará igual, solo confírmalo a propósito.
            </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <FormField
                label="Valor del anticipo (COP)"
                name="valorAnticipo"
                value={formatearMoneda(form?.valorAnticipo)}
                onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, valorAnticipo: validarCampo('valorAnticipo', form) }))}
                required
                disabled={valorDisabled}
                icon={AttachMoneyOutlinedIcon}
                placeholder="Ej: 500.000"
                error={errores.valorAnticipo}
                helperText={errores.valorAnticipo || (valorDisabled ? valorHelperTextDisabled : 'Valor en pesos colombianos')}
                inputProps={{ maxLength: 11 }}
            />
            <TextField
                fullWidth label="Fecha de entrega" name="fechaEntrega" type="date"
                value={form?.fechaEntrega || ''} onChange={handleChange}
                onBlur={() => setErrores(prev => ({ ...prev, fechaEntrega: validarCampo('fechaEntrega', form) }))} required
                disabled={fechaDisabled}
                error={!!errores.fechaEntrega}
                helperText={errores.fechaEntrega || (fechaDisabled ? fechaHelperTextDisabled : undefined)}
                slotProps={{ inputLabel: { shrink: true } }} sx={formFieldStyles}
            />
        </Box>
    </Box>
)

export default PasoRutaVehiculo
