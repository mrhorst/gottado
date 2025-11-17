import { NativeRouter } from 'react-router-native'

import AppRouter from './router/AppRouter'
import AuthProvider from './auth/AuthContext'

const v7_flag = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
}

export default function Index() {
  return (
    <AuthProvider>
      <NativeRouter future={v7_flag}>
        <AppRouter />
      </NativeRouter>
    </AuthProvider>
  )
}
