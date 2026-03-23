import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Paper, Grid, MenuItem,
  Snackbar, Alert
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useClientes } from '../../Context/ClienteContext'

const theme = {
  primary: '#CC1818',
  secondary: '#1A2E6E'
}

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
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>

        {/* Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <EditIcon sx={{ color: theme.primary, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ color: theme.secondary, fontWeight: 'bold' }}>
              Actualizar Cliente
            </Typography>
            <Typography variant="caption" sx={{ color: '#8A94A6' }}>
              ID: {id} — Modifica los campos que necesites
            </Typography>
          </Box>
        </Box>

        {/* Formulario */}
        <Grid container spacing={3}>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombres"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.nombre}
              helperText={errores.nombre}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellidos"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.apellido}
              helperText={errores.apellido}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Tipo de documento"
              name="tipoIdentificacion"
              value={form.tipoIdentificacion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.tipoIdentificacion}
              helperText={errores.tipoIdentificacion}
            >
              <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
              <MenuItem value="TI">Tarjeta de Identidad</MenuItem>
              <MenuItem value="NIT">NIT</MenuItem>
              <MenuItem value="CE">Cédula Extranjería</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de documento"
              name="numeroIdentificacion"
              value={form.numeroIdentificacion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.numeroIdentificacion}
              helperText={errores.numeroIdentificacion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.telefono}
              helperText={errores.telefono}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Correo electrónico"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              type="email"
              error={!!errores.email}
              helperText={errores.email}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.direccion}
              helperText={errores.direccion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errores.ciudad}
              helperText={errores.ciudad}
            />
          </Grid>

        </Grid>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancelar}
            sx={{ borderColor: theme.secondary, color: theme.secondary }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleSubmit}
            sx={{ backgroundColor: theme.primary, '&:hover': { backgroundColor: '#a01212' } }}
          >
            Guardar cambios
          </Button>
        </Box>

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