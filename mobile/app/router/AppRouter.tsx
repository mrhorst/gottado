import { Routes, Route, Navigate } from 'react-router-native'
import LoginScreen from '../screens/LoginScreen'
import TasksScreen from '../screens/TasksScreen'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/tasks' replace />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route
        path='/tasks'
        element={
          <ProtectedRoute>
            <TasksScreen />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/tasks' replace />} />
    </Routes>
  )
}
