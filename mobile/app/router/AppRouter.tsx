import { Routes, Route, Navigate } from 'react-router-native'
import LoginScreen from '../screens/LoginScreen'
import TasksScreen from '../screens/TasksScreen'
import ProtectedRoute from './ProtectedRoute'
import DashboardScreen from '../screens/DashboardScreen'

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/welcome' replace />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route
        path='/welcome'
        element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path='/tasks'
        element={
          <ProtectedRoute>
            <TasksScreen />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/welcome' replace />} />
    </Routes>
  )
}
