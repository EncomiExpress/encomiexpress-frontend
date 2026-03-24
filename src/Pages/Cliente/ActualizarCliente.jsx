import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, Paper, Grid, MenuItem, Alert, Snackbar } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useClientes } from '../../Context/ClienteContext'
import { 
  theme, FormField, FormSelect, PrimaryButton, SecondaryButton, 
  FormAlert, FormHeader, FormFieldsContainer, FormButtonGroup 
} from '../../Components/FormularioEstandarizado'

const ActualizarCliente = () => {
  const { id } = useParams()
  const { clientes, actualizarCliente } = useClientes()
  const navigate = useNavigate()
  const [exito, setExito] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    habilitado: true
  })

  // Carga los datos del cliente cuando llega el id
  useEffect(() => {
    const cliente = clientes.find(c => c.idCliente === parseInt(id))
    if (cliente) {
      setForm(cliente)
    } else {
      navigate('/clientes/listar') // si no existe el id, regresa al listar
    }
  }, [id, clientes, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    const soloNumeros = /^\d+$/
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio'
    else if (!soloLetras.test(form.nombre))
      e.nombre = 'El nombre solo puede contener letras'

    if (!form.apellido.trim())
      e.apellido = 'El apellido es obligatorio'
    else if (!soloLetras.test(form.apellido))
      e.apellido = 'El apellido solo puede contener letras'

    if (!form.tipoIdentificacion)
      e.tipoIdentificacion = 'Selecciona un tipo de documento'

    if (!form.numeroIdentificacion.trim())
      e.numeroIdentificacion = 'El número de documento es obligatorio'
    else if (!soloNumeros.test(form.numeroIdentificacion))
      e.numeroIdentificacion = 'Solo se permiten números'

    if (!form.telefono.trim())
      e.telefono = 'El teléfono es obligatorio'
    else if (!/^\d{10}$/.test(form.telefono))
      e.telefono = 'El teléfono debe tener exactamente 10 dígitos'

    if (!form.email.trim())
      e.email = 'El correo es obligatorio'
    else if (!emailValido.test(form.email))
      e.email = 'Ingresa un correo electrónico válido'

    if (!form.direccion.trim())
      e.direccion = 'La dirección es obligatoria'

    if (!form.ciudad.trim())
      e.ciudad = 'La ciudad es obligatoria'
    else if (!soloLetras.test(form.ciudad))
      e.ciudad = 'La ciudad solo puede contener letras'

    return e
  }

  const handleSubmit = () => {
    const erroresEncontrados = validar()

    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados)
      return
    }

    actualizarCliente(form)
    setExito(true)
    setTimeout(() => navigate('/clientes/listar'), 1500)
  }

  const handleCancelar = () => {
    navigate('/clientes/listar')
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 900, mx: 'auto' }}>

        {/* Título */}
        <FormHeader 
          icon={EditIcon} 
          title="Actualizar Cliente" 
          subtitle={`ID: ${id} — Modifica los campos que necesites`}
        />

        {/* Formulario */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Nombres"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              error={errores.nombre}
              helperText={errores.nombre}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Apellidos"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              error={errores.apellido}
              helperText={errores.apellido}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormSelect
              label="Tipo de documento"
              name="tipoIdentificacion"
              value={form.tipoIdentificacion}
              onChange={handleChange}
              required
              error={errores.tipoIdentificacion}
            >
              <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
              <MenuItem value="TI">Tarjeta de Identidad</MenuItem>
              <MenuItem value="NIT">NIT</MenuItem>
              <MenuItem value="CE">Cédula Extranjería</MenuItem>
            </FormSelect>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Número de documento"
              name="numeroIdentificacion"
              value={form.numeroIdentificacion}
              onChange={handleChange}
              required
              error={errores.numeroIdentificacion}
              helperText={errores.numeroIdentificacion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
              error={errores.telefono}
              helperText={errores.telefono}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              error={errores.email}
              helperText={errores.email}
            />
          </Grid>

          <Grid item xs={12}>
            <FormField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
              error={errores.direccion}
              helperText={errores.direccion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              required
              error={errores.ciudad}
              helperText={errores.ciudad}
            />
          </Grid>
        </Grid>

        {/* Botones */}
        <FormButtonGroup>
          <SecondaryButton 
            onClick={handleCancelar}
            children="Cancelar"
          />
          <PrimaryButton 
            onClick={handleSubmit}
            children="Guardar cambios"
          />
        </FormButtonGroup>

      </Paper>

      {/* Mensaje de éxito */}
      <Snackbar open={exito} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontWeight: 600 }}>
          ¡Cliente actualizado exitosamente!
        </Alert>
      </Snackbar>

    </Box>
  )
}

export default ActualizarCliente
