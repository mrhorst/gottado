import { useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { useAuth } from '../context/auth/AuthContext'
import { useLocation, useNavigate } from 'react-router-native'
import styles from './styles'
import api from '../services/api'
import { Stack } from 'expo-router'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  const onSubmit = async () => {
    const { data } = await api.post('/login', { email, password })
    await login(data.token)

    const redirectTo = location.state?.from ?? '/dashboard'

    nav(redirectTo, { replace: true })
  }

  return (
    <View style={styles.screenContainer}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
        style={styles.input}
        placeholder='Email'
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholder='Password'
      />
      <Button title='Sign in' onPress={onSubmit} />
      <Stack.Screen options={{ title: 'Login' }} />
    </View>
  )
}
export default LoginScreen
