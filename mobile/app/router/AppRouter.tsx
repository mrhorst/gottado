import { Routes, Route, Navigate } from 'react-router-native'
import LoginScreen from '../screens/auth/LoginScreen'
import TasksScreen from '../screens/tasks/TasksScreen'
import ProtectedRoute from './ProtectedRoute'
import DashboardScreen from '../screens/DashboardScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import NewTaskScreen from '../screens/tasks/NewTaskScreen'
import AddSectionMemberScreen from '../screens/sections/AddSectionMemberScreen'
import SectionDetailScreen from '../screens/sections/SectionDetailScreen'
import SectionListScreen from '../screens/sections/SectionListScreen'
import SignupScreen from '../screens/auth/SignupScreen'

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/dashboard' replace />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/signup' element={<SignupScreen />} />
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
        path='/sections'
        element={
          <ProtectedRoute>
            <SectionListScreen />
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
      <Route
        path='/sections/:id'
        element={
          <ProtectedRoute>
            <SectionDetailScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path='/sections/:id/add-member'
        element={
          <ProtectedRoute>
            <AddSectionMemberScreen />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  )
}
