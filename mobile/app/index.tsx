import { NativeRouter } from 'react-router-native'

import AppRouter from './router/AppRouter'
import AuthProvider from './context/auth/AuthContext'
import UserProvider from './context/user/UserContext'

const v7_flag = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
}

export default function Index() {
  return (
    <AuthProvider>
      <UserProvider>
        <NativeRouter future={v7_flag}>
          <AppRouter />
        </NativeRouter>
      </UserProvider>
    </AuthProvider>
  )
}
