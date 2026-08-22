import { Route } from 'react-router-dom'
import Login from './Login.jsx'
import ResetearPassword from './ResetearPassword.jsx'

const authRoutes = [
  // Login sin layout público
  <Route key="login" path="/login" element={<Login />} />,
  // Sin enlace en ningún menú — se llega vía el correo de "¿Olvidaste tu contraseña?"
  <Route key="resetear-password" path="/resetear-password" element={<ResetearPassword />} />,
]

export default authRoutes
