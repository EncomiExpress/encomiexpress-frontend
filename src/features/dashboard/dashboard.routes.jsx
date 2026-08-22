import { Route } from 'react-router-dom'
import PrivateRoute from '../../shared/layouts/PrivateRoute.jsx'
import Dashboard from './Dashboard.jsx'

const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />,
]

export default dashboardRoutes
