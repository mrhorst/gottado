import { Routes, Route, Navigate } from 'react-router-native'
import LoginScreen from '../screens/LoginScreen'
import TasksScreen from '../screens/TasksScreen'
import ProtectedRoute from './ProtectedRoute'
import DashboardScreen from '../screens/DashboardScreen'
import ProfileScreen from '../screens/ProfileScreen'
import NewTaskScreen from '../screens/NewTaskScreen'

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/dashboard' replace />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route
        path='/dashboard'
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
      <Route
        path='/tasks/new'
        element={
          <ProtectedRoute>
            <NewTaskScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  )
}
